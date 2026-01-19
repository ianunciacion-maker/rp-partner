import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: 'default' | null;
  channelId?: string;
}

// Multi-stage reminder schedule
const REMINDER_SCHEDULE = [
  { days: 7, type: 'expiring_7_days', title: 'Subscription Reminder', urgency: 'low' },
  { days: 3, type: 'expiring_3_days', title: 'Expiring Soon!', urgency: 'medium' },
  { days: 1, type: 'expiring_1_day', title: 'Last Day to Renew!', urgency: 'high' },
] as const;

function getReminderBody(days: number, userName: string): string {
  const name = userName || 'there';
  if (days === 7) {
    return `Hi ${name}! Your Premium subscription expires in 7 days. Renew now to keep unlimited access.`;
  }
  if (days === 3) {
    return `Hi ${name}! Only 3 days left on your Premium subscription. Don't lose your unlimited access!`;
  }
  return `Hi ${name}! Your Premium subscription expires tomorrow. Renew now to avoid interruption!`;
}

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
    let totalRemindersSent = 0;
    const reminderResults: Record<string, number> = {};

    // Process each reminder threshold
    for (const reminder of REMINDER_SCHEDULE) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + reminder.days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find subscriptions expiring on this date that haven't received this reminder type
      const { data: subscriptions, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          current_period_end,
          last_reminder_type,
          user:users(push_token, full_name)
        `)
        .eq('status', 'active')
        .gte('current_period_end', `${targetDateStr}T00:00:00`)
        .lt('current_period_end', `${targetDateStr}T23:59:59`);

      if (fetchError) {
        console.error(`Error fetching subscriptions for ${reminder.type}:`, fetchError);
        continue;
      }

      console.log(`Found ${subscriptions?.length || 0} subscriptions expiring in ${reminder.days} days`);

      const messages: ExpoPushMessage[] = [];
      const processedSubs: Array<{ id: string; userId: string }> = [];

      for (const sub of subscriptions || []) {
        // Check if this reminder type was already sent
        const { data: existingReminder } = await supabase
          .from('subscription_reminders')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('reminder_type', reminder.type)
          .limit(1)
          .single();

        if (existingReminder) {
          continue; // Already sent this reminder
        }

        const pushToken = (sub.user as any)?.push_token;
        if (pushToken && pushToken.startsWith('ExponentPushToken')) {
          messages.push({
            to: pushToken,
            title: reminder.title,
            body: getReminderBody(reminder.days, (sub.user as any)?.full_name),
            data: { screen: '/subscription' },
            sound: 'default',
            channelId: 'subscription',
          });
          processedSubs.push({ id: sub.id, userId: sub.user_id });
        }
      }

      // Send notifications for this threshold
      if (messages.length > 0) {
        await sendPushNotifications(messages);
        console.log(`Sent ${messages.length} ${reminder.type} notifications`);

        // Record reminders in the tracking table
        for (const sub of processedSubs) {
          await supabase.from('subscription_reminders').insert({
            subscription_id: sub.id,
            user_id: sub.userId,
            reminder_type: reminder.type,
            channel: 'push',
          });

          // Update last_reminder_type on subscription
          await supabase
            .from('subscriptions')
            .update({
              last_reminder_type: reminder.type,
              reminder_sent_at: new Date().toISOString(),
            })
            .eq('id', sub.id);
        }

        totalRemindersSent += messages.length;
        reminderResults[reminder.type] = messages.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_reminders_sent: totalRemindersSent,
        by_type: reminderResults,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-payment-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
