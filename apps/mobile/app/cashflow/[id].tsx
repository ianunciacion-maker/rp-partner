import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import type { Property, CashflowEntry } from '@/types/database';
import { Button } from '@/components/ui';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

interface CashflowWithProperty extends CashflowEntry {
  property?: Property;
}

export default function CashflowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<CashflowWithProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEntry = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('cashflow_entries')
        .select('*, property:properties(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setEntry(data);
    } catch (error) {
      console.error('Error fetching entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEntry(); }, [id]);

  const handleDelete = async () => {
    const confirmDelete = isWeb
      ? window.confirm('Delete Transaction\n\nAre you sure you want to delete this transaction? This cannot be undone.')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('cashflow_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;

      if (isWeb) {
        window.alert('Transaction deleted successfully!');
        setTimeout(() => router.replace('/(tabs)/cashflow'), 0);
      } else {
        Alert.alert('Success', 'Transaction deleted successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      if (isWeb) {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
      setIsDeleting(false);
    }
  };

  const isIncome = entry?.type === 'income';

  return (
    <View style={styles.loadingWrapper}>
      <Stack.Screen
        options={{
          title: isLoading ? 'Transaction' : (isIncome ? 'Income' : 'Expense'),
          headerBackTitle: 'Back',
        }}
      />
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary.teal} />
        </View>
      ) : !entry ? (
        <View style={styles.loading}>
          <Text style={styles.errorText}>Transaction not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      ) : (
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isIncome ? styles.incomeHeader : styles.expenseHeader]}>
          <Text style={styles.typeLabel}>{isIncome ? 'Income' : 'Expense'}</Text>
          <Text style={styles.amount}>
            {isIncome ? '+' : '-'}PHP {entry.amount?.toLocaleString()}
          </Text>
          <Text style={styles.date}>{formatDate(entry.transaction_date)}</Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{entry.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{formatCategory(entry.category)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Property</Text>
            <Text style={styles.detailValue}>{entry.property?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{formatPaymentMethod(entry.payment_method)}</Text>
          </View>
          {entry.reference_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference #</Text>
              <Text style={styles.detailValue}>{entry.reference_number}</Text>
            </View>
          )}
        </View>

        {/* Receipt */}
        {entry.receipt_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <Image source={{ uri: entry.receipt_url }} style={styles.receiptImage} />
          </View>
        )}

        {/* Notes */}
        {entry.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{entry.notes}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDateTime(entry.created_at)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            title="Edit Transaction"
            variant="primary"
            onPress={() => router.push(`/cashflow/edit?id=${id}`)}
            fullWidth
          />
        </View>

        {/* Delete Button */}
        <View style={styles.dangerSection}>
          <Button
            title="Delete Transaction"
            variant="danger"
            onPress={handleDelete}
            loading={isDeleting}
            fullWidth
          />
        </View>
      </ScrollView>
      )}
    </View>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const formatCategory = (category: string) => {
  return category.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatPaymentMethod = (method: string | null) => {
  if (!method) return 'Not specified';
  const methods: Record<string, string> = {
    cash: 'Cash',
    gcash: 'GCash',
    maya: 'Maya',
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    check: 'Check',
    other: 'Other',
  };
  return methods[method] || method;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loadingWrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: Typography.fontSize.lg, color: Colors.neutral.gray500, marginBottom: Spacing.md },
  header: { padding: Spacing.xl, alignItems: 'center' },
  incomeHeader: { backgroundColor: Colors.semantic.success },
  expenseHeader: { backgroundColor: Colors.semantic.error },
  typeLabel: { fontSize: Typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: '600' },
  amount: { fontSize: 36, fontWeight: 'bold', color: Colors.neutral.white, marginVertical: Spacing.sm },
  date: { fontSize: Typography.fontSize.md, color: 'rgba(255,255,255,0.9)' },
  section: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray500, textTransform: 'uppercase', marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray100 },
  detailLabel: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  detailValue: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  receiptImage: { width: '100%', height: 300, borderRadius: BorderRadius.lg, resizeMode: 'contain', backgroundColor: Colors.neutral.gray100 },
  notes: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600, lineHeight: 22 },
  actionSection: { padding: Spacing.lg, paddingBottom: 0 },
  dangerSection: { padding: Spacing.lg, marginBottom: Spacing.xxl },
});
