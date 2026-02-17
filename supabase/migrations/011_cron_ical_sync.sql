-- 011: Automatic hourly iCal sync via pg_cron
-- Prerequisites: Store project URL and anon key in Supabase Vault via SQL Editor:
--   SELECT vault.create_secret('https://YOUR_PROJECT.supabase.co', 'project_url');
--   SELECT vault.create_secret('YOUR_ANON_KEY', 'supabase_anon_key');

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule hourly sync of all active iCal subscriptions
-- The sync-ical-feeds edge function already handles syncing all active
-- subscriptions when called without a subscriptionId in the body.
SELECT cron.schedule(
  'sync-ical-feeds-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/sync-ical-feeds',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
