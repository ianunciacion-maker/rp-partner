import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  token: string;
  year: number;
  month: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token, year, month } = await req.json() as RequestBody;

    if (!token || typeof year !== 'number' || typeof month !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: token, year, month' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate token and get property
    const { data: shareToken, error: tokenError } = await supabase
      .from('calendar_share_tokens')
      .select(`
        id,
        property_id,
        user_id,
        is_active,
        expires_at
      `)
      .eq('token', token)
      .single();

    if (tokenError || !shareToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired share link' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!shareToken.is_active) {
      return new Response(
        JSON.stringify({ error: 'This share link has been deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This share link has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, name, city, province')
      .eq('id', shareToken.property_id)
      .single();

    if (propertyError || !property) {
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get owner's subscription to determine calendar month limits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        subscription_status,
        calendar_months_override,
        current_subscription_id
      `)
      .eq('id', shareToken.user_id)
      .single();

    let calendarMonthsLimit: number | null = 2; // Default free tier: 2 months

    if (user) {
      // Check for admin override first
      if (user.calendar_months_override !== null) {
        calendarMonthsLimit = user.calendar_months_override;
      } else if (user.current_subscription_id && user.subscription_status === 'active') {
        // Fetch plan limits
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan:subscription_plans(calendar_months_limit)')
          .eq('id', user.current_subscription_id)
          .single();

        if (subscription?.plan) {
          calendarMonthsLimit = (subscription.plan as any).calendar_months_limit;
        }
      } else if (user.subscription_status === 'grace_period' && user.current_subscription_id) {
        // Grace period: still has premium access
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan:subscription_plans(calendar_months_limit)')
          .eq('id', user.current_subscription_id)
          .single();

        if (subscription?.plan) {
          calendarMonthsLimit = (subscription.plan as any).calendar_months_limit;
        }
      }
    }

    // Check if requested month is within allowed range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const requestedMonthOffset = (year - currentYear) * 12 + (month - currentMonth);

    // null or negative values mean unlimited access
    const hasUnlimitedAccess = calendarMonthsLimit === null || calendarMonthsLimit < 0;

    if (!hasUnlimitedAccess && Math.abs(requestedMonthOffset) > calendarMonthsLimit) {
      return new Response(
        JSON.stringify({
          error: 'Month not accessible',
          limit: calendarMonthsLimit,
          isPaid: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Calculate date range for the requested month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

    // Fetch reservations that overlap with the month
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id, check_in, check_out, status')
      .eq('property_id', shareToken.property_id)
      .not('status', 'in', '("cancelled","no_show")')
      .lte('check_in', endDate)
      .gt('check_out', startDate);

    // Fetch locked dates for the month
    const { data: lockedDates } = await supabase
      .from('locked_dates')
      .select('id, date')
      .eq('property_id', shareToken.property_id)
      .gte('date', startDate)
      .lte('date', endDate);

    // Update view count and last viewed timestamp
    await supabase
      .from('calendar_share_tokens')
      .update({
        view_count: (shareToken as any).view_count ? (shareToken as any).view_count + 1 : 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', shareToken.id);

    return new Response(
      JSON.stringify({
        property: {
          id: property.id,
          name: property.name,
          city: property.city,
          province: property.province,
        },
        reservations: reservations || [],
        lockedDates: lockedDates || [],
        calendarMonthsLimit,
        currentYear,
        currentMonth,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in get-shared-calendar:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
