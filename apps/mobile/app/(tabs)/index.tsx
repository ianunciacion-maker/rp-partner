import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
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

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchProperties(); }} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.full_name?.split(' ')[0] || 'there'}!</Text>
        <Text style={styles.subtitle}>{properties.length} {properties.length === 1 ? 'property' : 'properties'}</Text>
      </View>

      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyTitle}>No Properties Yet</Text>
          <Text style={styles.emptyText}>Add your first property to get started</Text>
        </View>
      ) : (
        properties.map((property) => (
          <Pressable key={property.id} style={styles.propertyCard} onPress={() => router.push(`/property/${property.id}`)}>
            <View style={styles.propertyImage}><Text style={styles.propertyInitial}>{property.name.charAt(0)}</Text></View>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{property.name}</Text>
              <Text style={styles.propertyLocation}>{property.city || 'Location not set'}</Text>
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50, padding: Spacing.lg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: Spacing.lg },
  greeting: { fontSize: Typography.fontSize['2xl'], fontWeight: 'bold', color: Colors.neutral.gray900 },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  propertyCard: { flexDirection: 'row', backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  propertyImage: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  propertyInitial: { fontSize: 24, fontWeight: 'bold', color: Colors.neutral.white },
  propertyInfo: { flex: 1, justifyContent: 'center' },
  propertyName: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  propertyLocation: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
});
