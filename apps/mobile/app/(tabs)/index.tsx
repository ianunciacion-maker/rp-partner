import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Platform, ListRenderItem } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/stores/authStore';
import { useSubscriptionActions } from '@/stores/subscriptionStore';
import { FeatureLimitIndicator } from '@/components/subscription/FeatureLimitIndicator';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { supabase } from '@/services/supabase';
import type { Property } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { useResponsive } from '@/hooks/useResponsive';

export default function HomeScreen() {
  const router = useRouter();
  const user = useUser();
  const { fetchSubscription, checkPendingSubmission } = useSubscriptionActions();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isDesktop, isTablet } = useResponsive();

  // Memoized number of columns based on screen size
  const numColumns = useMemo(() => isDesktop ? 3 : isTablet ? 2 : 1, [isDesktop, isTablet]);

  // Stable key for FlatList when numColumns changes
  const listKey = useMemo(() => `grid-${numColumns}`, [numColumns]);

  // Memoized render item function
  const renderPropertyItem: ListRenderItem<Property> = useCallback(({ item }) => (
    <View style={[styles.propertyGridItem, isDesktop && styles.propertyGridItemDesktop, isTablet && styles.propertyGridItemTablet]}>
      <PropertyCard
        property={item}
        onPress={() => router.push(`/property/${item.id}`)}
      />
    </View>
  ), [router, isDesktop, isTablet]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Property) => item.id, []);

  // Memoized empty state component - must be before any early returns
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏠</Text>
      <Text style={styles.emptyTitle}>No Properties Yet</Text>
      <Text style={styles.emptyText}>Add your first property to get started</Text>
      <Pressable style={styles.emptyButton} onPress={() => router.push('/property/add')}>
        <Text style={styles.emptyButtonText}>+ Add Property</Text>
      </Pressable>
    </View>
  ), [router]);

  // Memoized header component - must be before any early returns
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'}!</Text>
        <View style={styles.subtitleRow}>
          <FeatureLimitIndicator feature="properties" currentUsage={properties.length} />
          <Text style={styles.subtitleSuffix}> {properties.length === 1 ? 'property' : 'properties'}</Text>
        </View>
      </View>
    </View>
  ), [user?.full_name, properties.length]);

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
      <FlatList
        key={listKey}
        data={properties}
        renderItem={renderPropertyItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        style={[styles.container, isDesktop && styles.containerDesktop]}
        contentContainerStyle={properties.length === 0 ? styles.emptyContainer : undefined}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { setIsRefreshing(true); fetchProperties(); }}
          />
        }
      />

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
  containerDesktop: { padding: Spacing.xl },
  emptyContainer: { flexGrow: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: Spacing.md },
  greeting: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.medium, color: Colors.neutral.gray500 },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  subtitleSuffix: { fontSize: Typography.fontSize.xs, color: Colors.neutral.gray500 },
  propertyGridItem: { flex: 1 },
  propertyGridItemTablet: {
    paddingHorizontal: Spacing.sm,
    ...(Platform.OS === 'web' ? { boxSizing: 'border-box' } as any : {}),
  },
  propertyGridItemDesktop: {
    paddingHorizontal: Spacing.sm,
    ...(Platform.OS === 'web' ? { boxSizing: 'border-box' } as any : {}),
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.semibold, color: Colors.neutral.gray900 },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500, marginBottom: Spacing.lg },
  emptyButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.neutral.white, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.md },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  fabText: { fontSize: 28, color: Colors.neutral.white, lineHeight: 30 },
});
