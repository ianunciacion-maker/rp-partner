import { getDaysInMonth } from 'date-fns';
import { supabase } from '@/services/supabase';

export interface OccupancyData {
  propertyId: string;
  propertyName: string;
  totalDays: number;
  lockedDays: number;
  bookedNights: number;
  occupancyRate: number;
}

export async function calculatePropertyOccupancy(
  propertyId: string,
  year: number,
  month: number
): Promise<OccupancyData | null> {
  const totalDays = getDaysInMonth(new Date(year, month));
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  const [reservationsResult, lockedResult, propertyResult] = await Promise.all([
    supabase
      .from('reservations')
      .select('check_in, check_out')
      .eq('property_id', propertyId)
      .not('status', 'in', '("cancelled","no_show")')
      .lte('check_in', endDate)
      .gte('check_out', startDate),
    supabase
      .from('locked_dates')
      .select('date')
      .eq('property_id', propertyId)
      .gte('date', startDate)
      .lte('date', endDate),
    supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single(),
  ]);

  if (!propertyResult.data) return null;

  const lockedDays = lockedResult.data?.length || 0;

  let bookedNights = 0;
  for (const res of reservationsResult.data || []) {
    const checkIn = new Date(res.check_in + 'T00:00:00');
    const checkOut = new Date(res.check_out + 'T00:00:00');
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, totalDays);

    const overlapStart = checkIn > monthStart ? checkIn : monthStart;
    const overlapEnd = checkOut < monthEnd ? checkOut : new Date(year, month, totalDays + 1);

    const nights = Math.max(
      0,
      Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    bookedNights += nights;
  }

  bookedNights = Math.min(bookedNights, totalDays);
  const availableDays = Math.max(totalDays - lockedDays, 1);
  const occupancyRate = Math.min(Math.round((bookedNights / availableDays) * 100), 100);

  return {
    propertyId,
    propertyName: propertyResult.data.name,
    totalDays,
    lockedDays,
    bookedNights,
    occupancyRate,
  };
}

export async function getAllPropertiesOccupancy(
  year: number,
  month: number,
  propertyIds: string[]
): Promise<OccupancyData[]> {
  const results = await Promise.all(
    propertyIds.map((id) => calculatePropertyOccupancy(id, year, month))
  );
  return results.filter((r): r is OccupancyData => r !== null);
}
