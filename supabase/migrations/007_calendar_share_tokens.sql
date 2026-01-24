-- Calendar share tokens for public shareable calendar URLs
CREATE TABLE calendar_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- Index for fast token lookups
CREATE INDEX idx_calendar_share_tokens_token ON calendar_share_tokens(token);

-- RLS: Owners can manage their own tokens
ALTER TABLE calendar_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens" ON calendar_share_tokens
  FOR ALL USING (auth.uid() = user_id);
