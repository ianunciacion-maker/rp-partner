import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

const bookedDays = [9, 10, 11, 22, 23, 24, 28, 29];
const blockedDays = [15, 16];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const upcomingReservations = [
  { name: 'Juan Santos', dates: 'Jan 9-11', property: 'Casa Verde', status: 'Confirmed' },
  { name: 'Maria Cruz', dates: 'Jan 22-24', property: 'Sunrise', status: 'Confirmed' },
  { name: 'Ana Reyes', dates: 'Jan 28-29', property: 'Beach House', status: 'Pending' },
];

export function DesktopCalendarScreenMockup() {
  return (
    <View style={styles.container}>
      <View style={styles.layout}>
        {/* Calendar main area */}
        <View style={styles.calendarArea}>
          {/* Filter Pills */}
          <View style={styles.topBar}>
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
              <View style={styles.pill}>
                <Text style={styles.pillText}>Beach House</Text>
              </View>
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
            <View style={styles.dayHeaders}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <Text key={i} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>
            <View style={styles.daysGrid}>
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
              <Text style={styles.legendLabel}>Booked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.neutral.gray300 }]} />
              <Text style={styles.legendLabel}>Blocked</Text>
            </View>
          </View>
        </View>

        {/* Sidebar: Upcoming */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Upcoming Reservations</Text>
          {upcomingReservations.map((res, i) => (
            <View key={i} style={styles.reservationCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>{'\u263A'}</Text>
              </View>
              <View style={styles.reservationDetails}>
                <Text style={styles.guestName}>{res.name}</Text>
                <Text style={styles.reservationInfo}>{res.dates}</Text>
                <Text style={styles.reservationInfo}>{res.property}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: res.status === 'Confirmed' ? '#d1fae5' : '#fef3c7' },
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: res.status === 'Confirmed' ? '#047857' : '#b45309' },
                ]}>
                  {res.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.gray50,
  },
  layout: {
    flexDirection: 'row',
    minHeight: 360,
  },
  calendarArea: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  pillActive: {
    backgroundColor: Colors.primary.teal,
    borderColor: Colors.primary.teal,
  },
  pillText: {
    fontSize: 9,
    color: Colors.neutral.gray600,
  },
  pillTextActive: {
    fontSize: 9,
    color: Colors.neutral.white,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  chevron: {
    fontSize: 16,
    color: Colors.neutral.gray400,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  calendar: {
    paddingHorizontal: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    fontSize: 8,
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
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 2,
  },
  dayCellBooked: {
    backgroundColor: Colors.primary.teal,
  },
  dayCellBlocked: {
    backgroundColor: Colors.neutral.gray300,
  },
  dayText: {
    fontSize: 10,
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
    paddingTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 9,
    color: Colors.neutral.gray500,
  },
  sidebar: {
    width: 200,
    backgroundColor: Colors.neutral.white,
    borderLeftWidth: 1,
    borderLeftColor: Colors.neutral.gray200,
    padding: 12,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral.gray700,
    marginBottom: 10,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 12,
    color: Colors.primary.teal,
  },
  reservationDetails: {
    flex: 1,
  },
  guestName: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  reservationInfo: {
    fontSize: 8,
    color: Colors.neutral.gray500,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 7,
    fontWeight: '500',
  },
});
