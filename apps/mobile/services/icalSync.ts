import { supabase } from './supabase';
import type { IcalSubscription } from '@/types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

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

export async function triggerSyncForSubscription(subscriptionId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User not authenticated');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-ical-feeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Sync failed');
  }
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
  return `${SUPABASE_URL}/functions/v1/ical-feed/${token}.ics`;
}
