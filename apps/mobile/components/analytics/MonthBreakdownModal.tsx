import { View, Text, StyleSheet, ScrollView, Modal, Pressable, Platform } from 'react-native';
import type { CashflowEntry } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface MonthBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  monthLabel: string;
  entries: CashflowEntry[];
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    rental: '🏠', booking: '📅', deposit: '💰', refund: '↩️',
    utilities: '💡', maintenance: '🔧', cleaning: '🧹', supplies: '📦',
    taxes: '📋', insurance: '🛡️', marketing: '📢', commission: '💳', other: '📝',
  };
  return icons[category.toLowerCase()] || '📝';
};

interface CategoryGroup {
  category: string;
  entries: CashflowEntry[];
  total: number;
}

export function MonthBreakdownModal({ visible, onClose, monthLabel, entries }: MonthBreakdownModalProps) {
  const totalIncome = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpense = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0);
  const net = totalIncome - totalExpense;

  const groupByCategory = (type: 'income' | 'expense'): CategoryGroup[] => {
    const groups: Record<string, CashflowEntry[]> = {};
    entries.filter((e) => e.type === type).forEach((e) => {
      const cat = e.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(e);
    });
    return Object.entries(groups)
      .map(([category, categoryEntries]) => ({
        category,
        entries: categoryEntries,
        total: categoryEntries.reduce((sum, e) => sum + (e.amount || 0), 0),
      }))
      .sort((a, b) => b.total - a.total);
  };

  const incomeGroups = groupByCategory('income');
  const expenseGroups = groupByCategory('expense');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{monthLabel}</Text>
            <Pressable onPress={onClose} style={[styles.closeButton, Platform.OS === 'web' && ({ cursor: 'pointer' } as any)]}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.incomeValue}>₱{totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.expenseValue}>₱{totalExpense.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net</Text>
              <Text style={[styles.netValue, net >= 0 ? styles.netPositive : styles.netNegative]}>
                {net >= 0 ? '+' : ''}₱{net.toLocaleString()}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {incomeGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Income by Category</Text>
                {incomeGroups.map((group) => (
                  <View key={group.category} style={styles.categoryRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(group.category)}</Text>
                    <Text style={styles.categoryName}>{group.category}</Text>
                    <Text style={[styles.categoryAmount, styles.incomeText]}>
                      ₱{group.total.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {expenseGroups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expenses by Category</Text>
                {expenseGroups.map((group) => (
                  <View key={group.category} style={styles.categoryRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(group.category)}</Text>
                    <Text style={styles.categoryName}>{group.category}</Text>
                    <Text style={[styles.categoryAmount, styles.expenseText]}>
                      ₱{group.total.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {entries.length === 0 && (
              <Text style={styles.emptyText}>No transactions this month</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.gray900,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
    marginBottom: 2,
  },
  incomeValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.semantic.success,
  },
  expenseValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.semantic.error,
  },
  netValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  netPositive: { color: Colors.semantic.success },
  netNegative: { color: Colors.semantic.error },
  scrollArea: {
    flexGrow: 0,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray700,
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  incomeText: { color: Colors.semantic.success },
  expenseText: { color: Colors.semantic.error },
  emptyText: {
    textAlign: 'center',
    color: Colors.neutral.gray400,
    fontSize: Typography.fontSize.md,
    paddingVertical: Spacing.xl,
  },
});
