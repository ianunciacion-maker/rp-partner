# iCal Calendar Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable two-way iCal calendar sync so Airbnb/VRBO bookings auto-block dates in Tuknang, and Tuknang calendars are exportable as iCal feeds.

**Architecture:** Supabase Edge Functions handle both import (polling external iCal feeds hourly via pg_cron) and export (serving .ics files via token-authenticated URLs). External bookings are stored as locked_dates with `source='external'` so they appear in all existing calendar queries automatically.

**Tech Stack:** Supabase Edge Functions (Deno), PostgreSQL migrations with RLS, React Native (Expo), Zustand, expo-router

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/010_ical_sync.sql`

**Step 1: Write the migration**

```sql
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

-- 9. Update locked_dates RLS to allow service role to manage external locks
-- (The service role already bypasses RLS, so no policy changes needed)
```

**Step 2: Commit**

```bash
git add supabase/migrations/010_ical_sync.sql
git commit -m "feat: add ical sync migration (subscriptions, feed tokens, extend locked_dates)"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `apps/mobile/types/database.ts`

**Step 1: Add new table types and extend LockedDate**

Add the following to the `Database` interface's `Tables` section (after `calendar_share_tokens`):

```typescript
// Inside Database > public > Tables, add:
      ical_subscriptions: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          feed_url: string;
          source_name: string;
          source_label: string | null;
          is_active: boolean;
          last_synced_at: string | null;
          last_sync_status: string;
          last_error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ical_subscriptions']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_synced_at' | 'last_sync_status' | 'last_error_message'>;
        Update: Partial<Database['public']['Tables']['ical_subscriptions']['Insert']>;
      };
      ical_feed_tokens: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          token: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ical_feed_tokens']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['ical_feed_tokens']['Insert']>;
      };
```

Update the existing `locked_dates` Row type to include the new columns:

```typescript
      locked_dates: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          date: string;
          reason: string | null;
          source: string;
          source_name: string | null;
          external_uid: string | null;
          subscription_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['locked_dates']['Row'], 'id' | 'created_at' | 'source'> & { source?: string };
        Update: Partial<Database['public']['Tables']['locked_dates']['Insert']>;
      };
```

Add type aliases at the bottom of the file (after existing aliases):

```typescript
export type IcalSubscription = Database['public']['Tables']['ical_subscriptions']['Row'];
export type IcalFeedToken = Database['public']['Tables']['ical_feed_tokens']['Row'];
```

**Step 2: Commit**

```bash
git add apps/mobile/types/database.ts
git commit -m "feat: add TypeScript types for ical sync tables"
```

---

### Task 3: iCal Feed Export Edge Function

**Files:**
- Create: `supabase/functions/ical-feed/index.ts`

**Step 1: Write the edge function**

