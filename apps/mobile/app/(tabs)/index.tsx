import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { FeatureLimitIndicator } from '@/components/subscription/FeatureLimitIndicator';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { supabase } from '@/services/supabase';
import type { Property } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchSubscription, checkPendingSubmission } = useSubscriptionStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh subscription and properties when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        Promise.all([
          fetchSubscription(user.id),
          checkPendingSubmission(user.id),
          fetchProperties(),
        ]);
      } else {
        fetchProperties();
      }
    }, [user?.id])
  );

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <View style={styles.wrapper}>
      <SubscriptionBanner />
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchProperties(); }} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'}!</Text>
            <View style={styles.subtitleRow}>
              <FeatureLimitIndicator feature="properties" currentUsage={properties.length} />
              <Text style={styles.subtitleSuffix}> {properties.length === 1 ? 'property' : 'properties'}</Text>
            </View>
          </View>
        </View>

        {properties.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No Properties Yet</Text>
            <Text style={styles.emptyText}>Add your first property to get started</Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push('/property/add')}>
              <Text style={styles.emptyButtonText}>+ Add Property</Text>
            </Pressable>
          </View>
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => router.push(`/property/${property.id}`)}
            />
          ))
        )}
      </ScrollView>

      {properties.length > 0 && (
        <Pressable style={styles.fab} onPress={() => router.push('/property/add')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  container: { flex: 1, padding: Spacing.lg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: Spacing.md },
  greeting: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.medium, color: Colors.neutral.gray500 },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  subtitleSuffix: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray500 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold, color: Colors.neutral.gray900 },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500, marginBottom: Spacing.lg },
  emptyButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.neutral.white, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.md },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  fabText: { fontSize: 28, color: Colors.neutral.white, lineHeight: 30 },
});
