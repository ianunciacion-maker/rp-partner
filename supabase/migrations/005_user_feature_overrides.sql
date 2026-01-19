-- Add user-level feature overrides for admin control
-- These allow admins to grant extended access to specific users
-- NULL means use the plan's default limits
-- A value overrides the plan limit for that user

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS calendar_months_override INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS report_months_override INTEGER DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.calendar_months_override IS 'Admin override for calendar months access. NULL = use plan default, number = override limit, -1 = unlimited';
COMMENT ON COLUMN users.report_months_override IS 'Admin override for report months access. NULL = use plan default, number = override limit, -1 = unlimited';
