import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useResponsive } from '@/hooks/useResponsive';
import type { Property, CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

interface CashflowWithProperty extends CashflowEntry {
  property?: Property;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    rental: '🏠',
    booking: '📅',
    deposit: '💰',
    refund: '↩️',
    utilities: '💡',
    maintenance: '🔧',
    cleaning: '🧹',
    supplies: '📦',
    taxes: '📋',
    insurance: '🛡️',
    marketing: '📢',
    commission: '💳',
    other: '📝',
  };
  return icons[category.toLowerCase()] || '📝';
};

export default function CashflowDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId?: string }>();
  const { user } = useAuthStore();
  const { isPremium, fetchSubscription, fetchPlans } = useSubscriptionStore();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [entries, setEntries] = useState<CashflowWithProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(params.propertyId || null);

  const monthsToFetch = isPremium() ? 6 : 2;
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, monthsToFetch - 1));
  const endDate = endOfMonth(now);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchPlans();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [propsResult, entriesResult] = await Promise.all([
        supabase.from('properties').select('*'),
        (() => {
          let query = supabase
            .from('cashflow_entries')
            .select('*, property:properties(*)')
            .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
            .lte('transaction_date', format(endDate, 'yyyy-MM-dd'))
            .order('transaction_date', { ascending: true });

          if (selectedProperty) {
            query = query.eq('property_id', selectedProperty);
          }

          return query;
        })(),
      ]);

      setProperties(propsResult.data || []);
      setEntries(entriesResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedProperty, monthsToFetch])
  );

  const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpenses = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);
  const netCashflow = totalIncome - totalExpenses;

  const monthlyData: MonthlyData[] = [];
  for (let i = monthsToFetch - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    const monthEntries = entries.filter((e) => e.transaction_date.startsWith(monthKey));
    const income = monthEntries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
    const expense = monthEntries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);

    monthlyData.push({
      month: monthKey,
      monthLabel: format(monthDate, 'MMM'),
      income,
      expense,
      net: income - expense,
    });
  }

  const maxMonthlyValue = Math.max(...monthlyData.flatMap((d) => [d.income, d.expense]), 1);

  const getCategoryBreakdown = (type: 'income' | 'expense'): CategoryData[] => {
    const categoryTotals: Record<string, number> = {};
    const typeEntries = entries.filter((e) => e.type === type);
    const total = typeEntries.reduce((sum, e) => sum + (e.amount || 0), 0);

    typeEntries.forEach((e) => {
      const cat = e.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const incomeCategories = getCategoryBreakdown('income');
  const expenseCategories = getCategoryBreakdown('expense');

  const bestMonth = monthlyData.reduce((best, current) =>
    current.net > best.net ? current : best
  , monthlyData[0]);

  const highestExpenseMonth = monthlyData.reduce((worst, current) =>
    current.expense > worst.expense ? current : worst
  , monthlyData[0]);

  const netTrend = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 1].net - monthlyData[0].net
    : 0;

  const dateRangeLabel = `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Cashflow Dashboard</Text>
          <Text style={styles.dateRange}>{dateRangeLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        {properties.length > 1 && (
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
                <Text style={[styles.filterChipText, selectedProperty === prop.id && styles.filterChipTextActive]}>
                  {prop.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={[styles.summaryRow, isDesktop && styles.summaryRowDesktop]}>
          <View style={[styles.summaryCard, styles.incomeCard, isDesktop && styles.summaryCardDesktop]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.incomeArrow}>↑</Text>
              <Text style={styles.summaryLabel}>Total Income</Text>
            </View>
            <Text style={styles.incomeValue}>₱{totalIncome.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard, isDesktop && styles.summaryCardDesktop]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.expenseArrow}>↓</Text>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
            </View>
            <Text style={styles.expenseValue}>₱{totalExpenses.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.netCardSummary, isDesktop && styles.summaryCardDesktop]}>
            <Text style={styles.summaryLabel}>Net Cashflow</Text>
            <Text style={[styles.netValueLarge, netCashflow >= 0 ? styles.netPositive : styles.netNegative]}>
              {netCashflow >= 0 ? '+' : ''}₱{netCashflow.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Trend</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.semantic.success }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.semantic.error }]} />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
            </View>

            {monthlyData.map((month) => (
              <View key={month.month} style={styles.chartRow}>
                <Text style={styles.chartLabel}>{month.monthLabel}</Text>
                <View style={styles.barContainer}>
                  <View style={styles.barPair}>
                    <View
                      style={[
                        styles.bar,
                        styles.incomeBar,
                        { width: `${(month.income / maxMonthlyValue) * 100}%` },
                      ]}
                    />
                    <Text style={styles.barValue}>₱{month.income.toLocaleString()}</Text>
                  </View>
                  <View style={styles.barPair}>
                    <View
                      style={[
                        styles.bar,
                        styles.expenseBar,
                        { width: `${(month.expense / maxMonthlyValue) * 100}%` },
                      ]}
                    />
                    <Text style={styles.barValue}>₱{month.expense.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.categorySection, isDesktop && styles.categorySectionDesktop]}>
          <View style={[styles.categoryCard, isDesktop && styles.categoryCardDesktop]}>
            <Text style={styles.categoryTitle}>Top Income Sources</Text>
            {incomeCategories.length === 0 ? (
              <Text style={styles.noDataText}>No income data</Text>
            ) : (
              incomeCategories.map((cat) => (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(cat.category)}</Text>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          styles.incomeProgressBar,
                          { width: `${cat.percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryAmount}>₱{cat.amount.toLocaleString()}</Text>
                    <Text style={styles.categoryPercent}>{cat.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={[styles.categoryCard, isDesktop && styles.categoryCardDesktop]}>
            <Text style={styles.categoryTitle}>Top Expense Categories</Text>
            {expenseCategories.length === 0 ? (
              <Text style={styles.noDataText}>No expense data</Text>
            ) : (
              expenseCategories.map((cat) => (
                <View key={cat.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(cat.category)}</Text>
                    <Text style={styles.categoryName}>{cat.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          styles.expenseProgressBar,
                          { width: `${cat.percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryAmount}>₱{cat.amount.toLocaleString()}</Text>
                    <Text style={styles.categoryPercent}>{cat.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightsCard}>
            {entries.length === 0 ? (
              <Text style={styles.noDataText}>No data available for insights</Text>
            ) : (
              <>
                <View style={styles.insightRow}>
                  <View style={[styles.insightIcon, styles.successIconBg]}>
                    <Text style={styles.insightIconText}>🏆</Text>
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Best Month</Text>
                    <Text style={styles.insightValue}>
                      {bestMonth.monthLabel} ({netCashflow >= 0 ? '+' : ''}₱{bestMonth.net.toLocaleString()} net)
                    </Text>
                  </View>
                </View>

                <View style={styles.insightRow}>
                  <View style={[styles.insightIcon, styles.errorIconBg]}>
                    <Text style={styles.insightIconText}>📊</Text>
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Highest Expenses</Text>
                    <Text style={styles.insightValue}>
                      {highestExpenseMonth.monthLabel} (₱{highestExpenseMonth.expense.toLocaleString()})
                    </Text>
                  </View>
                </View>

                <View style={styles.insightRow}>
                  <View style={[styles.insightIcon, netTrend >= 0 ? styles.successIconBg : styles.errorIconBg]}>
                    <Text style={styles.insightIconText}>{netTrend >= 0 ? '📈' : '📉'}</Text>
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightLabel}>Net Trend</Text>
                    <Text style={[styles.insightValue, netTrend >= 0 ? styles.trendPositive : styles.trendNegative]}>
                      {netTrend >= 0 ? 'Improving' : 'Declining'} ({netTrend >= 0 ? '+' : ''}₱{netTrend.toLocaleString()})
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: Colors.primary.teal,
    fontWeight: Typography.fontWeight.medium,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.gray900,
  },
  dateRange: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: 2,
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral.white,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.teal,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryRow: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  summaryRowDesktop: {
    flexDirection: 'row',
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral.white,
    ...Shadows.sm,
  },
  summaryCardDesktop: {
    flex: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  incomeCard: {},
  expenseCard: {},
  netCardSummary: {},
  incomeArrow: {
    fontSize: Typography.fontSize.lg,
    color: Colors.semantic.success,
    marginRight: Spacing.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  expenseArrow: {
    fontSize: Typography.fontSize.lg,
    color: Colors.semantic.error,
    marginRight: Spacing.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  incomeValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.semantic.success,
  },
  expenseValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.semantic.error,
  },
  netValueLarge: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    marginTop: Spacing.xs,
  },
  netPositive: {
    color: Colors.semantic.success,
  },
  netNegative: {
    color: Colors.semantic.error,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  chartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartLabel: {
    width: 40,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray700,
  },
  barContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bar: {
    height: 16,
    borderRadius: BorderRadius.sm,
    minWidth: 4,
  },
  incomeBar: {
    backgroundColor: Colors.semantic.success,
  },
  expenseBar: {
    backgroundColor: Colors.semantic.error,
  },
  barValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
  },
  categorySection: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categorySectionDesktop: {
    flexDirection: 'row',
  },
  categoryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  categoryCardDesktop: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray700,
    textTransform: 'capitalize',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarContainer: {
    width: 60,
    height: 8,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  incomeProgressBar: {
    backgroundColor: Colors.semantic.success,
  },
  expenseProgressBar: {
    backgroundColor: Colors.semantic.error,
  },
  categoryAmount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray900,
    minWidth: 80,
    textAlign: 'right',
  },
  categoryPercent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
    minWidth: 35,
    textAlign: 'right',
  },
  noDataText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  insightsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  successIconBg: {
    backgroundColor: Colors.semantic.success + '15',
  },
  errorIconBg: {
    backgroundColor: Colors.semantic.error + '15',
  },
  insightIconText: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  insightValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral.gray900,
  },
  trendPositive: {
    color: Colors.semantic.success,
  },
  trendNegative: {
    color: Colors.semantic.error,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
