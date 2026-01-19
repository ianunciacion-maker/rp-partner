-- Track multiple reminders per subscription
-- This enables multi-stage reminder system (7, 3, 1 days before + grace period reminders)

CREATE TABLE subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'expiring_7_days',
    'expiring_3_days',
    'expiring_1_day',
    'grace_period_start',
    'grace_period_day_2',
    'grace_period_final',
    'expired'
  )),
  channel TEXT NOT NULL DEFAULT 'push' CHECK (channel IN ('push', 'in_app')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX idx_reminders_subscription ON subscription_reminders(subscription_id);
CREATE INDEX idx_reminders_type ON subscription_reminders(reminder_type);
CREATE INDEX idx_reminders_user ON subscription_reminders(user_id);

-- Enable Row Level Security
ALTER TABLE subscription_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY "Users view own reminders"
  ON subscription_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert reminders (service role bypasses RLS)
CREATE POLICY "System inserts reminders"
  ON subscription_reminders
  FOR INSERT
  WITH CHECK (true);

-- Admins can manage all reminders
CREATE POLICY "Admins manage reminders"
  ON subscription_reminders
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Add last_reminder_type column to subscriptions table for quick lookup
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS last_reminder_type TEXT;
