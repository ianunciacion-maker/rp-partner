import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Colors, Spacing, Typography } from '@/constants/theme';

type FeatureType = 'calendar' | 'reports' | 'properties';

interface FeatureLimitIndicatorProps {
  feature: FeatureType;
  currentUsage?: number; // For properties count
  compact?: boolean; // Inline vs expanded style
}

export function FeatureLimitIndicator({ feature, currentUsage, compact = true }: FeatureLimitIndicatorProps) {
  const router = useRouter();
  const { plan, isPremium, userOverrides } = useSubscriptionStore();
  const premium = isPremium();

  const handleUpgrade = () => {
    router.push('/subscription/upgrade');
  };

  // Get limit text based on feature and subscription status
  const getLimitText = (): { text: string; showUpgrade: boolean } => {
    switch (feature) {
      case 'calendar': {
        // Check user override first
        if (userOverrides?.calendar_months_override !== null && userOverrides?.calendar_months_override !== undefined) {
          if (userOverrides.calendar_months_override === -1) {
            return { text: 'Unlimited', showUpgrade: false };
          }
          return { text: `±${userOverrides.calendar_months_override} months`, showUpgrade: false };
        }
        if (premium) {
          return { text: 'Unlimited', showUpgrade: false };
        }
        const limit = plan?.calendar_months_limit ?? 2;
        return { text: `±${limit} months`, showUpgrade: true };
      }
      case 'reports': {
        // Check user override first
        if (userOverrides?.report_months_override !== null && userOverrides?.report_months_override !== undefined) {
          if (userOverrides.report_months_override === -1) {
            return { text: 'Unlimited', showUpgrade: false };
          }
          return { text: `${userOverrides.report_months_override} months`, showUpgrade: false };
        }
        if (premium) {
          return { text: 'Unlimited', showUpgrade: false };
        }
        const limit = plan?.report_months_limit ?? 2;
        return { text: `${limit} months`, showUpgrade: true };
      }
      case 'properties': {
        // User's property_limit (set by admin) takes precedence over plan limit
        const limit = userOverrides?.property_limit ?? plan?.property_limit ?? 1;
        const usage = currentUsage ?? 0;
        const atLimit = usage >= limit;
        return {
          text: `${usage}/${limit}`,
          showUpgrade: !premium && atLimit,
        };
      }
    }
  };

  // Get feature label
  const getLabel = (): string => {
    switch (feature) {
      case 'calendar':
        return 'Calendar:';
      case 'reports':
        return 'Export:';
      case 'properties':
        return 'Properties:';
    }
  };

  const { text, showUpgrade } = getLimitText();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactLabel}>{getLabel()}</Text>
        <Text style={[styles.compactValue, premium && styles.premiumText]}>{text}</Text>
        {showUpgrade && (
          <>
            <Text style={styles.separator}>·</Text>
            <Pressable onPress={handleUpgrade} hitSlop={8}>
              <Text style={styles.upgradeLink}>Upgrade</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <View style={styles.expandedRow}>
        <Text style={styles.expandedLabel}>{getLabel()}</Text>
        <Text style={[styles.expandedValue, premium && styles.premiumText]}>{text}</Text>
      </View>
      {showUpgrade && (
        <Pressable onPress={handleUpgrade} style={styles.expandedUpgradeButton}>
          <Text style={styles.expandedUpgradeText}>Upgrade for more</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
    marginRight: Spacing.xs,
  },
  compactValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray600,
    fontWeight: '500',
  },
  premiumText: {
    color: Colors.primary.teal,
  },
  separator: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
    marginHorizontal: Spacing.xs,
  },
  upgradeLink: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary.teal,
    fontWeight: '600',
  },
  expandedContainer: {
    padding: Spacing.sm,
    backgroundColor: Colors.neutral.gray50,
    borderRadius: 8,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
  },
  expandedValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray900,
    fontWeight: '600',
  },
  expandedUpgradeButton: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  expandedUpgradeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.teal,
    fontWeight: '600',
  },
});
