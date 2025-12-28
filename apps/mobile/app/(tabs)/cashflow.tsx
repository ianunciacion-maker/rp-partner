import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import type { Property, CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface CashflowWithProperty extends CashflowEntry {
  property?: Property;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CashflowScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<CashflowWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => { fetchData(); }, [selectedProperty, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedProperty, selectedMonth, selectedYear])
  );

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);
  const netCashflow = totalIncome - totalExpense;

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
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
          <Pressable onPress={prevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTHS[selectedMonth]} {selectedYear}</Text>
          <Pressable onPress={nextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
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
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.neutral.white },
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
});
