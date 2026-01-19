import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useSubscriptionStore, SubscriptionStateType } from '@/stores/subscriptionStore';

interface BannerConfig {
  icon: string;
  getMessage: (days: number | null) => string;
  backgroundColor: string;
  textColor: string;
  dismissible: boolean;
}

const BANNER_CONFIG: Record<Exclude<SubscriptionStateType, 'none' | 'active'>, BannerConfig> = {
  expiring_soon: {
    icon: '⏰',
    getMessage: (days) => `Subscription expires in ${days} day${days !== 1 ? 's' : ''}`,
    backgroundColor: '#DBEAFE', // Light blue
    textColor: '#1E40AF', // Dark blue
    dismissible: true,
  },
  grace_period: {
    icon: '⚠️',
    getMessage: () => 'Grace period - renew to keep Premium',
    backgroundColor: '#FEF3C7', // Light yellow
    textColor: '#92400E', // Dark amber
    dismissible: false,
  },
  expired: {
    icon: '❌',
    getMessage: () => 'Subscription expired',
    backgroundColor: '#FEE2E2', // Light red
    textColor: '#991B1B', // Dark red
    dismissible: false,
  },
  payment_pending: {
    icon: '⏳',
    getMessage: () => 'Payment pending verification',
    backgroundColor: '#DBEAFE', // Light blue
    textColor: '#1E40AF', // Dark blue
    dismissible: true,
  },
};

export function SubscriptionBanner() {
  const router = useRouter();
  const { getSubscriptionState, getDaysUntilExpiry } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);

  const state = getSubscriptionState();
  const daysLeft = getDaysUntilExpiry();

  // Don't show banner for active or no subscription
  if (state === 'none' || state === 'active') {
    return null;
  }

  // Don't show if dismissed (only for dismissible banners)
  const config = BANNER_CONFIG[state];
  if (dismissed && config.dismissible) {
    return null;
  }

  const handlePress = () => {
    if (state === 'payment_pending') {
      router.push('/subscription/pending');
    } else {
      router.push('/subscription/upgrade');
    }
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: config.backgroundColor }]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.message, { color: config.textColor }]}>
          {config.getMessage(daysLeft)}
        </Text>
      </View>

      <View style={styles.actions}>
        {state !== 'payment_pending' && (
          <Text style={[styles.actionText, { color: config.textColor }]}>
            {state === 'expired' ? 'Upgrade' : 'Renew'}
          </Text>
        )}
        {config.dismissible && (
          <Pressable
            style={styles.dismissButton}
            onPress={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            hitSlop={8}
          >
            <Text style={[styles.dismissText, { color: config.textColor }]}>×</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  dismissButton: {
    padding: Spacing.xs,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
});
