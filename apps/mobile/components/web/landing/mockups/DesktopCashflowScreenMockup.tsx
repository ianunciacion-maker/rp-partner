import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

const transactions = [
  { type: 'income', icon: '\u2302', label: 'Casa Verde Rental', amount: '+\u20B135,000', date: 'Jan 11', property: 'Casa Verde' },
  { type: 'expense', icon: '\u2728', label: 'Cleaning', amount: '-\u20B12,000', date: 'Jan 11', property: 'Casa Verde' },
  { type: 'income', icon: '\u2302', label: 'Sunrise Rental', amount: '+\u20B128,000', date: 'Jan 10', property: 'Sunrise Condo' },
  { type: 'income', icon: '\u2302', label: 'Beach House', amount: '+\u20B142,000', date: 'Jan 9', property: 'Beach House' },
  { type: 'expense', icon: '\u2699', label: 'Maintenance', amount: '-\u20B15,500', date: 'Jan 8', property: 'Beach House' },
  { type: 'expense', icon: '\u26A1', label: 'Electricity', amount: '-\u20B13,200', date: 'Jan 5', property: 'Casa Verde' },
];

export function DesktopCashflowScreenMockup() {
  return (
    <View style={styles.container}>
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
          <Text style={styles.netLabel}>Net Profit</Text>
          <Text style={styles.netAmount}>{'\u20B1'}80,000</Text>
        </View>
      </View>

      {/* Transactions Table */}
      <View style={styles.tableContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Description</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Property</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
        </View>
        {/* Table Rows */}
        {transactions.map((tx, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.txLabelCell, { flex: 2 }]}>
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
              <Text style={styles.txLabel}>{tx.label}</Text>
            </View>
            <Text style={[styles.txProperty, { flex: 1 }]}>{tx.property}</Text>
            <Text style={[styles.txDate, { flex: 1 }]}>{tx.date}</Text>
            <Text
              style={[
                styles.txAmount,
                { flex: 1, textAlign: 'right' },
                tx.type === 'income' ? styles.txAmountIncome : styles.txAmountExpense,
              ]}
            >
              {tx.amount}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.gray50,
    padding: 16,
    minHeight: 360,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 12,
  },
  chevron: {
    fontSize: 16,
    color: Colors.neutral.gray400,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
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
    fontSize: 11,
    color: '#10b981',
  },
  incomeLabel: {
    fontSize: 9,
    color: '#059669',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
    marginTop: 4,
  },
  expenseIcon: {
    fontSize: 11,
    color: '#ef4444',
  },
  expenseLabel: {
    fontSize: 9,
    color: '#dc2626',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b91c1c',
    marginTop: 4,
  },
  netLabel: {
    fontSize: 9,
    color: Colors.neutral.gray500,
  },
  netAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.gray900,
    marginTop: 4,
  },
  tableContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral.gray700,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray200,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.neutral.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  txLabelCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    fontSize: 10,
  },
  txIconTextIncome: {
    color: '#059669',
  },
  txIconTextExpense: {
    color: '#dc2626',
  },
  txLabel: {
    fontSize: 10,
    color: Colors.neutral.gray700,
  },
  txProperty: {
    fontSize: 9,
    color: Colors.neutral.gray500,
  },
  txDate: {
    fontSize: 9,
    color: Colors.neutral.gray400,
  },
  txAmount: {
    fontSize: 10,
    fontWeight: '600',
  },
  txAmountIncome: {
    color: '#059669',
  },
  txAmountExpense: {
    color: '#dc2626',
  },
});
