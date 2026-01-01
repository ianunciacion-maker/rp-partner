-- Locked dates table for blocking availability
-- Run this in Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS locked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate locks for same property/date
  UNIQUE(property_id, date)
);

-- Enable RLS
ALTER TABLE locked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own locked dates
CREATE POLICY "Users can view own locked dates"
  ON locked_dates FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create locked dates for their properties
CREATE POLICY "Users can create locked dates"
  ON locked_dates FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND user_id = auth.uid())
  );

-- Policy: Users can delete their own locked dates
CREATE POLICY "Users can delete own locked dates"
  ON locked_dates FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_locked_dates_property ON locked_dates(property_id);
CREATE INDEX idx_locked_dates_user ON locked_dates(user_id);
CREATE INDEX idx_locked_dates_date ON locked_dates(date);
