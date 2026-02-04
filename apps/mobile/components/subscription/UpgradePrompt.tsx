import { View, Text, StyleSheet, ViewStyle, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

type FeatureType = 'calendar' | 'reports' | 'properties';
type ReasonType = 'limit_reached' | 'expiring_soon' | 'grace_period' | 'expired';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  onCancel?: () => void;  // Optional callback for custom cancel behavior
  feature: FeatureType;
  reason?: ReasonType;
  daysRemaining?: number;
  cancelText?: string;  // Optional custom cancel button text
  isPremiumUser?: boolean;  // Show contact us instead of upgrade for premium users at limit
}

const FEATURE_CONTENT: Record<FeatureType, { title: string; description: string; icon: string }> = {
  calendar: {
    title: 'Unlock Full Calendar History',
    description: 'Free users can only view 2 months of calendar history. Upgrade to Premium for unlimited access to your entire booking history.',
    icon: '📅',
  },
  reports: {
    title: 'Unlock Full Report History',
    description: 'Free users can only export 2 months of cashflow reports. Upgrade to Premium for unlimited report exports.',
    icon: '📊',
  },
  properties: {
    title: 'Add More Properties',
    description: 'Free users can manage 1 property. Upgrade to Premium to manage up to 3 properties.',
    icon: '🏠',
  },
};

const REASON_CONTENT: Record<ReasonType, { titlePrefix: string; cta: string; urgency: 'info' | 'warning' | 'urgent' | 'critical' }> = {
  limit_reached: {
    titlePrefix: 'Unlock More',
    cta: 'Upgrade Now',
    urgency: 'info',
  },
  expiring_soon: {
    titlePrefix: 'Renew to Keep',
    cta: 'Renew Now',
    urgency: 'warning',
  },
  grace_period: {
    titlePrefix: 'Grace Period Active -',
    cta: 'Renew & Restore',
    urgency: 'urgent',
  },
  expired: {
    titlePrefix: 'Subscription Expired -',
    cta: 'Upgrade Now',
    urgency: 'critical',
  },
};

const URGENCY_COLORS: Record<string, string> = {
  info: Colors.primary.teal,
  warning: '#F59E0B', // Yellow/amber
  urgent: '#F97316', // Orange
  critical: Colors.semantic.error,
};

// Content for premium users who have reached their limit
const PREMIUM_LIMIT_CONTENT = {
  title: 'Need More Properties?',
  description: "You've reached the maximum of 3 properties on Premium. Contact us to discuss expanded capacity for your business.",
  icon: '📞',
  cta: 'Contact Us',
};

export function UpgradePrompt({ visible, onClose, onCancel, feature, reason = 'limit_reached', daysRemaining, cancelText, isPremiumUser }: UpgradePromptProps) {
  const router = useRouter();
  const { plans, getDaysUntilExpiry } = useSubscriptionStore();
  const premiumPlan = plans.find((p) => p.name === 'premium');
  const featureContent = FEATURE_CONTENT[feature];
  const reasonContent = REASON_CONTENT[reason];

  // Use provided daysRemaining or get from store
  const days = daysRemaining ?? getDaysUntilExpiry() ?? 0;

  // Check if this is a premium user at their property limit
  const showContactUs = isPremiumUser && feature === 'properties' && reason === 'limit_reached';

  const handleContactUs = () => {
    Linking.openURL('mailto:ian@autonoiq.com?subject=Request%20for%20More%20Properties');
    onClose();
  };

  // Build dynamic title based on reason
  const getTitle = () => {
    if (showContactUs) {
      return PREMIUM_LIMIT_CONTENT.title;
    }
    if (reason === 'limit_reached') {
      return featureContent.title;
    }
    if (reason === 'expiring_soon') {
      return `Renew in ${days} Day${days !== 1 ? 's' : ''}`;
    }
    if (reason === 'grace_period') {
      return 'Grace Period Active';
    }
    return 'Subscription Expired';
  };

  // Build dynamic description based on reason
  const getDescription = () => {
    if (showContactUs) {
      return PREMIUM_LIMIT_CONTENT.description;
    }
    if (reason === 'limit_reached') {
      return featureContent.description;
    }
    if (reason === 'expiring_soon') {
      return `Your Premium subscription expires in ${days} day${days !== 1 ? 's' : ''}. Renew now to keep unlimited access to all features.`;
    }
    if (reason === 'grace_period') {
      return 'Your subscription has expired but you still have time to renew. Act now to keep your Premium features.';
    }
    return 'Your Premium subscription has ended. Upgrade again to restore full access to all features.';
  };

  // Get the appropriate icon
  const getIcon = () => {
    if (showContactUs) {
      return PREMIUM_LIMIT_CONTENT.icon;
    }
    return featureContent.icon;
  };

  const urgencyColor = URGENCY_COLORS[reasonContent.urgency];
  const borderStyle: ViewStyle = {
    borderWidth: 2,
    borderColor: urgencyColor,
    borderRadius: BorderRadius.lg,
  };

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription/upgrade');
  };

  return (
    <Modal visible={visible} onClose={onClose} showCloseButton={false}>
      <View style={[styles.container, reason !== 'limit_reached' && borderStyle]}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.title, { color: urgencyColor }]}>{getTitle()}</Text>
        <Text style={styles.description}>{getDescription()}</Text>

        {/* Only show pricing and features for non-premium users */}
        {!showContactUs && (
          <>
            {premiumPlan && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Premium Plan</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currency}>PHP</Text>
                  <Text style={styles.price}>{premiumPlan.price_monthly}</Text>
                  <Text style={styles.period}>/month</Text>
                </View>
              </View>
            )}

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Unlimited calendar history</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Unlimited report exports</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureText}>Up to 3 properties</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.buttons}>
          <Button
            title={showContactUs ? PREMIUM_LIMIT_CONTENT.cta : reasonContent.cta}
            onPress={showContactUs ? handleContactUs : handleUpgrade}
            variant="primary"
            fullWidth
          />
          <Button
            title={cancelText ?? (reason === 'expired' ? 'Continue with Free' : 'Maybe Later')}
            onPress={onCancel ?? onClose}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  priceContainer: {
    backgroundColor: Colors.primary.teal + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  priceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.teal,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
    fontWeight: '500',
  },
  price: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
    marginHorizontal: Spacing.xs,
  },
  period: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkmark: {
    fontSize: Typography.fontSize.lg,
    color: Colors.semantic.success,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray700,
  },
  buttons: {
    width: '100%',
    gap: Spacing.sm,
  },
});
