import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import type { Property, Reservation } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ReservationWithProperty extends Reservation {
  property?: Property;
}

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<ReservationWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: propsData } = await supabase.from('properties').select('*');
      setProperties(propsData || []);

      // Fetch all reservations (not just current month for better visualization)
      let query = supabase
        .from('reservations')
        .select('*, property:properties(*)')
        .not('status', 'in', '("cancelled","no_show")')
        .order('check_in', { ascending: true });

      if (selectedProperty) {
        query = query.eq('property_id', selectedProperty);
      }

      const { data: resData } = await query;
      setReservations(resData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedProperty]);

  useFocusEffect(useCallback(() => { fetchData(); }, [selectedProperty]));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getDateStatus = (day: number): { status: 'available' | 'booked' | 'checkout' | 'checkin' | 'past'; reservation?: ReservationWithProperty } => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    if (dateStr < today) return { status: 'past' };

    for (const r of reservations) {
      if (dateStr === r.check_in) return { status: 'checkin', reservation: r };
      if (dateStr === r.check_out) return { status: 'checkout', reservation: r };
      if (dateStr > r.check_in && dateStr < r.check_out) return { status: 'booked', reservation: r };
    }

    return { status: 'available' };
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  // Get upcoming reservations for the agenda
  const upcomingReservations = reservations
    .filter((r) => new Date(r.check_in) >= new Date(today.toISOString().split('T')[0]))
    .slice(0, 5);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Property Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <Pressable
          style={[styles.filterChip, !selectedProperty && styles.filterChipActive]}
          onPress={() => setSelectedProperty(null)}
        >
          <Text style={[styles.filterChipText, !selectedProperty && styles.filterChipTextActive]}>All Properties</Text>
        </Pressable>
        {properties.map((prop) => (
          <Pressable
            key={prop.id}
            style={[styles.filterChip, selectedProperty === prop.id && styles.filterChipActive]}
            onPress={() => setSelectedProperty(prop.id)}
          >
            <Text style={[styles.filterChipText, selectedProperty === prop.id && styles.filterChipTextActive]}>{prop.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

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
          const { status, reservation } = getDateStatus(day);
          const isToday = isCurrentMonth && today.getDate() === day;

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
                } else if (status === 'available' && selectedProperty) {
                  router.push(`/reservation/add?propertyId=${selectedProperty}`);
                } else if (status === 'available') {
                  router.push('/reservation/add');
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

      {/* Upcoming Reservations */}
      <View style={styles.agendaSection}>
        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>Upcoming Reservations</Text>
          <Pressable onPress={() => router.push('/reservation/add')}>
            <Text style={styles.addButton}>+ Add</Text>
          </Pressable>
        </View>

        {upcomingReservations.length === 0 ? (
          <View style={styles.emptyAgenda}>
            <Text style={styles.emptyAgendaText}>No upcoming reservations</Text>
          </View>
        ) : (
          upcomingReservations.map((reservation) => (
            <Pressable
              key={reservation.id}
              style={styles.reservationCard}
              onPress={() => router.push(`/reservation/${reservation.id}`)}
            >
              <View style={[styles.statusBar, { backgroundColor: getStatusColor(reservation.status) }]} />
              <View style={styles.reservationContent}>
                <Text style={styles.guestName}>{reservation.guest_name}</Text>
                <Text style={styles.propertyName}>{reservation.property?.name || 'Unknown Property'}</Text>
                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>{formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}</Text>
                  <Text style={styles.nightsText}>{reservation.nights} nights</Text>
                </View>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amountText}>PHP {reservation.total_amount?.toLocaleString()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                    {reservation.status}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return Colors.semantic.success;
    case 'pending': return Colors.semantic.warning;
    case 'checked_in': return Colors.primary.teal;
    case 'completed': return Colors.neutral.gray400;
    case 'cancelled': return Colors.semantic.error;
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
  filterContainer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.neutral.white },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.neutral.gray100, marginRight: Spacing.sm },
  filterChipActive: { backgroundColor: Colors.primary.teal },
  filterChipText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray600 },
  filterChipTextActive: { color: Colors.neutral.white, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.neutral.white, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.neutral.gray100 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.xs },
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
  availableCell: { backgroundColor: Colors.semantic.success + '10' },
  bookedCell: { backgroundColor: Colors.semantic.error + '20' },
  checkinCell: { backgroundColor: Colors.primary.teal + '30' },
  checkoutCell: { backgroundColor: Colors.semantic.warning + '25' },
  pastCell: { backgroundColor: Colors.neutral.gray100 },
  todayCell: { borderWidth: 2, borderColor: Colors.primary.teal, borderRadius: BorderRadius.md },
  dayNumber: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  bookedText: { color: Colors.semantic.error, fontWeight: '600' },
  checkinText: { color: Colors.primary.teal, fontWeight: '600' },
  checkoutText: { color: Colors.semantic.warning, fontWeight: '600' },
  pastText: { color: Colors.neutral.gray400 },
  todayNumber: { fontWeight: 'bold', color: Colors.primary.teal },
  guestInitial: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray600, marginTop: 1 },
  agendaSection: { padding: Spacing.lg },
  agendaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  agendaTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  addButton: { fontSize: Typography.fontSize.md, color: Colors.primary.teal, fontWeight: '600' },
  emptyAgenda: { padding: Spacing.xl, alignItems: 'center' },
  emptyAgendaText: { color: Colors.neutral.gray500 },
  reservationCard: { flexDirection: 'row', backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
  statusBar: { width: 4 },
  reservationContent: { flex: 1, padding: Spacing.md },
  guestName: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray900 },
  propertyName: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  dateText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray600 },
  nightsText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray400, marginLeft: Spacing.sm },
  amountContainer: { padding: Spacing.md, justifyContent: 'center', alignItems: 'flex-end' },
  amountText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray900 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginTop: Spacing.xs },
  statusText: { fontSize: Typography.fontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
});
