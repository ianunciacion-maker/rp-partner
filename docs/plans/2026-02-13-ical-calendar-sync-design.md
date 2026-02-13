# iCal Calendar Sync Design

## Overview

Two-way iCal calendar sync for Tuknang properties. Users can import external calendars (Airbnb, VRBO, Booking.com) to auto-block dates, and export their Tuknang calendar as an iCal feed for external services to subscribe to.

## User Experience

### Setup (per property)
Navigate to Property Detail > "Calendar Sync" button > opens `property/[id]/sync` screen.

**Import section ("Sync from Airbnb/VRBO"):**
- Text input for iCal feed URL + source dropdown (Airbnb, VRBO, Booking.com, Other)
- List of active subscriptions: source icon, last synced time, status badge
- Swipe-to-delete to remove subscriptions
- Free users: 1 subscription per property. Paid: unlimited.

**Export section ("Share your Tuknang calendar"):**
- Toggle to enable/disable iCal feed
- Copy button for feed URL
- Instructions for pasting into Airbnb/VRBO/calendar apps

### Calendar display
- External blocks appear as locked dates with source tag (orange color, "Airbnb" label)
- Tap external lock > bottom sheet with date range, source, "Convert to Reservation" button
- Convert pre-fills check_in/check_out, opens reservation form for user to add guest details
- On conversion: locked dates deleted, real reservation created

## Data Model

### Migration: `010_ical_sync.sql`

**Table: `ical_subscriptions`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| property_id | UUID FK > properties | ON DELETE CASCADE |
| user_id | UUID FK > users | ON DELETE CASCADE |
| feed_url | TEXT NOT NULL | External iCal URL |
| source_name | TEXT NOT NULL | 'airbnb', 'vrbo', 'booking_com', 'other' |
| source_label | TEXT | User-friendly label, nullable |
| is_active | BOOLEAN DEFAULT true | |
| last_synced_at | TIMESTAMPTZ | Null until first sync |
| last_sync_status | TEXT DEFAULT 'pending' | 'success', 'error', 'pending' |
| last_error_message | TEXT | Nullable |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

RLS: Users manage only their own subscriptions (`user_id = auth.uid()`).

**Extend `locked_dates` table:**
| New Column | Type | Notes |
|------------|------|-------|
| source | TEXT DEFAULT 'manual' | 'manual' or 'external' |
| source_name | TEXT | 'airbnb', 'vrbo', etc. Nullable |
| external_uid | TEXT | VEVENT UID from iCal. Nullable |
| subscription_id | UUID FK > ical_subscriptions | ON DELETE CASCADE. Nullable |

Existing locked dates get `source = 'manual'` by default.

**Table: `ical_feed_tokens`**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| property_id | UUID FK > properties | ON DELETE CASCADE |
| user_id | UUID FK > users | ON DELETE CASCADE |
| token | TEXT UNIQUE NOT NULL | 32-char random string |
| is_active | BOOLEAN DEFAULT true | |
| created_at | TIMESTAMPTZ DEFAULT now() | |

RLS: Users manage only their own tokens (`user_id = auth.uid()`).

## Backend Architecture

### Edge Function: `ical-feed` (Export)
- **Endpoint**: `GET /functions/v1/ical-feed?token=<token>`
- No auth required (token in URL provides access)
- Validates token against `ical_feed_tokens`
- Fetches non-cancelled reservations + manual locked dates for property
- Generates `.ics` with VEVENT entries (date-only: DTSTART;VALUE=DATE / DTEND;VALUE=DATE)
- Returns `Content-Type: text/calendar; charset=utf-8`
- Does NOT include externally-imported locks (prevents circular sync)

### Edge Function: `sync-ical-feeds` (Import)
- **Endpoint**: `POST /functions/v1/sync-ical-feeds`
- Triggered by pg_cron every hour (`0 * * * *`)
- Uses service role key
- For each active subscription:
  1. Fetch the iCal URL
  2. Parse VEVENT entries (DTSTART, DTEND, UID, SUMMARY)
  3. Expand date ranges into individual locked_date rows
  4. Upsert into locked_dates matching on (subscription_id, external_uid, date)
  5. Delete locked_dates whose external_uid no longer appears in feed (cancelled bookings)
  6. Update subscription's last_synced_at and last_sync_status
- Error handling: mark errored subscriptions, continue processing others

### pg_cron schedule
```sql
SELECT cron.schedule('sync-ical-feeds', '0 * * * *', $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/sync-ical-feeds',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
$$);
```

## Subscription Gating

- Free users: 1 ical_subscription per property
- Paid users: unlimited subscriptions per property
- iCal export: available to all users
- New check in subscriptionStore: `useCanAddIcalSubscription(propertyId)`

## New Files

- `supabase/migrations/010_ical_sync.sql`
- `supabase/functions/ical-feed/index.ts`
- `supabase/functions/sync-ical-feeds/index.ts`
- `apps/mobile/app/property/[id]/sync.tsx` (sync management screen)
- `apps/mobile/services/icalSync.ts` (client-side service for managing subscriptions/tokens)
- `apps/mobile/types/database.ts` (extend with new types)

## Modified Files

- `apps/mobile/app/(tabs)/calendar.tsx` (render external locks distinctly)
- `apps/mobile/app/property/[id]/calendar.tsx` (render external locks distinctly)
- `apps/mobile/app/property/[id]/index.tsx` (add "Calendar Sync" button)
- `apps/mobile/stores/subscriptionStore.ts` (add sync gating check)
- `apps/mobile/constants/theme.ts` (add external booking color if needed)

## Decisions

- Extend locked_dates rather than separate table (external blocks appear in existing queries automatically)
- Separate ical_feed_tokens from calendar_share_tokens (different purposes, different lifecycles)
- Hourly polling via pg_cron (balances freshness vs. cost)
- Manual iCal parsing (Airbnb/VRBO feeds are simple; avoids Deno dependency issues)
- Export excludes externally-imported locks (prevents circular sync loops)
