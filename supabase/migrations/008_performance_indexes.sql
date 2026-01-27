-- Performance indexes for common query patterns

-- Index for subscription lookups by user and status (used in check-subscriptions)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status);

-- Index for subscription reminder checks (used in check-subscriptions)
CREATE INDEX IF NOT EXISTS idx_subscription_reminders_sub_type
ON subscription_reminders(subscription_id, reminder_type);

-- Index for locked dates by property (used in calendar views)
CREATE INDEX IF NOT EXISTS idx_locked_dates_property
ON locked_dates(property_id);

-- Index for calendar share token lookups (used in get-shared-calendar)
CREATE INDEX IF NOT EXISTS idx_calendar_share_tokens_token
ON calendar_share_tokens(token);

-- Index for reservations by property and date range (used in calendar views)
CREATE INDEX IF NOT EXISTS idx_reservations_property_dates
ON reservations(property_id, check_in, check_out);

-- Index for cashflow entries by property and date (used in cashflow reports)
CREATE INDEX IF NOT EXISTS idx_cashflow_entries_property_date
ON cashflow_entries(property_id, transaction_date);
