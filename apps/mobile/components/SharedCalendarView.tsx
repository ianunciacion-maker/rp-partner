import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Reservation {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
}

interface LockedDate {
  id: string;
  date: string;
}

interface SharedCalendarViewProps {
  propertyName: string;
  year: number;
  month: number;
  reservations: Reservation[];
  lockedDates: LockedDate[];
  calendarMonthsLimit: number | null;
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export function SharedCalendarView({
  propertyName,
  year,
  month,
  reservations,
  lockedDates,
  onPrevMonth,
  onNextMonth,
  canGoPrev,
  canGoNext,
}: SharedCalendarViewProps) {
  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const dateStatusMap = useMemo(() => {
    const map = new Map<string, 'available' | 'notAvailable'>();
    const today = new Date().toISOString().split('T')[0];

    for (const locked of lockedDates) {
      map.set(locked.date, 'notAvailable');
    }

    for (const r of reservations) {
      const checkIn = new Date(r.check_in);
      const checkOut = new Date(r.check_out);
      const current = new Date(checkIn);

      while (current < checkOut) {
        const dateStr = current.toISOString().split('T')[0];
        map.set(dateStr, 'notAvailable');
        current.setDate(current.getDate() + 1);
      }
    }

    return map;
  }, [reservations, lockedDates]);

  const getDateStatus = (day: number): 'available' | 'notAvailable' => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    if (dateStatusMap.has(dateStr)) {
      return dateStatusMap.get(dateStr)!;
    }

    if (dateStr < today) return 'notAvailable';
    return 'available';
  };

  const { firstDay, daysInMonth } = getDaysInMonth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.propertyName}>{propertyName}</Text>
        <Text style={styles.subtitle}>Availability Calendar</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.bookedDot]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
      </View>

      <View style={styles.calendarHeader}>
        <Pressable
          onPress={onPrevMonth}
          style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
          disabled={!canGoPrev}
        >
          <Text style={[styles.navButtonText, !canGoPrev && styles.navButtonTextDisabled]}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable
          onPress={onNextMonth}
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          disabled={!canGoNext}
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <Text key={day} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDateStatus(day);

          return (
            <View
              key={day}
              style={[
                styles.dayCell,
                status === 'available' && styles.availableCell,
                status === 'notAvailable' && styles.notAvailableCell,
              ]}
            >
              <Text style={[
                styles.dayNumber,
                status === 'available' && styles.availableText,
                status === 'notAvailable' && styles.notAvailableText,
              ]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Tuknang</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  propertyName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.gray900,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availableDot: {
    backgroundColor: Colors.semantic.success,
  },
  bookedDot: {
    backgroundColor: Colors.semantic.error,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray700,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 28,
    color: Colors.primary.teal,
  },
  navButtonTextDisabled: {
    color: Colors.neutral.gray400,
  },
  monthTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    fontWeight: Typography.fontWeight.medium,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: Spacing.md,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.neutral.gray100,
  },
  availableCell: {
    backgroundColor: Colors.semantic.success + '20',
  },
  notAvailableCell: {
    backgroundColor: Colors.semantic.error + '20',
  },
  dayNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray900,
  },
  availableText: {
    color: Colors.semantic.success,
    fontWeight: Typography.fontWeight.semibold,
  },
  notAvailableText: {
    color: Colors.semantic.error,
    fontWeight: Typography.fontWeight.semibold,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.gray100,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
  },
});
