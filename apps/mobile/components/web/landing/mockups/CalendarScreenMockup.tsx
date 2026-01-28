import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { MockupStatusBar } from './MockupStatusBar';
import { MockupBottomNav } from './MockupBottomNav';

const bookedDays = [9, 10, 11, 22, 23, 24, 28, 29];
const blockedDays = [15, 16];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const upcomingReservations = [
  { name: 'Juan Santos', dates: 'Jan 9-11', property: 'Casa Verde' },
  { name: 'Maria Cruz', dates: 'Jan 22-24', property: 'Sunrise' },
  { name: 'Ana Reyes', dates: 'Jan 28-29', property: 'Beach House' },
];

/**
 * Calendar screen mockup showing month view with bookings.
 */
export function CalendarScreenMockup() {
  return (
    <View style={styles.container}>
      <MockupStatusBar />

      {/* Filter Pills */}
      <View style={styles.filters}>
        <View style={[styles.pill, styles.pillActive]}>
          <Text style={styles.pillTextActive}>All</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Casa Verde</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Sunrise</Text>
        </View>
      </View>

      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Text style={styles.chevron}>{'\u2039'}</Text>
        <Text style={styles.monthText}>January 2026</Text>
        <Text style={styles.chevron}>{'\u203A'}</Text>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={i} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        {/* Days grid */}
        <View style={styles.daysGrid}>
          {/* Empty cells for Jan 1, 2026 (Wednesday) */}
          {[...Array(3)].map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {days.map((day) => {
            const isBooked = bookedDays.includes(day);
            const isBlocked = blockedDays.includes(day);
            return (
              <View
                key={day}
                style={[
                  styles.dayCell,
                  isBooked && styles.dayCellBooked,
                  isBlocked && styles.dayCellBlocked,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isBooked && styles.dayTextBooked,
                    isBlocked && styles.dayTextBlocked,
                  ]}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary.teal }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.neutral.gray300 }]} />
          <Text style={styles.legendText}>Blocked</Text>
        </View>
      </View>

      {/* Upcoming */}
      <View style={styles.upcoming}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcomingReservations.map((res, i) => (
          <View key={i} style={styles.reservationCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>{'\u263A'}</Text>
            </View>
            <View style={styles.reservationDetails}>
              <Text style={styles.guestName}>{res.name}</Text>
              <Text style={styles.reservationInfo}>
                {res.dates} {'\u00B7'} {res.property}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <MockupBottomNav activeTab="calendar" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  pillActive: {
    backgroundColor: Colors.primary.teal,
    borderColor: Colors.primary.teal,
  },
  pillText: {
    fontSize: 6,
    color: Colors.neutral.gray600,
  },
  pillTextActive: {
    fontSize: 6,
    color: Colors.neutral.white,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  chevron: {
    fontSize: 12,
    color: Colors.neutral.gray400,
  },
  monthText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  calendar: {
    paddingHorizontal: 8,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayHeader: {
    flex: 1,
    fontSize: 5,
    color: Colors.neutral.gray400,
    textAlign: 'center',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    marginBottom: 2,
  },
  dayCellBooked: {
    backgroundColor: Colors.primary.teal,
  },
  dayCellBlocked: {
    backgroundColor: Colors.neutral.gray300,
  },
  dayText: {
    fontSize: 6,
    color: Colors.neutral.gray700,
  },
  dayTextBooked: {
    color: Colors.neutral.white,
    fontWeight: '500',
  },
  dayTextBlocked: {
    color: Colors.neutral.gray500,
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
  upcoming: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: '600',
    color: Colors.neutral.gray700,
    marginBottom: 4,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    backgroundColor: '#d1fae5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 10,
    color: Colors.primary.teal,
  },
  reservationDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 7,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  reservationInfo: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
});
