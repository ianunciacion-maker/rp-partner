import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const GRACE_PERIOD_DAYS = 3;

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: 'default' | null;
  channelId?: string;
}

// Grace period reminder schedule
const GRACE_REMINDERS = [
  { day: 0, type: 'grace_period_start', title: 'Subscription Expired', body: (name: string) => `Hi ${name}! Your Premium subscription has expired. You have ${GRACE_PERIOD_DAYS} days to renew before losing access.` },
  { day: 1, type: 'grace_period_day_2', title: '2 Days Left in Grace Period', body: (name: string) => `Hi ${name}! Only 2 days left to renew your Premium subscription. Don't lose your features!` },
  { day: 2, type: 'grace_period_final', title: 'Final Day - Act Now!', body: (name: string) => `Hi ${name}! This is your last day to renew. Your Premium access ends tonight!` },
] as const;

async function sendPushNotifications(messages: ExpoPushMessage[]) {
  if (messages.length === 0) return;

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    console.error('Failed to send push notifications:', await response.text());
  }

  return response.json();
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const todayStr = now.toISOString();
    const gracePeriodDate = new Date(now);
    gracePeriodDate.setDate(gracePeriodDate.getDate() + GRACE_PERIOD_DAYS);

    // 1. Move active subscriptions past their end date to grace_period
    const { data: expiredActive, error: expiredError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        current_period_end,
        user:users(push_token, full_name)
      `)
      .eq('status', 'active')
      .lt('current_period_end', todayStr);

    if (expiredError) throw expiredError;

    console.log(`Found ${expiredActive?.length || 0} subscriptions to move to grace period`);

    const graceMessages: ExpoPushMessage[] = [];

    for (const sub of expiredActive || []) {
      // Update to grace period
      await supabase
        .from('subscriptions')
        .update({
          status: 'grace_period',
          grace_period_end: gracePeriodDate.toISOString(),
          last_reminder_type: 'grace_period_start',
          updated_at: todayStr,
        })
        .eq('id', sub.id);

      // Update user status
      await supabase
        .from('users')
        .update({
          subscription_status: 'grace_period',
          updated_at: todayStr,
        })
        .eq('id', sub.user_id);

      // Record reminder in tracking table
      await supabase.from('subscription_reminders').insert({
        subscription_id: sub.id,
        user_id: sub.user_id,
        reminder_type: 'grace_period_start',
        channel: 'push',
      });

      // Send notification
      const pushToken = (sub.user as any)?.push_token;
      if (pushToken && pushToken.startsWith('ExponentPushToken')) {
        graceMessages.push({
          to: pushToken,
          title: 'Subscription Expired',
          body: `Hi ${(sub.user as any)?.full_name || 'there'}! Your Premium subscription has expired. You have ${GRACE_PERIOD_DAYS} days to renew before losing access.`,
          data: { screen: '/subscription' },
          sound: 'default',
          channelId: 'subscription',
        });
      }
    }

    if (graceMessages.length > 0) {
      await sendPushNotifications(graceMessages);
      console.log(`Sent ${graceMessages.length} grace period start notifications`);
    }

    // 1b. Send daily grace period reminders (day 2 and day 3)
    const { data: graceSubscriptions, error: graceSubError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        current_period_end,
        grace_period_end,
        last_reminder_type,
        user:users(push_token, full_name)
      `)
      .eq('status', 'grace_period');

    if (!graceSubError && graceSubscriptions) {
      for (const sub of graceSubscriptions) {
        const periodEnd = new Date(sub.current_period_end);
        const daysSinceExpiry = Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));

        // Find the appropriate reminder for this day
        const reminder = GRACE_REMINDERS.find(r => r.day === daysSinceExpiry);
        if (!reminder || reminder.type === 'grace_period_start') continue; // Day 0 already handled above

        // Check if already sent
        const { data: existingReminder } = await supabase
          .from('subscription_reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('reminder_type', reminder.type)
          .limit(1)
          .single();

        if (existingReminder) continue;

        // Record and send reminder
        await supabase.from('subscription_reminders').insert({
          subscription_id: sub.id,
          user_id: sub.user_id,
          reminder_type: reminder.type,
          channel: 'push',
        });

        await supabase
          .from('subscriptions')
          .update({ last_reminder_type: reminder.type })
          .eq('id', sub.id);

        const pushToken = (sub.user as any)?.push_token;
        if (pushToken && pushToken.startsWith('ExponentPushToken')) {
          await sendPushNotifications([{
            to: pushToken,
            title: reminder.title,
            body: reminder.body((sub.user as any)?.full_name || 'there'),
            data: { screen: '/subscription' },
            sound: 'default',
            channelId: 'subscription',
          }]);
          console.log(`Sent ${reminder.type} notification to user ${sub.user_id}`);
        }
      }
    }

    // 2. Move grace_period subscriptions past their grace end date to expired
    const { data: expiredGrace, error: graceError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        grace_period_end,
        user:users(push_token, full_name)
      `)
      .eq('status', 'grace_period')
      .lt('grace_period_end', todayStr);

    if (graceError) throw graceError;

    console.log(`Found ${expiredGrace?.length || 0} subscriptions to expire`);

    const expiredMessages: ExpoPushMessage[] = [];

    for (const sub of expiredGrace || []) {
      // Update to expired
      await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          last_reminder_type: 'expired',
          updated_at: todayStr,
        })
        .eq('id', sub.id);

      // Update user status and downgrade to free plan limits
      await supabase
        .from('users')
        .update({
          subscription_status: 'expired',
          property_limit: 1,
          updated_at: todayStr,
        })
        .eq('id', sub.user_id);

      // Record expired reminder
      await supabase.from('subscription_reminders').insert({
        subscription_id: sub.id,
        user_id: sub.user_id,
        reminder_type: 'expired',
        channel: 'push',
      });

      // Send notification
      const pushToken = (sub.user as any)?.push_token;
      if (pushToken && pushToken.startsWith('ExponentPushToken')) {
        expiredMessages.push({
          to: pushToken,
          title: 'Subscription Ended',
          body: `Hi ${(sub.user as any)?.full_name || 'there'}! Your Premium subscription has ended. Upgrade again to restore full access.`,
          data: { screen: '/subscription' },
          sound: 'default',
          channelId: 'subscription',
        });
      }
    }

    if (expiredMessages.length > 0) {
      await sendPushNotifications(expiredMessages);
      console.log(`Sent ${expiredMessages.length} expiration notifications`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        moved_to_grace: expiredActive?.length || 0,
        moved_to_expired: expiredGrace?.length || 0,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
