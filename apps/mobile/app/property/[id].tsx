import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import type { Property } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Property not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: property.name, headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.coverImage}>
            <Text style={styles.coverInitial}>{property.name.charAt(0)}</Text>
          </View>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyType}>{property.property_type || 'Property'}</Text>
          {property.address && <Text style={styles.address}>{property.address}</Text>}
          {property.city && <Text style={styles.location}>{property.city}{property.province ? `, ${property.province}` : ''}</Text>}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{property.max_guests}</Text>
            <Text style={styles.statLabel}>Max Guests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{property.currency} {property.base_rate?.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Base Rate</Text>
          </View>
        </View>

        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>View Calendar</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Reservation</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>View Cashflow</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral.gray50 },
  errorText: { fontSize: Typography.fontSize.lg, color: Colors.neutral.gray500, marginBottom: Spacing.md },
  backButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  backButtonText: { color: Colors.neutral.white, fontWeight: '600' },
  header: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.neutral.white, marginBottom: Spacing.md },
  coverImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  coverInitial: { fontSize: 40, fontWeight: 'bold', color: Colors.neutral.white },
  propertyName: { fontSize: Typography.fontSize['2xl'], fontWeight: 'bold', color: Colors.neutral.gray900 },
  propertyType: { fontSize: Typography.fontSize.md, color: Colors.primary.teal, textTransform: 'capitalize', marginTop: Spacing.xs },
  address: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.lg },
  location: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: Spacing.xs },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.neutral.white, padding: Spacing.md, borderRadius: BorderRadius.lg, marginHorizontal: Spacing.xs, alignItems: 'center', ...Shadows.sm },
  statValue: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', color: Colors.neutral.gray900 },
  statLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: Spacing.xs },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.md },
  description: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600, lineHeight: 22 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  actionIcon: { fontSize: 20, marginRight: Spacing.md },
  actionText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
});
