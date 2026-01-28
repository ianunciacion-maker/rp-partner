import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { MockupStatusBar } from './MockupStatusBar';
import { MockupBottomNav } from './MockupBottomNav';

const transactions = [
  { type: 'income', icon: '\u2302', label: 'Casa Verde Rental', amount: '+\u20B135,000', date: 'Jan 11' },
  { type: 'expense', icon: '\u2728', label: 'Cleaning', amount: '-\u20B12,000', date: 'Jan 11' },
  { type: 'income', icon: '\u2302', label: 'Sunrise Rental', amount: '+\u20B128,000', date: 'Jan 10' },
  { type: 'income', icon: '\u2302', label: 'Beach House', amount: '+\u20B142,000', date: 'Jan 9' },
  { type: 'expense', icon: '\u2699', label: 'Maintenance', amount: '-\u20B15,500', date: 'Jan 8' },
  { type: 'expense', icon: '\u26A1', label: 'Electricity', amount: '-\u20B13,200', date: 'Jan 5' },
  { type: 'expense', icon: '\u2708', label: 'Insurance', amount: '-\u20B18,000', date: 'Jan 4' },
];

/**
 * Cashflow screen mockup showing income/expense summary.
 */
export function CashflowScreenMockup() {
  return (
    <View style={styles.container}>
      <MockupStatusBar />

      {/* Month Header */}
      <View style={styles.monthHeader}>
        <Text style={styles.chevron}>{'\u2039'}</Text>
        <Text style={styles.monthText}>January 2026</Text>
        <Text style={styles.chevron}>{'\u203A'}</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.incomeIcon}>{'\u2191'}</Text>
            <Text style={styles.incomeLabel}>Income</Text>
          </View>
          <Text style={styles.incomeAmount}>{'\u20B1'}125,000</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.expenseIcon}>{'\u2193'}</Text>
            <Text style={styles.expenseLabel}>Expenses</Text>
          </View>
          <Text style={styles.expenseAmount}>{'\u20B1'}45,000</Text>
        </View>

        <View style={[styles.summaryCard, styles.netCard]}>
          <Text style={styles.netLabel}>Net</Text>
          <Text style={styles.netAmount}>{'\u20B1'}80,000</Text>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.transactions}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        {transactions.map((tx, i) => (
          <View key={i} style={styles.transactionRow}>
            <View style={styles.txLeft}>
              <View
                style={[
                  styles.txIcon,
                  tx.type === 'income' ? styles.txIconIncome : styles.txIconExpense,
                ]}
              >
                <Text style={[
                  styles.txIconText,
                  tx.type === 'income' ? styles.txIconTextIncome : styles.txIconTextExpense,
                ]}>
                  {tx.icon}
                </Text>
              </View>
              <View>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.txAmount,
                tx.type === 'income' ? styles.txAmountIncome : styles.txAmountExpense,
              ]}
            >
              {tx.amount}
            </Text>
          </View>
        ))}
      </View>

      <MockupBottomNav activeTab="cashflow" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  chevron: {
    fontSize: 12,
    color: Colors.neutral.gray400,
  },
  monthText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 6,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
  },
  incomeCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  expenseCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  netCard: {
    backgroundColor: Colors.neutral.white,
    borderColor: Colors.neutral.gray200,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incomeIcon: {
    fontSize: 8,
    color: '#10b981',
  },
  incomeLabel: {
    fontSize: 6,
    color: '#059669',
  },
  incomeAmount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  expenseIcon: {
    fontSize: 8,
    color: '#ef4444',
  },
  expenseLabel: {
    fontSize: 6,
    color: '#dc2626',
  },
  expenseAmount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b91c1c',
  },
  netLabel: {
    fontSize: 6,
    color: Colors.neutral.gray500,
  },
  netAmount: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.gray900,
  },
  transactions: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: '600',
    color: Colors.neutral.gray700,
    marginBottom: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconIncome: {
    backgroundColor: '#d1fae5',
  },
  txIconExpense: {
    backgroundColor: '#fee2e2',
  },
  txIconText: {
    fontSize: 8,
  },
  txIconTextIncome: {
    color: '#059669',
  },
  txIconTextExpense: {
    color: '#dc2626',
  },
  txLabel: {
    fontSize: 7,
    color: Colors.neutral.gray700,
  },
  txDate: {
    fontSize: 5,
    color: Colors.neutral.gray400,
  },
  txAmount: {
    fontSize: 7,
    fontWeight: '600',
  },
  txAmountIncome: {
    color: '#059669',
  },
  txAmountExpense: {
    color: '#dc2626',
  },
});
