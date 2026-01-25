import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, RefreshControl, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/services/supabase';
import type { Property, Reservation } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { BottomNav } from '@/components/BottomNav';

const isWeb = Platform.OS === 'web';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [propertyRes, reservationsRes] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('reservations').select('*').eq('property_id', id).order('check_in', { ascending: false }).limit(5),
      ]);

      if (propertyRes.error) throw propertyRes.error;
      setProperty(propertyRes.data);
      setReservations(reservationsRes.data || []);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [id])
  );

  const handleDelete = async () => {
    const doDelete = async () => {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        if (isWeb) {
          router.replace('/(tabs)');
        } else {
          router.back();
        }
      } catch (error: any) {
        if (isWeb) {
          window.alert(error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      }
    };

    if (isWeb) {
      if (window.confirm('Are you sure you want to delete this property? All reservations and cashflow entries will also be deleted.')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Property',
        'Are you sure you want to delete this property? All reservations and cashflow entries will also be deleted.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.loading}>
        <Stack.Screen options={{ title: 'Not Found', headerBackTitle: 'Back' }} />
        <Text style={styles.errorText}>Property not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const upcomingReservations = reservations.filter(
    (r) => new Date(r.check_in) >= new Date() && !['cancelled', 'no_show'].includes(r.status)
  );

  return (
    <View style={styles.wrapper}>
      <Stack.Screen
        options={{
          title: property.name,
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={() => router.push(`/property/edit?id=${id}`)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.header}>
          <View style={styles.coverImage}>
            {property.cover_image_url ? (
              <Image source={{ uri: property.cover_image_url }} style={styles.coverImageActual} />
            ) : (
              <Text style={styles.coverInitial}>{property.name.charAt(0)}</Text>
            )}
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
            <Text style={styles.statValue}>{upcomingReservations.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
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
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/property/${id}/calendar`)}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>View Calendar</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/reservation/add?propertyId=${id}`)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Reservation</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/cashflow/add?propertyId=${id}`)}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Add Income/Expense</Text>
            <Text style={styles.actionArrow}>›</Text>
          </Pressable>
        </View>

        {/* Recent Reservations */}
        {reservations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reservations</Text>
            {reservations.slice(0, 3).map((reservation) => (
              <Pressable
                key={reservation.id}
                style={styles.reservationCard}
                onPress={() => router.push(`/reservation/${reservation.id}`)}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(reservation.status) }]} />
                <View style={styles.reservationInfo}>
                  <Text style={styles.reservationGuest}>{reservation.guest_name}</Text>
                  <Text style={styles.reservationDates}>
                    {formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}
                  </Text>
                </View>
                <Text style={styles.reservationAmount}>PHP {reservation.total_amount?.toLocaleString()}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Property</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return Colors.semantic.success;
    case 'pending': return Colors.semantic.warning;
    case 'checked_in': return Colors.primary.teal;
    case 'completed': return Colors.neutral.gray400;
    case 'cancelled': return Colors.semantic.error;
    default: return Colors.neutral.gray400;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral.gray50 },
  errorText: { fontSize: Typography.fontSize.lg, color: Colors.neutral.gray500, marginBottom: Spacing.md },
  backButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  backButtonText: { color: Colors.neutral.white, fontWeight: '600' },
  headerButton: { marginRight: Spacing.sm },
  headerButtonText: { color: Colors.primary.teal, fontSize: Typography.fontSize.md, fontWeight: '600' },
  header: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.neutral.white, marginBottom: Spacing.md },
  coverImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary.teal, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, overflow: 'hidden' },
  coverImageActual: { width: 100, height: 100, resizeMode: 'cover' },
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
  actionText: { flex: 1, fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  actionArrow: { fontSize: 20, color: Colors.neutral.gray400 },
  reservationCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md },
  reservationInfo: { flex: 1 },
  reservationGuest: { fontSize: Typography.fontSize.md, fontWeight: '500', color: Colors.neutral.gray900 },
  reservationDates: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: 2 },
  reservationAmount: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.primary.teal },
  dangerSection: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.xxl },
  dangerTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.semantic.error, textTransform: 'uppercase', marginBottom: Spacing.md },
  deleteButton: { borderWidth: 1, borderColor: Colors.semantic.error, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  deleteButtonText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.semantic.error },
});
