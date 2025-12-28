import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/services/supabase';
import type { Property, Reservation } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PropertyCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [propertyRes, reservationsRes] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('reservations').select('*').eq('property_id', id).not('status', 'in', '("cancelled","no_show")'),
      ]);

      setProperty(propertyRes.data);
      setReservations(reservationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [id]));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getDateStatus = (day: number): 'available' | 'booked' | 'checkout' | 'checkin' | 'past' => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    if (dateStr < today) return 'past';

    for (const r of reservations) {
      if (dateStr === r.check_in) return 'checkin';
      if (dateStr === r.check_out) return 'checkout';
      if (dateStr > r.check_in && dateStr < r.check_out) return 'booked';
    }

    return 'available';
  };

  const getReservationForDate = (day: number): Reservation | null => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.find((r) => dateStr >= r.check_in && dateStr < r.check_out) || null;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: property?.name || 'Calendar', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container}>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.availableDot]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.bookedDot]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.checkinDot]} />
            <Text style={styles.legendText}>Check-in</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.checkoutDot]} />
            <Text style={styles.legendText}>Check-out</Text>
          </View>
        </View>

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <Pressable onPress={prevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
          <Pressable onPress={nextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
        </View>

        {/* Days of Week */}
        <View style={styles.daysHeader}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayLabel}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDateStatus(day);
            const isToday = isCurrentMonth && today.getDate() === day;
            const reservation = getReservationForDate(day);

            return (
              <Pressable
                key={day}
                style={[
                  styles.dayCell,
                  status === 'booked' && styles.bookedCell,
                  status === 'checkin' && styles.checkinCell,
                  status === 'checkout' && styles.checkoutCell,
                  status === 'past' && styles.pastCell,
                  status === 'available' && styles.availableCell,
                  isToday && styles.todayCell,
                ]}
                onPress={() => {
                  if (reservation) {
                    router.push(`/reservation/${reservation.id}`);
                  } else if (status === 'available') {
                    router.push(`/reservation/add?propertyId=${id}`);
                  }
                }}
              >
                <Text style={[
                  styles.dayNumber,
                  status === 'booked' && styles.bookedText,
                  status === 'checkin' && styles.checkinText,
                  status === 'checkout' && styles.checkoutText,
                  status === 'past' && styles.pastText,
                  isToday && styles.todayNumber,
                ]}>
                  {day}
                </Text>
                {reservation && (status === 'checkin' || status === 'booked') && (
                  <Text style={styles.guestInitial} numberOfLines={1}>
                    {reservation.guest_name.split(' ')[0].charAt(0)}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Reservations List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reservations</Text>
            <Pressable onPress={() => router.push(`/reservation/add?propertyId=${id}`)}>
              <Text style={styles.addButton}>+ Add</Text>
            </Pressable>
          </View>

          {reservations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reservations yet</Text>
            </View>
          ) : (
            reservations
              .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
              .map((reservation) => (
                <Pressable
                  key={reservation.id}
                  style={styles.reservationCard}
                  onPress={() => router.push(`/reservation/${reservation.id}`)}
                >
                  <View style={[styles.statusBar, { backgroundColor: getStatusColor(reservation.status) }]} />
                  <View style={styles.reservationContent}>
                    <Text style={styles.guestName}>{reservation.guest_name}</Text>
                    <Text style={styles.dateRange}>
                      {formatDate(reservation.check_in)} - {formatDate(reservation.check_out)} ({reservation.nights} nights)
                    </Text>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>PHP {reservation.total_amount?.toLocaleString()}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                      {reservation.status}
                    </Text>
                  </View>
                </Pressable>
              ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return Colors.semantic.success;
    case 'pending': return Colors.semantic.warning;
    case 'checked_in': return Colors.primary.teal;
    case 'completed': return Colors.neutral.gray400;
    default: return Colors.neutral.gray400;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.neutral.white, paddingVertical: Spacing.md, marginBottom: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.xs },
  availableDot: { backgroundColor: Colors.semantic.success },
  bookedDot: { backgroundColor: Colors.semantic.error },
  checkinDot: { backgroundColor: Colors.primary.teal },
  checkoutDot: { backgroundColor: Colors.semantic.warning },
  legendText: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray600 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.neutral.white },
  navButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navButtonText: { fontSize: 28, color: Colors.primary.teal },
  monthTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  daysHeader: { flexDirection: 'row', backgroundColor: Colors.neutral.white, paddingBottom: Spacing.sm },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, fontWeight: '500' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: Colors.neutral.white, paddingBottom: Spacing.md },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
  availableCell: { backgroundColor: Colors.semantic.success + '15' },
  bookedCell: { backgroundColor: Colors.semantic.error + '20' },
  checkinCell: { backgroundColor: Colors.primary.teal + '30' },
  checkoutCell: { backgroundColor: Colors.semantic.warning + '30' },
  pastCell: { backgroundColor: Colors.neutral.gray100 },
  todayCell: { borderWidth: 2, borderColor: Colors.primary.teal, borderRadius: BorderRadius.md },
  dayNumber: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  bookedText: { color: Colors.semantic.error, fontWeight: '600' },
  checkinText: { color: Colors.primary.teal, fontWeight: '600' },
  checkoutText: { color: Colors.semantic.warning, fontWeight: '600' },
  pastText: { color: Colors.neutral.gray400 },
  todayNumber: { fontWeight: 'bold', color: Colors.primary.teal },
  guestInitial: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray600, marginTop: 1 },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginTop: Spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  addButton: { fontSize: Typography.fontSize.md, color: Colors.primary.teal, fontWeight: '600' },
  emptyState: { paddingVertical: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  reservationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral.gray50, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, overflow: 'hidden' },
  statusBar: { width: 4, alignSelf: 'stretch' },
  reservationContent: { flex: 1, padding: Spacing.md },
  guestName: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray900 },
  dateRange: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: 2 },
  amountContainer: { padding: Spacing.md, alignItems: 'flex-end' },
  amount: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray900 },
  statusText: { fontSize: Typography.fontSize.xs, fontWeight: '600', textTransform: 'capitalize', marginTop: 2 },
});
