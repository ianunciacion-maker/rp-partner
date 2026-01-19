import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Modal, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { FeatureLimitIndicator } from '@/components/subscription/FeatureLimitIndicator';
import type { Property, CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

interface MonthOption {
  label: string;
  value: string; // YYYY-MM format
  year: number;
  month: number;
}

const generateMonthOptions = (limit?: number | null): MonthOption[] => {
  const options: MonthOption[] = [];
  const now = new Date();
  const maxMonths = limit === null ? 12 : Math.min(limit || 2, 12);
  for (let i = 0; i < maxMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }
  return options;
};

interface CashflowWithProperty extends CashflowEntry {
  property?: Property;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CashflowScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { plan, canExportReportMonth, fetchSubscription, fetchPlans } = useSubscriptionStore();
  const [entries, setEntries] = useState<CashflowWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [exportType, setExportType] = useState<'both' | 'income' | 'expense'>('both');
  const [isExporting, setIsExporting] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Fetch subscription data on mount
  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchPlans();
    }
  }, [user?.id]);

  // Generate month options based on subscription plan
  const monthOptions = generateMonthOptions(plan?.report_months_limit);

  const fetchData = async () => {
    try {
      // Fetch properties
      const { data: propsData } = await supabase.from('properties').select('*');
      setProperties(propsData || []);

      // Fetch cashflow entries for the selected month
      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];

      let query = supabase
        .from('cashflow_entries')
        .select('*, property:properties(*)')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false });

      if (selectedProperty) {
        query = query.eq('property_id', selectedProperty);
      }

      const { data } = await query;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching cashflow:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh when screen comes into focus (also fires on initial mount)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedProperty, selectedMonth, selectedYear])
  );

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);
  const netCashflow = totalIncome - totalExpense;

  // Calculate months back from current date
  const getMonthsBack = (year: number, month: number) => {
    const now = new Date();
    return (now.getFullYear() - year) * 12 + (now.getMonth() - month);
  };

  const prevMonth = () => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    if (selectedMonth === 0) {
      newMonth = 11;
      newYear = selectedYear - 1;
    } else {
      newMonth = selectedMonth - 1;
    }

    const monthsBack = getMonthsBack(newYear, newMonth);
    if (!canExportReportMonth(monthsBack)) {
      setShowUpgradePrompt(true);
      return;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const toggleMonthSelection = (monthValue: string) => {
    setSelectedMonths((prev) =>
      prev.includes(monthValue)
        ? prev.filter((m) => m !== monthValue)
        : [...prev, monthValue]
    );
  };

  const selectAllMonths = () => {
    if (selectedMonths.length === monthOptions.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths(monthOptions.map((m) => m.value));
    }
  };

  const generateCSV = (data: CashflowWithProperty[]): string => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Property', 'Payment Method', 'Reference', 'Notes'];
    const rows = data.map((entry) => [
      entry.transaction_date,
      entry.type,
      entry.category,
      `"${(entry.description || '').replace(/"/g, '""')}"`,
      entry.amount?.toString() || '0',
      `"${(entry.property?.name || 'Unknown').replace(/"/g, '""')}"`,
      entry.payment_method || '',
      entry.reference_number || '',
      `"${(entry.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  };

  const handleExport = async () => {
    if (selectedMonths.length === 0) {
      if (isWeb) {
        window.alert('Please select at least one month to export.');
      } else {
        const Alert = require('react-native').Alert;
        Alert.alert('No Months Selected', 'Please select at least one month to export.');
      }
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all entries for selected months
      const allEntries: CashflowWithProperty[] = [];

      for (const monthValue of selectedMonths) {
        const [year, month] = monthValue.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        let query = supabase
          .from('cashflow_entries')
          .select('*, property:properties(*)')
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate)
          .order('transaction_date', { ascending: true });

        if (selectedProperty) {
          query = query.eq('property_id', selectedProperty);
        }

        const { data } = await query;
        if (data) {
          allEntries.push(...data);
        }
      }

      // Filter by export type
      let filteredEntries = allEntries;
      if (exportType === 'income') {
        filteredEntries = allEntries.filter((e) => e.type === 'income');
      } else if (exportType === 'expense') {
        filteredEntries = allEntries.filter((e) => e.type === 'expense');
      }

      // Sort by date
      filteredEntries.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date));

      if (filteredEntries.length === 0) {
        if (isWeb) {
          window.alert('No transactions found for the selected filters.');
        } else {
          const Alert = require('react-native').Alert;
          Alert.alert('No Data', 'No transactions found for the selected filters.');
        }
        setIsExporting(false);
        return;
      }

      const csv = generateCSV(filteredEntries);
      const typeLabel = exportType === 'both' ? 'all' : exportType;
      const filename = `cashflow_${typeLabel}_${new Date().toISOString().split('T')[0]}.csv`;

      if (isWeb) {
        // Web: Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        window.alert(`Exported ${filteredEntries.length} transactions successfully!`);
      } else {
        // Native: Save to file and share
        const fileUri = documentDirectory + filename;
        await writeAsStringAsync(fileUri, csv, {
          encoding: EncodingType.UTF8,
        });

        if (await isAvailableAsync()) {
          await shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Cashflow Data',
          });
        } else {
          const Alert = require('react-native').Alert;
          Alert.alert('Success', `Exported ${filteredEntries.length} transactions to ${filename}`);
        }
      }

      setShowExportModal(false);
      setSelectedMonths([]);
      setExportType('both');
    } catch (error: any) {
      console.error('Export error:', error);
      if (isWeb) {
        window.alert('Failed to export data. Please try again.');
      } else {
        const Alert = require('react-native').Alert;
        Alert.alert('Export Error', error.message || 'Failed to export data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary.teal} /></View>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchData(); }} />}
      >
        {/* Property Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <Pressable
            style={[styles.filterChip, !selectedProperty && styles.filterChipActive]}
            onPress={() => setSelectedProperty(null)}
          >
            <Text style={[styles.filterChipText, !selectedProperty && styles.filterChipTextActive]}>All</Text>
          </Pressable>
          {properties.map((prop) => (
            <Pressable
              key={prop.id}
              style={[styles.filterChip, selectedProperty === prop.id && styles.filterChipActive]}
              onPress={() => setSelectedProperty(prop.id)}
            >
              <Text style={[styles.filterChipText, selectedProperty === prop.id && styles.filterChipTextActive]}>{prop.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>{MONTHS[selectedMonth]} {selectedYear}</Text>
            <Pressable onPress={nextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => setShowExportModal(true)} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>Export</Text>
          </Pressable>
        </View>

        {/* Feature Limit Indicator */}
        <View style={styles.limitIndicatorContainer}>
          <FeatureLimitIndicator feature="reports" />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.incomeValue}>PHP {totalIncome.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.expenseValue}>PHP {totalExpense.toLocaleString()}</Text>
          </View>
        </View>

        {/* Net Cashflow */}
        <View style={styles.netContainer}>
          <Text style={styles.netLabel}>Net Cashflow</Text>
          <Text style={[styles.netValue, netCashflow >= 0 ? styles.netPositive : styles.netNegative]}>
            {netCashflow >= 0 ? '+' : ''}PHP {netCashflow.toLocaleString()}
          </Text>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No transactions this month</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <Pressable
                key={entry.id}
                style={styles.transactionCard}
                onPress={() => router.push(`/cashflow/${entry.id}`)}
              >
                <View style={[styles.typeIndicator, entry.type === 'income' ? styles.incomeIndicator : styles.expenseIndicator]} />
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionDescription}>{entry.description}</Text>
                  <Text style={styles.transactionMeta}>
                    {entry.category} • {entry.property?.name || 'Unknown'} • {formatDate(entry.transaction_date)}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, entry.type === 'income' ? styles.incomeText : styles.expenseText]}>
                  {entry.type === 'income' ? '+' : '-'}PHP {entry.amount?.toLocaleString()}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB for adding transactions */}
      <View style={styles.fabContainer}>
        <Pressable style={[styles.fab, styles.expenseFab]} onPress={() => router.push('/cashflow/add?type=expense')}>
          <Text style={styles.fabText}>-</Text>
        </Pressable>
        <Pressable style={[styles.fab, styles.incomeFab]} onPress={() => router.push('/cashflow/add?type=income')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Cashflow Data</Text>
            <Text style={styles.modalSubtitle}>Select months to export (CSV format)</Text>

            <Pressable style={styles.selectAllButton} onPress={selectAllMonths}>
              <View style={[styles.checkbox, selectedMonths.length === monthOptions.length && styles.checkboxChecked]}>
                {selectedMonths.length === monthOptions.length && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.selectAllText}>
                {selectedMonths.length === monthOptions.length ? 'Deselect All' : 'Select All'}
              </Text>
            </Pressable>

            <ScrollView style={styles.monthList}>
              {monthOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.monthItem}
                  onPress={() => toggleMonthSelection(option.value)}
                >
                  <View style={[styles.checkbox, selectedMonths.includes(option.value) && styles.checkboxChecked]}>
                    {selectedMonths.includes(option.value) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.monthItemText}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Transaction Type Filter */}
            <View style={styles.typeFilterSection}>
              <Text style={styles.typeFilterLabel}>Transaction Type</Text>
              <View style={styles.typeFilterOptions}>
                <Pressable
                  style={[styles.typeFilterButton, exportType === 'both' && styles.typeFilterButtonActive]}
                  onPress={() => setExportType('both')}
                >
                  <Text style={[styles.typeFilterText, exportType === 'both' && styles.typeFilterTextActive]}>Both</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeFilterButton, exportType === 'income' && styles.typeFilterButtonActiveIncome]}
                  onPress={() => setExportType('income')}
                >
                  <Text style={[styles.typeFilterText, exportType === 'income' && styles.typeFilterTextActive]}>Income</Text>
                </Pressable>
                <Pressable
                  style={[styles.typeFilterButton, exportType === 'expense' && styles.typeFilterButtonActiveExpense]}
                  onPress={() => setExportType('expense')}
                >
                  <Text style={[styles.typeFilterText, exportType === 'expense' && styles.typeFilterTextActive]}>Expense</Text>
                </Pressable>
              </View>
            </View>

            {selectedProperty && (
              <Text style={styles.filterNote}>
                Exporting for: {properties.find((p) => p.id === selectedProperty)?.name || 'Selected property'}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setShowExportModal(false); setSelectedMonths([]); setExportType('both'); }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.exportModalButton, isExporting && styles.buttonDisabled]}
                onPress={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={Colors.neutral.white} />
                ) : (
                  <Text style={styles.exportModalButtonText}>
                    Export {selectedMonths.length > 0 ? `(${selectedMonths.length})` : ''}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="reports"
      />
    </View>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.neutral.gray50 },
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.neutral.white },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.neutral.gray100, marginRight: Spacing.sm },
  filterChipActive: { backgroundColor: Colors.primary.teal },
  filterChipText: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray600 },
  filterChipTextActive: { color: Colors.neutral.white, fontWeight: '600' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: Colors.neutral.white },
  limitIndicatorContainer: { backgroundColor: Colors.neutral.white, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, alignItems: 'center' },
  monthNav: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  navButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navButtonText: { fontSize: 28, color: Colors.primary.teal },
  monthTitle: { fontSize: Typography.fontSize.xl, fontWeight: '600', color: Colors.neutral.gray900 },
  summaryContainer: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.md },
  summaryCard: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.sm },
  incomeCard: { backgroundColor: Colors.semantic.success + '10' },
  expenseCard: { backgroundColor: Colors.semantic.error + '10' },
  summaryLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginBottom: Spacing.xs },
  incomeValue: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', color: Colors.semantic.success },
  expenseValue: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', color: Colors.semantic.error },
  netContainer: { backgroundColor: Colors.neutral.white, padding: Spacing.lg, marginHorizontal: Spacing.md, borderRadius: BorderRadius.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Shadows.sm },
  netLabel: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900 },
  netValue: { fontSize: Typography.fontSize.xl, fontWeight: 'bold' },
  netPositive: { color: Colors.semantic.success },
  netNegative: { color: Colors.semantic.error },
  transactionsSection: { padding: Spacing.lg },
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '600', color: Colors.neutral.gray900, marginBottom: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray500 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadows.sm },
  typeIndicator: { width: 4, alignSelf: 'stretch' },
  incomeIndicator: { backgroundColor: Colors.semantic.success },
  expenseIndicator: { backgroundColor: Colors.semantic.error },
  transactionContent: { flex: 1, padding: Spacing.md },
  transactionDescription: { fontSize: Typography.fontSize.md, fontWeight: '500', color: Colors.neutral.gray900 },
  transactionMeta: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginTop: 2 },
  transactionAmount: { paddingHorizontal: Spacing.md, fontSize: Typography.fontSize.md, fontWeight: '600' },
  incomeText: { color: Colors.semantic.success },
  expenseText: { color: Colors.semantic.error },
  fabContainer: { position: 'absolute', bottom: Spacing.xl, right: Spacing.lg, flexDirection: 'row', gap: Spacing.md },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', ...Shadows.lg },
  incomeFab: { backgroundColor: Colors.semantic.success },
  expenseFab: { backgroundColor: Colors.semantic.error },
  fabText: { fontSize: 28, color: Colors.neutral.white, lineHeight: 30 },
  exportButton: { backgroundColor: Colors.primary.teal, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  exportButtonText: { color: Colors.neutral.white, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalContent: { backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', maxWidth: 400, maxHeight: '80%' },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: 'bold', color: Colors.neutral.gray900, marginBottom: Spacing.xs },
  modalSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, marginBottom: Spacing.lg },
  selectAllButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.neutral.gray200, marginBottom: Spacing.sm },
  selectAllText: { fontSize: Typography.fontSize.md, color: Colors.primary.teal, fontWeight: '600' },
  monthList: { maxHeight: 300 },
  monthItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  monthItemText: { fontSize: Typography.fontSize.md, color: Colors.neutral.gray900 },
  checkbox: { width: 24, height: 24, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: Colors.neutral.gray300, marginRight: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: Colors.primary.teal, borderColor: Colors.primary.teal },
  checkmark: { color: Colors.neutral.white, fontSize: 14, fontWeight: 'bold' },
  filterNote: { fontSize: Typography.fontSize.sm, color: Colors.neutral.gray500, fontStyle: 'italic', marginTop: Spacing.sm },
  typeFilterSection: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral.gray200 },
  typeFilterLabel: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral.gray700, marginBottom: Spacing.sm },
  typeFilterOptions: { flexDirection: 'row', gap: Spacing.sm },
  typeFilterButton: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.neutral.gray100, alignItems: 'center' },
  typeFilterButtonActive: { backgroundColor: Colors.primary.teal },
  typeFilterButtonActiveIncome: { backgroundColor: Colors.semantic.success },
  typeFilterButtonActiveExpense: { backgroundColor: Colors.semantic.error },
  typeFilterText: { fontSize: Typography.fontSize.sm, fontWeight: '500', color: Colors.neutral.gray600 },
  typeFilterTextActive: { color: Colors.neutral.white },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  modalButton: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  cancelButton: { backgroundColor: Colors.neutral.gray100 },
  cancelButtonText: { color: Colors.neutral.gray600, fontWeight: '600' },
  exportModalButton: { backgroundColor: Colors.primary.teal },
  exportModalButtonText: { color: Colors.neutral.white, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
