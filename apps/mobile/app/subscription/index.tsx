import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    subscription,
    plan,
    userOverrides,
    pendingSubmission,
    isLoading,
    fetchSubscription,
    fetchPlans,
    checkPendingSubmission,
  } = useSubscriptionStore();

  // Refresh subscription data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchSubscription(user.id);
        fetchPlans();
        checkPendingSubmission(user.id);
      }
    }, [user?.id])
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  const isPremium = plan?.name === 'premium';
  const isActive = subscription?.status === 'active';
  const isGracePeriod = subscription?.status === 'grace_period';
  const isExpired = subscription?.status === 'expired';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription</Text>
      </View>

      {/* Current Plan Card */}
      <View style={[styles.planCard, isPremium && styles.premiumCard]}>
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{plan?.display_name || 'Free'}</Text>
        </View>
        <Text style={styles.planName}>{plan?.display_name || 'Free'} Plan</Text>
        {isPremium && (
          <Text style={styles.planPrice}>
            PHP {plan?.price_monthly}/month
          </Text>
        )}

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isActive && styles.statusActive,
              isGracePeriod && styles.statusGrace,
              isExpired && styles.statusExpired,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isActive && styles.statusTextActive,
                isGracePeriod && styles.statusTextGrace,
                isExpired && styles.statusTextExpired,
              ]}
            >
              {isGracePeriod ? 'Grace Period' : isExpired ? 'Expired' : 'Active'}
            </Text>
          </View>
        </View>

        {isPremium && subscription && (
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>
              {isExpired ? 'Expired on' : isGracePeriod ? 'Grace period ends' : 'Renews on'}
            </Text>
            <Text style={styles.dateValue}>
              {formatDate(isGracePeriod ? subscription.grace_period_end : subscription.current_period_end)}
            </Text>
          </View>
        )}

        {isGracePeriod && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Your subscription has expired. Renew now to keep Premium features.
            </Text>
          </View>
        )}
      </View>

      {/* Plan Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Your Plan Features</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Calendar History</Text>
              <Text style={styles.featureValue}>
                {userOverrides?.calendar_months_override === -1
                  ? 'Unlimited'
                  : userOverrides?.calendar_months_override != null
                    ? `${userOverrides.calendar_months_override} months`
                    : plan?.calendar_months_limit === null
                      ? 'Unlimited'
                      : `${plan?.calendar_months_limit || 2} months`}
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Report Exports</Text>
              <Text style={styles.featureValue}>
                {userOverrides?.report_months_override === -1
                  ? 'Unlimited'
                  : userOverrides?.report_months_override != null
                    ? `${userOverrides.report_months_override} months`
                    : plan?.report_months_limit === null
                      ? 'Unlimited'
                      : `${plan?.report_months_limit || 2} months`}
              </Text>
            </View>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏠</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>Properties</Text>
              <Text style={styles.featureValue}>Up to {userOverrides?.property_limit ?? plan?.property_limit ?? 1}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pending Payment Banner */}
      {pendingSubmission && (
        <Pressable
          style={styles.pendingBanner}
          onPress={() => router.push('/subscription/pending')}
        >
          <View style={styles.pendingIcon}>
            <Text style={styles.pendingIconText}>⏳</Text>
          </View>
          <View style={styles.pendingContent}>
            <Text style={styles.pendingTitle}>Payment Pending Verification</Text>
            <Text style={styles.pendingSubtitle}>Tap to view status</Text>
          </View>
          <Text style={styles.pendingArrow}>›</Text>
        </Pressable>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!isPremium && !pendingSubmission && (
          <Button
            title="Upgrade to Premium"
            onPress={() => router.push('/subscription/upgrade')}
            variant="primary"
            fullWidth
          />
        )}
        {isPremium && (isGracePeriod || isExpired) && !pendingSubmission && (
          <Button
            title="Renew Subscription"
            onPress={() => router.push('/subscription/upgrade')}
            variant="primary"
            fullWidth
          />
        )}
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
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
  },
  planCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  premiumCard: {
    backgroundColor: Colors.primary.teal + '10',
    borderWidth: 2,
    borderColor: Colors.primary.teal,
  },
  planBadge: {
    backgroundColor: Colors.primary.teal,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  planBadgeText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  planPrice: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral.gray600,
    marginBottom: Spacing.md,
  },
  statusContainer: {
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusActive: {
    backgroundColor: Colors.semantic.success + '20',
  },
  statusGrace: {
    backgroundColor: Colors.semantic.warning + '20',
  },
  statusExpired: {
    backgroundColor: Colors.semantic.error + '20',
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  statusTextActive: {
    color: Colors.semantic.success,
  },
  statusTextGrace: {
    color: Colors.semantic.warning,
  },
  statusTextExpired: {
    color: Colors.semantic.error,
  },
  dateInfo: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  dateValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  warningBanner: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.semantic.warning + '10',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.semantic.warning,
  },
  warningText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.semantic.warning,
    textAlign: 'center',
  },
  featuresSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  featuresList: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
  },
  featureValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.semantic.warning + '10',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.semantic.warning,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.semantic.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pendingIconText: {
    fontSize: 20,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  pendingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
  },
  pendingArrow: {
    fontSize: 24,
    color: Colors.neutral.gray400,
  },
  actions: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
});
