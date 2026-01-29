import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, Pressable, Platform, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [entry, setEntry] = useState<CashflowWithProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(true);
  const [receiptError, setReceiptError] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

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

  const handleRetryReceipt = () => {
    setReceiptError(false);
    setReceiptLoading(true);
  };

  const handleSaveReceipt = async () => {
    if (!entry?.receipt_url) return;

    if (isWeb) {
      // Open in new tab for web
      window.open(entry.receipt_url, '_blank');
    } else {
      // Native: download and share
      setIsSavingReceipt(true);
      try {
        const filename = `receipt-${entry.id}.jpg`;
        const fileUri = documentDirectory + filename;

        const downloadResult = await downloadAsync(
          entry.receipt_url,
          fileUri
        );

        if (downloadResult.status !== 200) {
          throw new Error('Failed to download receipt');
        }

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save receipt');
      } finally {
        setIsSavingReceipt(false);
      }
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
            <View style={styles.receiptHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Receipt</Text>
              {!receiptError && (
                <Pressable onPress={handleSaveReceipt} disabled={isSavingReceipt}>
                  <Text style={styles.receiptLinkText}>
                    {isSavingReceipt ? 'Loading...' : (isWeb ? 'Open ↗' : 'Save/Share')}
                  </Text>
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => !receiptError && !receiptLoading && setPreviewVisible(true)}
              disabled={receiptError || receiptLoading}
            >
              <View style={styles.receiptContainer}>
                {receiptLoading && !receiptError && (
                  <View style={styles.receiptLoadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.primary.teal} />
                    <Text style={styles.receiptLoadingText}>Loading receipt...</Text>
                  </View>
                )}
                {receiptError ? (
                  <View style={styles.receiptErrorContainer}>
                    <Text style={styles.receiptErrorIcon}>⚠️</Text>
                    <Text style={styles.receiptErrorText}>Failed to load receipt</Text>
                    <Text style={styles.receiptErrorSubtext}>
                      The image may have been removed or is temporarily unavailable
                    </Text>
                    <Button
                      title="Retry"
                      variant="secondary"
                      onPress={handleRetryReceipt}
                      style={styles.retryButton}
                    />
                  </View>
                ) : (
                  <Image
                    key={receiptError ? 'retry' : 'initial'}
                    source={{ uri: entry.receipt_url }}
                    style={[styles.receiptImage, receiptLoading && styles.receiptImageHidden]}
                    onLoadStart={() => setReceiptLoading(true)}
                    onLoadEnd={() => setReceiptLoading(false)}
                    onError={() => {
                      setReceiptLoading(false);
                      setReceiptError(true);
                    }}
                  />
                )}
              </View>
              {!receiptError && !receiptLoading && (
                <Text style={styles.tapToPreview}>Tap to preview full screen</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Receipt Preview Modal */}
        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setPreviewVisible(false)}>
            <View style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕ Close</Text>
            </View>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <ScrollView
                style={{ maxHeight: screenHeight * 0.85 }}
                contentContainerStyle={styles.modalContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
                bouncesZoom
                centerContent
              >
                <Image
                  source={{ uri: entry.receipt_url }}
                  style={{
                    width: screenWidth - 32,
                    height: screenHeight * 0.8,
                  }}
                  resizeMode="contain"
                />
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

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
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptLinkText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.teal,
    fontWeight: '500',
  },
  receiptContainer: { position: 'relative', minHeight: 200 },
  receiptImage: { width: '100%', height: 300, borderRadius: BorderRadius.lg, resizeMode: 'contain', backgroundColor: Colors.neutral.gray100 },
  receiptImageHidden: { opacity: 0 },
  receiptLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  receiptLoadingText: { marginTop: Spacing.sm, fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500 },
  receiptErrorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.lg,
    minHeight: 200,
    justifyContent: 'center',
  },
  receiptErrorIcon: { fontSize: 32, marginBottom: Spacing.sm },
  receiptErrorText: { fontSize: Typography.fontSize.md, fontWeight: '600', color: Colors.neutral.gray700, marginBottom: Spacing.xs },
  receiptErrorSubtext: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, textAlign: 'center', marginBottom: Spacing.md },
  retryButton: { marginTop: Spacing.sm },
  tapToPreview: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
  },
  modalCloseText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  notes: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray600, lineHeight: 22 },
  actionSection: { padding: Spacing.lg, paddingBottom: 0 },
  dangerSection: { padding: Spacing.lg, marginBottom: Spacing.xxl },
});
