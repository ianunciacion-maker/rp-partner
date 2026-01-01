import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Platform, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Property, Reservation, LockedDate } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface ReservationWithProperty extends Reservation {
  property?: Property;
}

interface LockModalState {
  visible: boolean;
  date: string;
  propertyId: string | null;
  existingLock?: LockedDate;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<ReservationWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [lockedDates, setLockedDates] = useState<LockedDate[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lockModal, setLockModal] = useState<LockModalState>({ visible: false, date: '', propertyId: null });
  const [lockReason, setLockReason] = useState('');
  const [isLocking, setIsLocking] = useState(false);

  const fetchData = async () => {
    try {
      const { data: propsData } = await supabase.from('properties').select('*');
      setProperties(propsData || []);

      // Fetch all reservations (not just current month for better visualization)
      let resQuery = supabase
        .from('reservations')
        .select('*, property:properties(*)')
        .not('status', 'in', '("cancelled","no_show")')
        .order('check_in', { ascending: true });

      // Fetch locked dates
      let lockQuery = supabase.from('locked_dates').select('*');

      if (selectedProperty) {
        resQuery = resQuery.eq('property_id', selectedProperty);
        lockQuery = lockQuery.eq('property_id', selectedProperty);
      }

      const [{ data: resData }, { data: lockData }] = await Promise.all([resQuery, lockQuery]);
      setReservations(resData || []);
      setLockedDates(lockData || []);
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

  const getDateStatus = (day: number): { status: 'available' | 'booked' | 'completed' | 'past' | 'locked'; reservation?: ReservationWithProperty; lockedDate?: LockedDate } => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    // Check if date is locked
    const locked = lockedDates.find((l) => l.date === dateStr);
    if (locked) {
      return { status: 'locked', lockedDate: locked };
    }

    // Check if date falls within any reservation (check_in <= date < check_out)
    for (const r of reservations) {
      if (dateStr >= r.check_in && dateStr < r.check_out) {
        // If the reservation's check_out date has passed, it's completed
        if (r.check_out <= today) {
          return { status: 'completed', reservation: r };
        }
        return { status: 'booked', reservation: r };
      }
    }

    // Past date with no reservation
    if (dateStr < today) return { status: 'past' };

    return { status: 'available' };
  };

  const handleDateLongPress = (day: number, status: string, lockedDate?: LockedDate) => {
    if (!selectedProperty && properties.length > 1) {
      // Need to select a property first to lock dates
      if (isWeb) {
        window.alert('Please select a property to lock/unlock dates');
      }
      return;
    }

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const propertyId = selectedProperty || (properties.length === 1 ? properties[0].id : null);

    if (status === 'locked' && lockedDate) {
      // Unlock this date
      setLockModal({ visible: true, date: dateStr, propertyId, existingLock: lockedDate });
    } else if (status === 'available' || status === 'past') {
      // Lock this date
      setLockModal({ visible: true, date: dateStr, propertyId });
    }
    setLockReason('');
  };

  const handleLockDate = async () => {
    if (!lockModal.propertyId || !user?.id) return;

    setIsLocking(true);
    try {
      const { error } = await supabase.from('locked_dates').insert({
        property_id: lockModal.propertyId,
        user_id: user.id,
        date: lockModal.date,
        reason: lockReason.trim() || null,
      });

      if (error) throw error;

      setLockModal({ visible: false, date: '', propertyId: null });
      fetchData();
    } catch (error: any) {
      if (isWeb) {
        window.alert(error.message || 'Failed to lock date');
      }
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockDate = async () => {
    if (!lockModal.existingLock) return;

    setIsLocking(true);
    try {
      const { error } = await supabase.from('locked_dates').delete().eq('id', lockModal.existingLock.id);

      if (error) throw error;

      setLockModal({ visible: false, date: '', propertyId: null });
      fetchData();
    } catch (error: any) {
      if (isWeb) {
        window.alert(error.message || 'Failed to unlock date');
      }
    } finally {
      setIsLocking(false);
    }
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

  // Get completed reservations for the currently viewed month
  const monthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}`;
  const todayStr = today.toISOString().split('T')[0];

  const monthHistory = reservations
    .filter((r) => {
      // Reservation overlaps with current month AND checkout has passed (completed)
      const overlapsMonth = r.check_in <= monthEnd && r.check_out > monthStart;
      const isCompleted = r.check_out <= todayStr;
      return overlapsMonth && isCompleted;
    })
    .sort((a, b) => b.check_out.localeCompare(a.check_out)); // Most recent first

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
          <View style={[styles.legendDot, styles.lockedDot]} />
          <Text style={styles.legendText}>Locked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.completedDot]} />
          <Text style={styles.legendText}>Done</Text>
        </View>
      </View>

      {/* Lock Hint */}
      <Text style={styles.lockHint}>Long-press a date to lock/unlock</Text>

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
          const { status, reservation, lockedDate } = getDateStatus(day);
          const isToday = isCurrentMonth && today.getDate() === day;

          return (
            <Pressable
              key={day}
              style={[
                styles.dayCell,
                status === 'booked' && styles.bookedCell,
                status === 'completed' && styles.completedCell,
                status === 'past' && styles.pastCell,
                status === 'available' && styles.availableCell,
                status === 'locked' && styles.lockedCell,
                isToday && styles.todayCell,
              ]}
              onPress={() => {
                if (status === 'locked') {
                  // Tapping locked date opens unlock modal
                  handleDateLongPress(day, status, lockedDate);
                } else if (reservation) {
                  router.push(`/reservation/${reservation.id}`);
                } else if (status === 'available' || status === 'past') {
                  // Allow adding reservations on past dates for corrections
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  if (selectedProperty) {
                    router.push(`/reservation/add?propertyId=${selectedProperty}&date=${dateStr}`);
                  } else {
                    router.push(`/reservation/add?date=${dateStr}`);
                  }
                }
              }}
              onLongPress={() => handleDateLongPress(day, status, lockedDate)}
              delayLongPress={400}
            >
              <Text style={[
                styles.dayNumber,
                status === 'booked' && styles.bookedText,
                status === 'completed' && styles.completedText,
                status === 'past' && styles.pastText,
                status === 'locked' && styles.lockedText,
                isToday && styles.todayNumber,
              ]}>
                {day}
              </Text>
              {status === 'locked' && (
                <Text style={styles.lockIcon}>🔒</Text>
              )}
              {reservation && (status === 'booked' || status === 'completed') && (
                <Text style={[styles.guestInitial, status === 'completed' && styles.completedInitial]} numberOfLines={1}>
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

      {/* Month History */}
      <View style={styles.agendaSection}>
        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>Month History</Text>
          <Text style={styles.historySubtitle}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
        </View>

        {monthHistory.length === 0 ? (
          <View style={styles.emptyAgenda}>
            <Text style={styles.emptyAgendaText}>No completed reservations this month</Text>
          </View>
        ) : (
          monthHistory.map((reservation) => (
            <Pressable
              key={reservation.id}
              style={styles.reservationCard}
              onPress={() => router.push(`/reservation/${reservation.id}`)}
            >
              <View style={[styles.statusBar, { backgroundColor: Colors.neutral.gray400 }]} />
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
                <View style={[styles.statusBadge, { backgroundColor: Colors.neutral.gray400 + '20' }]}>
                  <Text style={[styles.statusText, { color: Colors.neutral.gray500 }]}>
                    Completed
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Lock/Unlock Modal */}
      <Modal
        visible={lockModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setLockModal({ visible: false, date: '', propertyId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {lockModal.existingLock ? 'Unlock Date' : 'Lock Date'}
            </Text>
            <Text style={styles.modalDate}>{lockModal.date}</Text>

            {lockModal.existingLock ? (
              <>
                {lockModal.existingLock.reason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason:</Text>
                    <Text style={styles.reasonText}>{lockModal.existingLock.reason}</Text>
                  </View>
                )}
                <Text style={styles.modalHint}>This date will become available for bookings.</Text>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Reason (optional)</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g., Personal use, Maintenance"
                  value={lockReason}
                  onChangeText={setLockReason}
                  placeholderTextColor={Colors.neutral.gray400}
                />
                <Text style={styles.modalHint}>Locked dates cannot be booked.</Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelModalButton}
                onPress={() => setLockModal({ visible: false, date: '', propertyId: null })}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmModalButton,
                  lockModal.existingLock ? styles.unlockButton : styles.lockButton,
                  isLocking && styles.disabledButton,
                ]}
                onPress={lockModal.existingLock ? handleUnlockDate : handleLockDate}
                disabled={isLocking}
              >
                <Text style={styles.confirmModalText}>
                  {isLocking ? 'Saving...' : lockModal.existingLock ? 'Unlock' : 'Lock Date'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  completedDot: { backgroundColor: Colors.neutral.gray400 },
  lockedDot: { backgroundColor: Colors.neutral.gray500 },
  legendText: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray600 },
  lockHint: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray400, textAlign: 'center', paddingVertical: Spacing.xs, backgroundColor: Colors.neutral.white },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.neutral.white },
  navButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navButtonText: { fontSize: 28, color: Colors.primary.teal },
  monthTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  daysHeader: { flexDirection: 'row', backgroundColor: Colors.neutral.white, paddingBottom: Spacing.sm },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, fontWeight: '500' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: Colors.neutral.white, paddingBottom: Spacing.md },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: 2 },
  availableCell: { backgroundColor: Colors.semantic.success + '20' },
  bookedCell: { backgroundColor: Colors.semantic.error + '25' },
  completedCell: { backgroundColor: Colors.neutral.gray300 + '40' },
  pastCell: { backgroundColor: Colors.neutral.gray100 },
  lockedCell: { backgroundColor: Colors.neutral.gray400 + '50' },
  todayCell: { borderWidth: 2, borderColor: Colors.primary.teal, borderRadius: BorderRadius.md },
  dayNumber: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  bookedText: { color: Colors.semantic.error, fontWeight: '600' },
  completedText: { color: Colors.neutral.gray500, fontWeight: '500' },
  pastText: { color: Colors.neutral.gray400 },
  lockedText: { color: Colors.neutral.gray500, fontWeight: '500' },
  todayNumber: { fontWeight: 'bold', color: Colors.primary.teal },
  lockIcon: { fontSize: 10, marginTop: 1 },
  guestInitial: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray600, marginTop: 1 },
  completedInitial: { color: Colors.neutral.gray400 },
  agendaSection: { padding: Spacing.lg },
  agendaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  agendaTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  historySubtitle: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
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
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalContent: { backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.xl, padding: Spacing.xl, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900, textAlign: 'center' },
  modalDate: { fontSize: Typography.fontSize.lg, color: Colors.primary.teal, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.lg },
  inputLabel: { fontSize: Typography.fontSize.sm, fontWeight: '500', color: Colors.neutral.gray700, marginBottom: Spacing.xs },
  reasonInput: { backgroundColor: Colors.neutral.gray100, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900, marginBottom: Spacing.md },
  reasonBox: { backgroundColor: Colors.neutral.gray100, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  reasonLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginBottom: Spacing.xs },
  reasonText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  modalHint: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, textAlign: 'center', marginBottom: Spacing.lg },
  modalButtons: { flexDirection: 'row', gap: Spacing.md },
  cancelModalButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral.gray100, alignItems: 'center' },
  cancelModalText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray600 },
  confirmModalButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  lockButton: { backgroundColor: Colors.neutral.gray600 },
  unlockButton: { backgroundColor: Colors.semantic.success },
  disabledButton: { opacity: 0.6 },
  confirmModalText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.white },
});
