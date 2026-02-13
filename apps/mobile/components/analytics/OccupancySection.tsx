import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getAllPropertiesOccupancy, calculatePropertyOccupancy } from '@/services/analytics';
import type { OccupancyData } from '@/services/analytics';
import type { Property } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface OccupancySectionProps {
  selectedProperty: string | null;
  selectedMonth: number;
  selectedYear: number;
  properties: Property[];
}

export function OccupancySection({ selectedProperty, selectedMonth, selectedYear, properties }: OccupancySectionProps) {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchOccupancy = async () => {
      if (properties.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        if (selectedProperty) {
          const result = await calculatePropertyOccupancy(selectedProperty, selectedYear, selectedMonth);
          if (!cancelled) setOccupancyData(result ? [result] : []);
        } else {
          const results = await getAllPropertiesOccupancy(
            selectedYear,
            selectedMonth,
            properties.map((p) => p.id)
          );
          if (!cancelled) setOccupancyData(results);
        }
      } catch (error) {
        console.error('Error fetching occupancy:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOccupancy();
    return () => { cancelled = true; };
  }, [selectedProperty, selectedMonth, selectedYear, properties]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary.teal} />
      </View>
    );
  }

  if (occupancyData.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Occupancy</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {occupancyData.map((data) => (
          <View key={data.propertyId} style={styles.card}>
            <Text style={styles.propertyName} numberOfLines={1}>{data.propertyName}</Text>
            <Text style={styles.rateText}>{data.occupancyRate}%</Text>
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${data.occupancyRate}%` }, getBarColor(data.occupancyRate)]} />
            </View>
            <Text style={styles.detailText}>
              {data.bookedNights} booked / {data.totalDays - data.lockedDays} available
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function getBarColor(rate: number) {
  if (rate >= 70) return { backgroundColor: Colors.semantic.success };
  if (rate >= 40) return { backgroundColor: Colors.semantic.warning };
  return { backgroundColor: Colors.semantic.error };
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral.white,
    paddingLeft: Spacing.md,
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 160,
    ...Shadows.sm,
  },
  propertyName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray700,
    marginBottom: Spacing.xs,
  },
  rateText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
  },
  barContainer: {
    height: 8,
    backgroundColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  detailText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
});
