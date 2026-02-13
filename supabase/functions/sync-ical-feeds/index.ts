import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IcalSubscription {
  id: string;
  property_id: string;
  user_id: string;
  feed_url: string;
  source_name: string;
  source_label: string | null;
  is_active: boolean;
}

interface ParsedEvent {
  uid: string;
  dtstart: string;
  dtend: string;
  summary: string | null;
}

function parseIcalDate(value: string): string | null {
  const dateMatch = value.match(/(\d{4})(\d{2})(\d{2})/);
  if (!dateMatch) return null;
  return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

function expandDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current < endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

function parseIcalFeed(icalText: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const lines = icalText.replace(/\r\n /g, '').replace(/\r\n\t/g, '').split(/\r?\n/);

  let inEvent = false;
  let uid: string | null = null;
  let dtstart: string | null = null;
  let dtend: string | null = null;
  let summary: string | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      uid = null;
      dtstart = null;
      dtend = null;
      summary = null;
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && uid && dtstart) {
        if (!dtend) {
          dtend = addDays(dtstart, 1);
        }
        events.push({ uid, dtstart, dtend, summary });
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith('UID:')) {
      uid = line.slice(4).trim();
    } else if (line.startsWith('DTSTART')) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        dtstart = parseIcalDate(line.slice(colonIndex + 1).trim());
      }
    } else if (line.startsWith('DTEND')) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        dtend = parseIcalDate(line.slice(colonIndex + 1).trim());
      }
    } else if (line.startsWith('SUMMARY:')) {
      summary = line.slice(8).trim();
    }
  }

  return events;
}

async function syncSubscription(
  supabase: ReturnType<typeof createClient>,
  subscription: IcalSubscription
): Promise<{ success: boolean; eventsFound: number; datesUpserted: number; datesRemoved: number; error?: string }> {
  const { id, property_id, user_id, feed_url, source_name } = subscription;

  try {
    const response = await fetch(feed_url, {
      headers: {
        'User-Agent': 'Tuknang/1.0 iCal Sync',
        'Accept': 'text/calendar',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const icalText = await response.text();
    const events = parseIcalFeed(icalText);

    console.log(`Subscription ${id}: parsed ${events.length} events from ${source_name}`);

    const currentUids = new Set(events.map(e => e.uid));

    const allDates: { date: string; uid: string; reason: string | null }[] = [];
    for (const event of events) {
      const dates = expandDateRange(event.dtstart, event.dtend);
      for (const date of dates) {
        allDates.push({
          date,
          uid: event.uid,
          reason: event.summary || null,
        });
      }
    }

    const { data: existingLocks, error: fetchError } = await supabase
      .from('locked_dates')
      .select('id, external_uid')
      .eq('subscription_id', id)
      .eq('source', 'external');

    if (fetchError) throw fetchError;

    const toDelete = (existingLocks || [])
      .filter(lock => lock.external_uid && !currentUids.has(lock.external_uid))
      .map(lock => lock.id);

    let datesRemoved = 0;
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('locked_dates')
        .delete()
        .in('id', toDelete);

      if (deleteError) throw deleteError;
      datesRemoved = toDelete.length;
      console.log(`Subscription ${id}: removed ${datesRemoved} stale locked dates`);
    }

    let datesUpserted = 0;
    if (allDates.length > 0) {
      const BATCH_SIZE = 500;
      for (let i = 0; i < allDates.length; i += BATCH_SIZE) {
        const batch = allDates.slice(i, i + BATCH_SIZE);
        const rows = batch.map(d => ({
          property_id,
          user_id,
          date: d.date,
          reason: d.reason,
          source: 'external',
          source_name: source_name,
          external_uid: d.uid,
          subscription_id: id,
        }));

        const { error: upsertError } = await supabase
          .from('locked_dates')
          .upsert(rows, {
            onConflict: 'property_id,date,subscription_id',
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error(`Subscription ${id}: batch upsert error, falling back to individual inserts`, upsertError.message);
          for (const row of rows) {
            const { error: singleError } = await supabase
              .from('locked_dates')
              .upsert(row, {
                onConflict: 'property_id,date,subscription_id',
                ignoreDuplicates: false,
              });
            if (!singleError) {
              datesUpserted++;
            }
          }
        } else {
          datesUpserted += batch.length;
        }
      }
      console.log(`Subscription ${id}: upserted ${datesUpserted} locked dates`);
    }

    await supabase
      .from('ical_subscriptions')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return {
      success: true,
      eventsFound: events.length,
      datesUpserted,
      datesRemoved,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Subscription ${id} sync failed:`, errorMessage);

    await supabase
      .from('ical_subscriptions')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return {
      success: false,
      eventsFound: 0,
      datesUpserted: 0,
      datesRemoved: 0,
      error: errorMessage,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let subscriptionId: string | null = null;
    try {
      const body = await req.json();
      subscriptionId = body?.subscriptionId || null;
    } catch {
      // No body or invalid JSON — sync all active subscriptions
    }

    let query = supabase
      .from('ical_subscriptions')
      .select('id, property_id, user_id, feed_url, source_name, source_label, is_active')
      .eq('is_active', true);

    if (subscriptionId) {
      query = query.eq('id', subscriptionId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active subscriptions to sync', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Syncing ${subscriptions.length} iCal subscription(s)`);

    const results = [];
    for (const subscription of subscriptions) {
      const result = await syncSubscription(supabase, subscription);
      results.push({
        subscriptionId: subscription.id,
        sourceName: subscription.source_name,
        propertyId: subscription.property_id,
        ...result,
      });
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Sync complete: ${successCount} succeeded, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in sync-ical-feeds:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
