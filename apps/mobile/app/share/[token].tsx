import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SharedCalendarView } from '@/components/SharedCalendarView';
import { fetchSharedCalendar } from '@/services/shareCalendar';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface CalendarData {
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

export default function SharedCalendarScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  const loadCalendarData = useCallback(async (y: number, m: number) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSharedCalendar(token, y, m);
      setCalendarData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCalendarData(year, month);
  }, [year, month, loadCalendarData]);

  const canNavigateToMonth = (targetYear: number, targetMonth: number): boolean => {
    if (!calendarData) return false;
    if (calendarData.calendarMonthsLimit === null) return true;

    const monthOffset = (targetYear - calendarData.currentYear) * 12 + (targetMonth - calendarData.currentMonth);
    return Math.abs(monthOffset) <= calendarData.calendarMonthsLimit;
  };

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    if (canNavigateToMonth(newYear, newMonth)) {
      setMonth(newMonth);
      setYear(newYear);
    }
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    if (canNavigateToMonth(newYear, newMonth)) {
      setMonth(newMonth);
      setYear(newYear);
    }
  };

  const canGoPrev = (() => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    return canNavigateToMonth(prevYear, prevMonth);
  })();

  const canGoNext = (() => {
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    return canNavigateToMonth(nextYear, nextMonth);
  })();

  if (isLoading && !calendarData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📅</Text>
        <Text style={styles.errorTitle}>Calendar Unavailable</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!calendarData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>No Data</Text>
        <Text style={styles.errorMessage}>Unable to load calendar data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SharedCalendarView
        propertyName={calendarData.property.name}
        year={year}
        month={month}
        reservations={calendarData.reservations}
        lockedDates={calendarData.lockedDates}
        calendarMonthsLimit={calendarData.calendarMonthsLimit}
        currentYear={calendarData.currentYear}
        currentMonth={calendarData.currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
    textAlign: 'center',
    maxWidth: 300,
  },
});
