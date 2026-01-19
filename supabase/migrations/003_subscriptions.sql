-- Subscription System Migration
-- Adds freemium model with manual payment verification

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- 'free', 'premium'
  display_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  calendar_months_limit INTEGER,  -- NULL = unlimited, 2 for free
  report_months_limit INTEGER,    -- NULL = unlimited, 2 for free
  property_limit INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods with QR codes
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,  -- 'gcash', 'maya', 'bank_transfer'
  display_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT,
  qr_code_url TEXT,  -- Supabase Storage URL
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'grace_period', 'cancelled')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  grace_period_end TIMESTAMPTZ,  -- 3 days after current_period_end
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment submissions (screenshot uploads)
CREATE TABLE payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  amount DECIMAL(10,2) NOT NULL,
  screenshot_url TEXT NOT NULL,  -- Supabase Storage URL
  reference_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  months_purchased INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add current subscription reference to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_subscription_id UUID REFERENCES subscriptions(id);

-- Add push notification token to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Update users subscription_status check constraint to include new values
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
ALTER TABLE users ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled', 'expired', 'grace_period', 'free'));

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);
CREATE INDEX idx_payment_submissions_status ON payment_submissions(status, created_at);
CREATE INDEX idx_payment_submissions_user ON payment_submissions(user_id);

-- Seed subscription plans
INSERT INTO subscription_plans (name, display_name, price_monthly, calendar_months_limit, report_months_limit, property_limit) VALUES
  ('free', 'Free', 0, 2, 2, 1),
  ('premium', 'Premium', 499, NULL, NULL, 10);

-- Seed payment methods
INSERT INTO payment_methods (name, display_name, account_name, instructions, sort_order) VALUES
  ('gcash', 'GCash', 'RP-Partner', 'Scan the QR code or send to the account number shown. Take a screenshot of your payment confirmation.', 1),
  ('maya', 'Maya', 'RP-Partner', 'Scan the QR code or send to the account number shown. Take a screenshot of your payment confirmation.', 2),
  ('bank_transfer', 'Bank Transfer (BDO)', 'RP-Partner Inc.', 'Transfer the amount to our BDO account. Take a screenshot of your payment confirmation including reference number.', 3);

-- RLS Policies for subscription_plans (public read)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON subscription_plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage plans" ON subscription_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for payment_methods (public read)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active payment methods" ON payment_methods FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage payment methods" ON payment_methods FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update subscriptions" ON subscriptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for payment_submissions
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own submissions" ON payment_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON payment_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON payment_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update submissions" ON payment_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Function to auto-update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the users table when subscription changes
  IF NEW.status = 'active' THEN
    UPDATE users SET
      subscription_status = 'active',
      subscription_expires_at = NEW.current_period_end,
      current_subscription_id = NEW.id,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'expired' THEN
    UPDATE users SET
      subscription_status = 'expired',
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'grace_period' THEN
    UPDATE users SET
      subscription_status = 'grace_period',
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_status_change
  AFTER INSERT OR UPDATE OF status ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscription_status();

-- Function to create default free subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;

  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    VALUES (
      NEW.id,
      free_plan_id,
      'active',
      NOW(),
      NOW() + INTERVAL '100 years'  -- Free plan never expires
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();
