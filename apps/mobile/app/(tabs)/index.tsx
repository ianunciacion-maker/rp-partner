import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase';
import type { Property } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
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

  useEffect(() => { fetchProperties(); }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchProperties(); }} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'}!</Text>
            <Text style={styles.subtitle}>{properties.length} {properties.length === 1 ? 'property' : 'properties'}</Text>
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
            <Pressable key={property.id} style={styles.propertyCard} onPress={() => router.push(`/property/${property.id}`)}>
              <View style={styles.propertyImage}>
                {property.cover_image_url ? (
                  <Image source={{ uri: property.cover_image_url }} style={styles.propertyImageActual} />
                ) : (
                  <Text style={styles.propertyInitial}>{property.name.charAt(0)}</Text>
                )}
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>{property.name}</Text>
                <Text style={styles.propertyLocation}>{property.city || 'Location not set'}</Text>
                <Text style={styles.propertyRate}>PHP {property.base_rate?.toLocaleString()}/night</Text>
              </View>
            </Pressable>
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
  header: { marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.fontSize['2xl'], fontWeight: 'bold', color: Colors.neutral.gray900 },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500, marginBottom: Spacing.lg },
  emptyButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.neutral.white, fontWeight: '600', fontSize: Typography.fontSize.md },
  propertyCard: { flexDirection: 'row', backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  propertyImage: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, overflow: 'hidden' },
  propertyImageActual: { width: 60, height: 60, resizeMode: 'cover' },
  propertyInitial: { fontSize: 24, fontWeight: 'bold', color: Colors.neutral.white },
  propertyInfo: { flex: 1, justifyContent: 'center' },
  propertyName: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  propertyLocation: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
  propertyRate: { fontSize: Typography.fontSize.sm, color: Colors.primary.teal, fontWeight: '500', marginTop: Spacing.xs },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  fabText: { fontSize: 28, color: Colors.neutral.white, lineHeight: 30 },
});