This function serves a `.ics` file for a given property via a token-authenticated URL. External services (Airbnb, Google Calendar) subscribe to this URL.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDateToIcal(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Missing token parameter', { status: 400, headers: corsHeaders });
    }

    const { data: feedToken, error: tokenError } = await supabase
      .from('ical_feed_tokens')
      .select('id, property_id, user_id, is_active')
      .eq('token', token)
      .single();

    if (tokenError || !feedToken) {
      return new Response('Invalid token', { status: 404, headers: corsHeaders });
    }

    if (!feedToken.is_active) {
      return new Response('Feed has been deactivated', { status: 403, headers: corsHeaders });
    }

    const { data: property } = await supabase
      .from('properties')
      .select('id, name')
      .eq('id', feedToken.property_id)
      .single();

    if (!property) {
      return new Response('Property not found', { status: 404, headers: corsHeaders });
    }

    const [{ data: reservations }, { data: lockedDates }] = await Promise.all([
      supabase
        .from('reservations')
        .select('id, check_in, check_out, status')
        .eq('property_id', property.id)
        .not('status', 'in', '("cancelled","no_show")'),
      supabase
        .from('locked_dates')
        .select('id, date, reason, source')
        .eq('property_id', property.id)
        .eq('source', 'manual'),
    ]);

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//Tuknang//Rental Calendar//EN`,
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${property.name} - Tuknang`,
    ];

    for (const r of (reservations || [])) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:reservation-${r.id}@tuknang.com`,
        `DTSTART;VALUE=DATE:${formatDateToIcal(r.check_in)}`,
        `DTEND;VALUE=DATE:${formatDateToIcal(r.check_out)}`,
        `SUMMARY:Booked`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        'END:VEVENT',
      );
    }

    const lockGroups = new Map<string, { start: string; end: string; reason: string | null }>();
    const sortedLocks = [...(lockedDates || [])].sort((a, b) => a.date.localeCompare(b.date));

    let currentGroup: { start: string; end: string; reason: string | null } | null = null;
    for (const lock of sortedLocks) {
      if (currentGroup && lock.date === addDays(currentGroup.end, 1) && lock.reason === currentGroup.reason) {
        currentGroup.end = lock.date;
      } else {
        if (currentGroup) {
          lockGroups.set(currentGroup.start, currentGroup);
        }
        currentGroup = { start: lock.date, end: lock.date, reason: lock.reason };
      }
    }
    if (currentGroup) {
      lockGroups.set(currentGroup.start, currentGroup);
    }

    for (const [, group] of lockGroups) {
      const endDate = addDays(group.end, 1);
      lines.push(
        'BEGIN:VEVENT',
        `UID:locked-${group.start}-${group.end}@tuknang.com`,
        `DTSTART;VALUE=DATE:${formatDateToIcal(group.start)}`,
        `DTEND;VALUE=DATE:${formatDateToIcal(endDate)}`,
        `SUMMARY:${group.reason || 'Blocked'}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in ical-feed:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/ical-feed/index.ts
git commit -m "feat: add ical-feed edge function for calendar export"
```

---

### Task 4: iCal Import/Sync Edge Function

**Files:**
- Create: `supabase/functions/sync-ical-feeds/index.ts`

**Step 1: Write the edge function**

This function is triggered hourly by pg_cron. It fetches all active iCal subscriptions, parses their feeds, and upserts locked_dates.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedEvent {
  uid: string;
  dtstart: string;
  dtend: string;
  summary: string;
}

function parseIcalFeed(icsText: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const eventBlocks = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split('END:VEVENT')[0];
    const lines = block.split(/\r?\n/);

    let uid = '';
    let dtstart = '';
    let dtend = '';
    let summary = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('UID:')) {
        uid = trimmed.substring(4);
      } else if (trimmed.startsWith('DTSTART')) {
        const value = trimmed.includes(':') ? trimmed.split(':').pop()! : '';
        dtstart = value.replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
      } else if (trimmed.startsWith('DTEND')) {
        const value = trimmed.includes(':') ? trimmed.split(':').pop()! : '';
        dtend = value.replace(/(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
      } else if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.substring(8);
      }
    }

    if (uid && dtstart) {
      if (!dtend) {
        const d = new Date(dtstart + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() + 1);
        dtend = d.toISOString().split('T')[0];
      }
      events.push({ uid, dtstart, dtend, summary });
    }
  }

  return events;
}

function expandDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + 'T00:00:00Z');
  const endDate = new Date(end + 'T00:00:00Z');

  while (current < endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: subscriptions, error: subError } = await supabase
      .from('ical_subscriptions')
      .select('id, property_id, user_id, feed_url, source_name')
      .eq('is_active', true);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active subscriptions to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const results: { id: string; status: string; events: number }[] = [];

    for (const sub of subscriptions) {
      try {
        const response = await fetch(sub.feed_url, {
          headers: { 'User-Agent': 'Tuknang/1.0 Calendar Sync' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icsText = await response.text();
        const events = parseIcalFeed(icsText);

        const currentUids = new Set<string>();
        const lockedDatesToUpsert: Array<{
          property_id: string;
          user_id: string;
          date: string;
          reason: string | null;
          source: string;
          source_name: string;
          external_uid: string;
          subscription_id: string;
        }> = [];

        for (const event of events) {
          currentUids.add(event.uid);
          const dates = expandDateRange(event.dtstart, event.dtend);

          for (const date of dates) {
            lockedDatesToUpsert.push({
              property_id: sub.property_id,
              user_id: sub.user_id,
              date,
              reason: event.summary || null,
              source: 'external',
              source_name: sub.source_name,
              external_uid: event.uid,
              subscription_id: sub.id,
            });
          }
        }

        const { data: existingLocks } = await supabase
          .from('locked_dates')
          .select('id, external_uid')
          .eq('subscription_id', sub.id);

        const uidsToRemove = new Set<string>();
        for (const lock of (existingLocks || [])) {
          if (lock.external_uid && !currentUids.has(lock.external_uid)) {
            uidsToRemove.add(lock.external_uid);
          }
        }

        if (uidsToRemove.size > 0) {
          await supabase
            .from('locked_dates')
            .delete()
            .eq('subscription_id', sub.id)
            .in('external_uid', Array.from(uidsToRemove));
        }

        if (lockedDatesToUpsert.length > 0) {
          const batchSize = 500;
          for (let i = 0; i < lockedDatesToUpsert.length; i += batchSize) {
            const batch = lockedDatesToUpsert.slice(i, i + batchSize);
            const { error: upsertError } = await supabase
              .from('locked_dates')
              .upsert(batch, {
                onConflict: 'property_id,date',
                ignoreDuplicates: false,
              });

            if (upsertError) {
              console.error(`Upsert error for sub ${sub.id}:`, upsertError);
            }
          }
        }

        await supabase
          .from('ical_subscriptions')
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: 'success',
            last_error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        results.push({ id: sub.id, status: 'success', events: events.length });
      } catch (error) {
        console.error(`Error syncing subscription ${sub.id}:`, error);

        await supabase
          .from('ical_subscriptions')
          .update({
            last_synced_at: new Date().toISOString(),
            last_sync_status: 'error',
            last_error_message: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        results.push({ id: sub.id, status: 'error', events: 0 });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Sync complete', synced: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in sync-ical-feeds:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

**Step 2: Commit**

```bash
git add supabase/functions/sync-ical-feeds/index.ts
git commit -m "feat: add sync-ical-feeds edge function for importing external calendars"
```

---

### Task 5: Client-Side iCal Sync Service

**Files:**
- Create: `apps/mobile/services/icalSync.ts`

**Step 1: Write the service**

This service provides CRUD operations for iCal subscriptions and feed tokens, used by the sync management screen.

```typescript
import { supabase } from './supabase';
import type { IcalSubscription, IcalFeedToken } from '@/types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

export type IcalSourceName = 'airbnb' | 'vrbo' | 'booking_com' | 'other';

export const SOURCE_LABELS: Record<IcalSourceName, string> = {
  airbnb: 'Airbnb',
  vrbo: 'VRBO',
  booking_com: 'Booking.com',
  other: 'Other',
};

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// --- Import (iCal Subscriptions) ---

export async function getIcalSubscriptions(propertyId: string): Promise<IcalSubscription[]> {
  const { data, error } = await supabase
    .from('ical_subscriptions')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function addIcalSubscription(
  propertyId: string,
  feedUrl: string,
  sourceName: IcalSourceName,
  sourceLabel?: string
): Promise<IcalSubscription> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ical_subscriptions')
    .insert({
      property_id: propertyId,
      user_id: user.id,
      feed_url: feedUrl,
      source_name: sourceName,
      source_label: sourceLabel || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeIcalSubscription(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('ical_subscriptions')
    .update({ is_active: false })
    .eq('id', subscriptionId);

  if (error) throw new Error(error.message);
}

export async function getSubscriptionCount(propertyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ical_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return count || 0;
}

// --- Export (iCal Feed Tokens) ---

export async function getOrCreateFeedToken(propertyId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: existing } = await supabase
    .from('ical_feed_tokens')
    .select('token')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (existing) return existing.token;

  const token = generateToken();
  const { error } = await supabase
    .from('ical_feed_tokens')
    .insert({
      property_id: propertyId,
      user_id: user.id,
      token,
      is_active: true,
    });

  if (error) throw new Error(error.message);
  return token;
}

export async function getFeedToken(propertyId: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('ical_feed_tokens')
    .select('token')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return data?.token || null;
}

export async function revokeFeedToken(propertyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('ical_feed_tokens')
    .update({ is_active: false })
    .eq('property_id', propertyId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
}

export function getFeedUrl(token: string): string {
  return `${SUPABASE_URL}/functions/v1/ical-feed?token=${token}`;
}
```

**Step 2: Commit**

```bash
git add apps/mobile/services/icalSync.ts
git commit -m "feat: add icalSync service for managing subscriptions and feed tokens"
```

---

### Task 6: Subscription Gating

**Files:**
- Modify: `apps/mobile/stores/subscriptionStore.ts`

**Step 1: Add the `useCanAddIcalSubscription` hook**

Add this hook at the bottom of the file, after the existing `useCanAddProperty` hook (around line 489):

```typescript
export const useCanAddIcalSubscription = () => {
  const isPremium = useIsPremium();

  return useCallback((currentSubscriptionCount: number): boolean => {
    if (isPremium) return true;
    return currentSubscriptionCount < 1;
  }, [isPremium]);
};
```

**Step 2: Commit**

```bash
git add apps/mobile/stores/subscriptionStore.ts
git commit -m "feat: add subscription gating for ical sync"
```

---

### Task 7: Calendar Sync Management Screen

**Files:**
- Create: `apps/mobile/app/property/[id]/sync.tsx`

**Step 1: Write the sync management screen**

This is the main UI for managing iCal import subscriptions and the export feed. Accessible from the property detail screen.

The screen has two sections:
1. **Import** — paste external iCal URLs, see active subscriptions with sync status
2. **Export** — toggle to generate/copy the Tuknang iCal feed URL

Key patterns to follow (from existing codebase):
- Use `useLocalSearchParams<{ id: string }>()` for the property ID
- Use `Colors`, `Spacing`, `Typography`, `BorderRadius`, `Shadows` from `@/constants/theme`
- Use `Platform.OS === 'web'` for web-specific alerts
- Use `isAuthError` from `@/services/supabase` for session error handling
- Use `useToast` from `@/components/ui/Toast` for feedback
- Use `useCanAddIcalSubscription` from subscription store for gating
- Use `UpgradePrompt` component when limit reached
- `StyleSheet.create` at the bottom of the file

The screen should import from:
- `@/services/icalSync` — `getIcalSubscriptions`, `addIcalSubscription`, `removeIcalSubscription`, `getSubscriptionCount`, `getOrCreateFeedToken`, `getFeedToken`, `revokeFeedToken`, `getFeedUrl`, `SOURCE_LABELS`, `IcalSourceName`
- `@/stores/subscriptionStore` — `useCanAddIcalSubscription`
- `@/components/subscription/UpgradePrompt`
- `expo-clipboard` — for copy-to-clipboard
- `@/types/database` — `IcalSubscription`

State variables needed:
- `subscriptions: IcalSubscription[]`
- `feedToken: string | null`
- `feedUrl: string`, `newFeedUrl: string` (input for adding subscription)
- `selectedSource: IcalSourceName` (default: 'airbnb')
- `isLoading: boolean`, `isAdding: boolean`
- `showUpgradePrompt: boolean`

**Implementation notes:**
- Import section shows a TextInput for URL, a source picker (row of Pressable chips for Airbnb/VRBO/Booking.com/Other), and "Add" button
- Below that, a FlatList of active subscriptions showing source label, last synced time (relative, e.g., "2 hours ago"), status badge (green dot for success, red for error, gray for pending)
- Each subscription row has a delete button (trash icon or red X)
- Export section shows a toggle switch. When enabled, shows the feed URL in a readonly TextInput with a "Copy" Pressable
- Below the URL, show instruction text: "Paste this URL in Airbnb (Calendar > Import Calendar) or any calendar app"

**Step 2: Commit**

```bash
git add apps/mobile/app/property/[id]/sync.tsx
git commit -m "feat: add calendar sync management screen"
```

---

### Task 8: Add Calendar Sync Button to Property Detail

**Files:**
- Modify: `apps/mobile/app/property/[id].tsx`

**Step 1: Add the "Calendar Sync" action button**

In the Quick Actions section (around line 154-180 in `apps/mobile/app/property/[id].tsx`), add a new `Pressable` after the "Add Income/Expense" button and before the closing `</View>`:

```typescript
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/property/${id}/sync`)}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Calendar Sync</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
```

No style changes needed — it reuses the existing `actionButton`, `actionIcon`, `actionText`, `actionArrow` styles.

**Step 2: Commit**

```bash
git add apps/mobile/app/property/[id].tsx
git commit -m "feat: add calendar sync button to property detail screen"
```

---

### Task 9: Update Calendar UI for External Locks

**Files:**
- Modify: `apps/mobile/app/(tabs)/calendar.tsx`
- Modify: `apps/mobile/app/property/[id]/calendar.tsx`

**Step 1: Update the main calendar screen**

In `apps/mobile/app/(tabs)/calendar.tsx`, make these changes:

**a)** Update the `LockedDate` import to include the new fields. The existing import `type { Property, Reservation, LockedDate } from '@/types/database'` already covers this since we updated the type.

**b)** Update `dateStatusMap` (around line 149-178) to distinguish external locks:

Change the status type to include `'external'`:
```typescript
const map = new Map<string, { status: 'available' | 'booked' | 'completed' | 'past' | 'locked' | 'external'; reservation?: ReservationWithProperty; lockedDate?: LockedDate }>();
```

In the locked dates loop, check the source:
```typescript
    for (const locked of lockedDates) {
      const status = locked.source === 'external' ? 'external' : 'locked';
      map.set(locked.date, { status, lockedDate: locked });
    }
```

**c)** Update `getDateStatus` return type to include `'external'`.

**d)** In the day cell rendering, add visual distinction for external locks:
- External: orange background (`Colors.semantic.warning` with low opacity), small text label with `source_name`
- Manual locked: existing lock icon style

**e)** Update the lock modal to show source info for external locks:
- When tapping an external lock, show the source name and a "Convert to Reservation" button
- "Convert to Reservation" navigates to `/reservation/add?propertyId=${propertyId}&checkIn=${startDate}&checkOut=${endDate}&source=${sourceName}`

**f)** Add `'external'` to `getSimpleDateStatus` as `'notAvailable'`.

**Step 2: Apply the same changes to `apps/mobile/app/property/[id]/calendar.tsx`**

The property-specific calendar has a similar structure. Apply the same status type update, dateStatusMap change, and visual rendering changes.

**Step 3: Add external booking color to theme**

In `apps/mobile/constants/theme.ts`, the `Colors.semantic.warning` (#f59e0b) already exists and works well for external bookings (orange/amber). No theme changes needed.

**Step 4: Commit**

```bash
git add apps/mobile/app/(tabs)/calendar.tsx apps/mobile/app/property/[id]/calendar.tsx
git commit -m "feat: render external calendar locks with distinct visual style"
```

---

### Task 10: Manual Trigger for Initial Sync

**Files:**
- Modify: `apps/mobile/services/icalSync.ts`

**Step 1: Add a function to trigger sync for a single subscription**

Add this to `apps/mobile/services/icalSync.ts`. After adding a new subscription, the user shouldn't have to wait up to an hour for the first sync. This calls the edge function with a specific subscription ID.

```typescript
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export async function triggerSyncForSubscription(subscriptionId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User not authenticated');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-ical-feeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Sync failed');
  }
}
```

**Step 2: Update sync-ical-feeds edge function to accept optional subscriptionId**

In `supabase/functions/sync-ical-feeds/index.ts`, update the request body parsing to optionally filter by a specific subscription:

After `const supabase = createClient(...)`, add:
```typescript
    let subscriptionFilter: string | null = null;
    try {
      const body = await req.json();
      subscriptionFilter = body?.subscriptionId || null;
    } catch {
      // No body or invalid JSON — sync all
    }
```

Then update the subscription query to conditionally filter:
```typescript
    let query = supabase
      .from('ical_subscriptions')
      .select('id, property_id, user_id, feed_url, source_name')
      .eq('is_active', true);

    if (subscriptionFilter) {
      query = query.eq('id', subscriptionFilter);
    }

    const { data: subscriptions, error: subError } = await query;
```

**Step 3: In the sync screen (Task 7), call `triggerSyncForSubscription` after adding a subscription**

After `addIcalSubscription` succeeds, call `triggerSyncForSubscription(newSub.id)` in a fire-and-forget manner (don't block the UI).

**Step 4: Commit**

```bash
git add apps/mobile/services/icalSync.ts supabase/functions/sync-ical-feeds/index.ts
git commit -m "feat: add manual sync trigger for immediate first sync"
```

---

### Task 11: Update Locked Dates Query in Shared Calendar

**Files:**
- Modify: `supabase/functions/get-shared-calendar/index.ts`

**Step 1: Update the locked dates query to include source info**

In `supabase/functions/get-shared-calendar/index.ts`, around line 148 where locked dates are queried, update the select to include the new columns:

```typescript
      supabase
        .from('locked_dates')
        .select('id, date, source, source_name')
        .eq('property_id', shareToken.property_id)
        .gte('date', startDate)
        .lte('date', endDate),
```

And update the response to include the source info in the `lockedDates` array. This allows the shared calendar view to also show external bookings distinctly.

**Step 2: Commit**

```bash
git add supabase/functions/get-shared-calendar/index.ts
git commit -m "feat: include lock source info in shared calendar response"
```

---

### Task 12: Final Verification and Cleanup

**Step 1: Verify all files are committed**

Run: `git status`
Expected: clean working tree on `calendar-sync` branch

**Step 2: Run linting**

Run: `cd apps/mobile && npm run lint`
Expected: no new errors

**Step 3: Verify TypeScript compiles**

Run: `cd apps/mobile && npx tsc --noEmit`
Expected: no type errors from new/modified files

**Step 4: Review the full diff**

Run: `git log --oneline main..calendar-sync`
Expected: ~10-11 commits covering migration, types, edge functions, services, UI

**Step 5: Final commit if any fixes needed**

---

## pg_cron Setup (Manual — Supabase Dashboard)

After deploying, run this SQL in the Supabase Dashboard SQL Editor to schedule hourly syncs:

```sql
SELECT cron.schedule(
  'sync-ical-feeds-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-ical-feeds',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

This is a manual step done once in the Supabase Dashboard after deployment.

## Edge Function Deployment

```bash
npx supabase functions deploy ical-feed --no-verify-jwt
npx supabase functions deploy sync-ical-feeds
```

Note: `ical-feed` needs `--no-verify-jwt` because external calendar services (Airbnb, Google) will call it without authentication — the token parameter provides access control.
