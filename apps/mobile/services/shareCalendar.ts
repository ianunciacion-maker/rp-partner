import { supabase } from './supabase';
import type { CalendarShareToken } from '@/types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

interface SharedCalendarResponse {
  property: {
    id: string;
    name: string;
    city: string | null;
    province: string | null;
  };
  reservations: Array<{
    id: string;
    check_in: string;
    check_out: string;
    status: string;
  }>;
  lockedDates: Array<{
    id: string;
    date: string;
  }>;
  calendarMonthsLimit: number | null;
  currentYear: number;
  currentMonth: number;
}

interface SharedCalendarError {
  error: string;
  limit?: number;
  isPaid?: boolean;
}

export async function fetchSharedCalendar(
  token: string,
  year: number,
  month: number
): Promise<SharedCalendarResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-shared-calendar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ token, year, month }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as SharedCalendarError;
    throw new Error(errorData.error || 'Failed to fetch calendar');
  }

  return data as SharedCalendarResponse;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function createShareToken(propertyId: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if an active token already exists for this property
  const { data: existingToken } = await supabase
    .from('calendar_share_tokens')
    .select('token')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (existingToken) {
    return existingToken.token;
  }

  // Create a new token
  const token = generateToken();
  const { error } = await supabase
    .from('calendar_share_tokens')
    .insert({
      property_id: propertyId,
      user_id: user.id,
      token,
      is_active: true,
    });

  if (error) {
    throw new Error(error.message || 'Failed to create share token');
  }

  return token;
}

export async function getShareToken(propertyId: string): Promise<CalendarShareToken | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from('calendar_share_tokens')
    .select('*')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return data as CalendarShareToken | null;
}

export async function revokeShareToken(propertyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('calendar_share_tokens')
    .update({ is_active: false })
    .eq('property_id', propertyId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message || 'Failed to revoke share token');
  }
}

export function getShareUrl(token: string): string {
  // Use the deployed web URL
  const baseUrl = typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'https://tuknang.com';
  return `${baseUrl}/share/${token}`;
}
