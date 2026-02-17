import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDateOnly(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function nowTimestamp(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

interface LockedDateRow {
  date: string;
  reason: string | null;
}

function groupConsecutiveDates(dates: LockedDateRow[]): { start: string; end: string; reason: string }[] {
  if (dates.length === 0) return [];

  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const groups: { start: string; end: string; reason: string }[] = [];
  let groupStart = sorted[0].date;
  let groupEnd = sorted[0].date;
  let groupReason = sorted[0].reason || 'Blocked';

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(groupEnd + 'T00:00:00Z');
    const curr = new Date(sorted[i].date + 'T00:00:00Z');
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const sameReason = (sorted[i].reason || 'Blocked') === groupReason;

    if (diffDays === 1 && sameReason) {
      groupEnd = sorted[i].date;
    } else {
      groups.push({ start: groupStart, end: groupEnd, reason: groupReason });
      groupStart = sorted[i].date;
      groupEnd = sorted[i].date;
      groupReason = sorted[i].reason || 'Blocked';
    }
  }

  groups.push({ start: groupStart, end: groupEnd, reason: groupReason });
  return groups;
}

function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
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
    let token = url.searchParams.get('token');

    if (!token) {
      const pathSegments = url.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.endsWith('.ics')) {
        token = lastSegment.slice(0, -4);
      }
    }

    if (!token) {
      return new Response('Missing token parameter', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 400,
      });
    }

    const { data: feedToken, error: tokenError } = await supabase
      .from('ical_feed_tokens')
      .select('id, property_id, user_id, is_active')
      .eq('token', token)
      .single();

    if (tokenError || !feedToken) {
      return new Response('Invalid token', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 404,
      });
    }

    if (!feedToken.is_active) {
      return new Response('This feed has been deactivated', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 403,
      });
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('id', feedToken.property_id)
      .single();

    if (propertyError || !property) {
      return new Response('Property not found', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        status: 404,
      });
    }

    const [reservationsResult, lockedDatesResult] = await Promise.all([
      supabase
        .from('reservations')
        .select('id, check_in, check_out, status')
        .eq('property_id', feedToken.property_id)
        .not('status', 'in', '("cancelled","no_show")'),
      supabase
        .from('locked_dates')
        .select('date, reason')
        .eq('property_id', feedToken.property_id)
        .eq('source', 'manual'),
    ]);

    const reservations = reservationsResult.data || [];
    const lockedDates = lockedDatesResult.data || [];

    const dtstamp = nowTimestamp();
    const calName = escapeIcalText(property.name);

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//Tuknang//Calendar Feed//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calName}`,
    ];

    for (const r of reservations) {
      const dtstart = formatDateOnly(r.check_in);
      const dtend = formatDateOnly(r.check_out);
      lines.push(
        'BEGIN:VEVENT',
        `UID:reservation-${r.id}@tuknang.com`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        'SUMMARY:Booked',
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT',
      );
    }

    const lockedGroups = groupConsecutiveDates(lockedDates);

    for (const group of lockedGroups) {
      const dtstart = formatDateOnly(group.start);
      const dtend = addDays(group.end, 1);
      const summary = escapeIcalText(group.reason);
      lines.push(
        'BEGIN:VEVENT',
        `UID:locked-${dtstart}-${dtend}@tuknang.com`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        `SUMMARY:${summary}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n') + '\r\n';

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error in ical-feed:', error);
    return new Response('Internal server error', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 500,
    });
  }
});
