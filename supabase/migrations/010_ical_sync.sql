-- iCal Calendar Sync tables and locked_dates extension
-- Run this in Supabase Dashboard SQL Editor

-- 1. Add columns to locked_dates for external calendar events
ALTER TABLE locked_dates ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE locked_dates ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE locked_dates ADD COLUMN IF NOT EXISTS external_uid TEXT;
ALTER TABLE locked_dates ADD COLUMN IF NOT EXISTS subscription_id UUID;

-- 2. Create ical_subscriptions table
CREATE TABLE IF NOT EXISTS ical_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_url TEXT NOT NULL,
  source_name TEXT NOT NULL DEFAULT 'other',
  source_label TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  last_sync_status TEXT DEFAULT 'pending',
  last_error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add foreign key from locked_dates to ical_subscriptions
ALTER TABLE locked_dates
  ADD CONSTRAINT fk_locked_dates_subscription
  FOREIGN KEY (subscription_id)
  REFERENCES ical_subscriptions(id)
  ON DELETE CASCADE;

-- 4. Create ical_feed_tokens table (for export)
CREATE TABLE IF NOT EXISTS ical_feed_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Drop the unique constraint on locked_dates that would conflict with external imports
-- The existing constraint is UNIQUE(property_id, date) but external imports
-- can have multiple entries for the same date from different subscriptions.
-- We replace it with a partial unique constraint for manual locks only.
ALTER TABLE locked_dates DROP CONSTRAINT IF EXISTS locked_dates_property_id_date_key;
CREATE UNIQUE INDEX idx_locked_dates_manual_unique
  ON locked_dates(property_id, date)
  WHERE source = 'manual';

-- 6. Indexes
CREATE INDEX idx_ical_subscriptions_property ON ical_subscriptions(property_id);
CREATE INDEX idx_ical_subscriptions_user ON ical_subscriptions(user_id);
CREATE INDEX idx_ical_subscriptions_active ON ical_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX idx_ical_feed_tokens_token ON ical_feed_tokens(token);
CREATE INDEX idx_ical_feed_tokens_property ON ical_feed_tokens(property_id);
CREATE INDEX idx_locked_dates_subscription ON locked_dates(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_locked_dates_source ON locked_dates(source) WHERE source = 'external';

-- 7. RLS for ical_subscriptions
ALTER TABLE ical_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON ical_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON ical_subscriptions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own subscriptions"
  ON ical_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions"
  ON ical_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- 8. RLS for ical_feed_tokens
ALTER TABLE ical_feed_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feed tokens"
  ON ical_feed_tokens FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create feed tokens"
  ON ical_feed_tokens FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own feed tokens"
  ON ical_feed_tokens FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own feed tokens"
  ON ical_feed_tokens FOR DELETE
  USING (user_id = auth.uid());
