import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import type { SubscriptionPlan } from '@/types/database';

export default function UpgradeScreen() {
  const router = useRouter();
  const { plans, plan: currentPlan, fetchPlans, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    // Pre-select premium plan
    const premiumPlan = plans.find((p) => p.name === 'premium');
    if (premiumPlan) {
      setSelectedPlan(premiumPlan);
    }
  }, [plans]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  const premiumPlan = plans.find((p) => p.name === 'premium');
  const totalAmount = (premiumPlan?.price_monthly || 499) * selectedMonths;

  const monthOptions = [
    { months: 1, label: '1 Month', discount: 0 },
    { months: 3, label: '3 Months', discount: 0 },
    { months: 6, label: '6 Months', discount: 5 },
    { months: 12, label: '12 Months', discount: 10 },
  ];

  const handleContinue = () => {
    if (!premiumPlan) return;
    router.push({
      pathname: '/subscription/pay',
      params: {
        planId: premiumPlan.id,
        months: selectedMonths,
        amount: totalAmount,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Upgrade to Premium</Text>
      </View>

      {/* Plan Comparison */}
      <View style={styles.comparisonSection}>
        <View style={styles.comparisonHeader}>
          <View style={styles.comparisonCol}>
            <Text style={styles.comparisonColTitle}>Feature</Text>
          </View>
          <View style={styles.comparisonCol}>
            <Text style={styles.comparisonColTitle}>Free</Text>
          </View>
          <View style={[styles.comparisonCol, styles.premiumCol]}>
            <Text style={[styles.comparisonColTitle, styles.premiumColTitle]}>Premium</Text>
          </View>
        </View>

        {[
          { feature: 'Calendar History', free: '2 months', premium: 'Unlimited' },
          { feature: 'Report Exports', free: '2 months', premium: 'Unlimited' },
          { feature: 'Properties', free: '1', premium: 'Up to 10' },
          { feature: 'Priority Support', free: '—', premium: '✓' },
        ].map((row, index) => (
          <View key={index} style={styles.comparisonRow}>
            <View style={styles.comparisonCol}>
              <Text style={styles.featureText}>{row.feature}</Text>
            </View>
            <View style={styles.comparisonCol}>
              <Text style={styles.freeValue}>{row.free}</Text>
            </View>
            <View style={[styles.comparisonCol, styles.premiumCol]}>
              <Text style={styles.premiumValue}>{row.premium}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Duration Selection */}
      <View style={styles.durationSection}>
        <Text style={styles.sectionTitle}>Select Duration</Text>
        <View style={styles.durationOptions}>
          {monthOptions.map((option) => (
            <Pressable
              key={option.months}
              style={[
                styles.durationOption,
                selectedMonths === option.months && styles.durationOptionSelected,
              ]}
              onPress={() => setSelectedMonths(option.months)}
            >
              <Text
                style={[
                  styles.durationLabel,
                  selectedMonths === option.months && styles.durationLabelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>Save {option.discount}%</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Premium Plan ({selectedMonths} {selectedMonths === 1 ? 'month' : 'months'})</Text>
          <Text style={styles.priceValue}>PHP {totalAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>PHP {totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.actions}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          variant="primary"
          fullWidth
        />
        <Text style={styles.disclaimer}>
          You'll be shown payment options on the next screen
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.teal,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
  },
  comparisonSection: {
    margin: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.gray100,
    paddingVertical: Spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  comparisonCol: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCol: {
    backgroundColor: Colors.primary.teal + '10',
  },
  comparisonColTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral.gray600,
  },
  premiumColTitle: {
    color: Colors.primary.teal,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray700,
    textAlign: 'center',
  },
  freeValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: 'center',
  },
  premiumValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.primary.teal,
    textAlign: 'center',
  },
  durationSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  durationOption: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral.gray200,
    alignItems: 'center',
    ...Shadows.sm,
  },
  durationOptionSelected: {
    borderColor: Colors.primary.teal,
    backgroundColor: Colors.primary.teal + '10',
  },
  durationLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.neutral.gray700,
  },
  durationLabelSelected: {
    color: Colors.primary.teal,
    fontWeight: '600',
  },
  discountBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: Colors.semantic.success,
    borderRadius: BorderRadius.full,
  },
  discountText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.white,
    fontWeight: '600',
  },
  priceSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
  },
  priceValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.neutral.gray200,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary.teal,
  },
  actions: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  disclaimer: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    textAlign: 'center',
  },
});
