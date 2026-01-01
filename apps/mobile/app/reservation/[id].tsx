import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import type { Property, Reservation } from '@/types/database';
import { Button } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { BottomNav } from '@/components/BottomNav';

const isWeb = Platform.OS === 'web';

interface ReservationWithProperty extends Reservation {
  property?: Property;
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: Colors.semantic.warning },
  { label: 'Confirmed', value: 'confirmed', color: Colors.semantic.success },
  { label: 'Checked In', value: 'checked_in', color: Colors.primary.teal },
  { label: 'Completed', value: 'completed', color: Colors.neutral.gray400 },
  { label: 'Cancelled', value: 'cancelled', color: Colors.semantic.error },
  { label: 'No Show', value: 'no_show', color: Colors.semantic.error },
];

export default function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reservation, setReservation] = useState<ReservationWithProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReservation = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, property:properties(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setReservation(data);
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReservation(); }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!reservation) return;

    const doUpdate = async () => {
      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from('reservations')
          .update({ status: newStatus })
          .eq('id', reservation.id);
        if (error) throw error;
        setReservation((prev) => prev ? { ...prev, status: newStatus } : null);
      } catch (error: any) {
        if (isWeb) {
          window.alert(error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      } finally {
        setIsUpdating(false);
      }
    };

    if (isWeb) {
      if (window.confirm(`Change status to "${newStatus}"?`)) {
        doUpdate();
      }
    } else {
      Alert.alert(
        'Update Status',
        `Change status to "${newStatus}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Update', onPress: doUpdate },
        ]
      );
    }
  };

  const markDepositPaid = async () => {
    if (!reservation) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ deposit_paid: true })
        .eq('id', reservation.id);
      if (error) throw error;
      setReservation((prev) => prev ? { ...prev, deposit_paid: true } : null);
      if (isWeb) {
        window.alert('Deposit marked as paid');
      } else {
        Alert.alert('Success', 'Deposit marked as paid');
      }
    } catch (error: any) {
      if (isWeb) {
        window.alert(error.message);
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteReservation = async () => {
    const doDelete = async () => {
      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', id);
        if (error) throw error;
        if (isWeb) {
          router.replace('/(tabs)/calendar');
        } else {
          router.back();
        }
      } catch (error: any) {
        if (isWeb) {
          window.alert(error.message);
        } else {
          Alert.alert('Error', error.message);
        }
        setIsUpdating(false);
      }
    };

    if (isWeb) {
      if (window.confirm('Are you sure you want to delete this reservation? This cannot be undone.')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Reservation',
        'Are you sure you want to delete this reservation? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  if (!reservation) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Reservation not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === reservation.status);
  const balance = (reservation.total_amount || 0) - (reservation.deposit_amount || 0);

  return (
    <View style={styles.wrapper}>
      <Stack.Screen
        options={{
          title: 'Reservation',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={() => router.push(`/reservation/edit?id=${id}`)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: currentStatus?.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: currentStatus?.color }]} />
          <Text style={[styles.statusText, { color: currentStatus?.color }]}>{currentStatus?.label}</Text>
        </View>

        {/* Guest Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest</Text>
          <Text style={styles.guestName}>{reservation.guest_name}</Text>
          {reservation.guest_phone && (
            <Pressable style={styles.contactRow}>
              <Text style={styles.contactIcon}>📱</Text>
              <Text style={styles.contactText}>{reservation.guest_phone}</Text>
            </Pressable>
          )}
          {reservation.guest_email && (
            <Pressable style={styles.contactRow}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>{reservation.guest_email}</Text>
            </Pressable>
          )}
          <View style={styles.guestCountRow}>
            <Text style={styles.guestCountIcon}>👥</Text>
            <Text style={styles.guestCountText}>{reservation.guest_count} guests</Text>
          </View>
        </View>

        {/* Property & Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Property</Text>
            <Text style={styles.detailValue}>{reservation.property?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>{formatDate(reservation.check_in)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out</Text>
            <Text style={styles.detailValue}>{formatDate(reservation.check_out)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nights</Text>
            <Text style={styles.detailValue}>{reservation.nights}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>{reservation.source || 'Direct'}</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>PHP {reservation.total_amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deposit</Text>
            <View style={styles.depositRow}>
              <Text style={styles.detailValue}>PHP {reservation.deposit_amount?.toLocaleString()}</Text>
              {reservation.deposit_paid ? (
                <View style={styles.paidBadge}><Text style={styles.paidBadgeText}>Paid</Text></View>
              ) : reservation.deposit_amount && reservation.deposit_amount > 0 ? (
                <Pressable style={styles.markPaidButton} onPress={markDepositPaid} disabled={isUpdating}>
                  <Text style={styles.markPaidButtonText}>Mark Paid</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={[styles.detailRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>PHP {balance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Notes */}
        {reservation.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{reservation.notes}</Text>
          </View>
        )}

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.statusButtons}>
            {STATUS_OPTIONS.filter((s) => s.value !== reservation.status).map((status) => (
              <Pressable
                key={status.value}
                style={[styles.statusButton, { borderColor: status.color }]}
                onPress={() => updateStatus(status.value)}
                disabled={isUpdating}
              >
                <Text style={[styles.statusButtonText, { color: status.color }]}>{status.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Delete Button */}
        <View style={styles.dangerSection}>
          <Button
            title="Delete Reservation"
            variant="danger"
            onPress={deleteReservation}
            loading={isUpdating}
            fullWidth
          />
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: Typography.fontSize.lg, color: Colors.neutral.gray500, marginBottom: Spacing.md },
  headerButton: { marginRight: Spacing.sm },
  headerButtonText: { color: Colors.primary.teal, fontSize: Typography.fontSize.md, fontWeight: '600' },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  statusText: { fontSize: Typography.fontSize.md, fontWeight: '600', textTransform: 'uppercase' },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray500, textTransform: 'uppercase', marginBottom: Spacing.md },
  guestName: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs },
  contactIcon: { fontSize: 16, marginRight: Spacing.sm },
  contactText: { fontSize: Typography.fontSize.md, color: Colors.primary.teal },
  guestCountRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  guestCountIcon: { fontSize: 16, marginRight: Spacing.sm },
  guestCountText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  detailLabel: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  detailValue: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900, fontWeight: '500' },
  amountValue: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900, fontWeight: '600' },
  depositRow: { flexDirection: 'row', alignItems: 'center' },
  paidBadge: { backgroundColor: Colors.semantic.success + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginLeft: Spacing.sm },
  paidBadgeText: { fontSize: Typography.fontSize.xs, color: Colors.semantic.success, fontWeight: '600' },
  markPaidButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm, marginLeft: Spacing.sm },
  markPaidButtonText: { fontSize: Typography.fontSize.xs, color: Colors.neutral.white, fontWeight: '600' },
  balanceRow: { borderBottomWidth: 0, paddingTop: Spacing.md },
  balanceLabel: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  balanceValue: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', color: Colors.primary.teal },
  notes: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600, lineHeight: 22 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1.5 },
  statusButtonText: { fontSize: Typography.fontSize.sm, fontWeight: '600' },
  dangerSection: { padding: Spacing.lg, marginBottom: Spacing.xxl },
});
