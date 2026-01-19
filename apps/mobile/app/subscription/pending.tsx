import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import type { PaymentSubmission } from '@/types/database';

export default function PendingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { pendingSubmission, checkPendingSubmission, fetchSubscription } = useSubscriptionStore();
  const [submission, setSubmission] = useState<PaymentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSubmission();
    }
  }, [user?.id]);

  // Poll for status updates
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      await checkPendingSubmission(user.id);
      await loadSubmission();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const loadSubmission = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('payment_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading submission:', error);
      }

      setSubmission(data || null);

      // If approved, refresh subscription and redirect
      if (data?.status === 'approved') {
        await fetchSubscription(user.id);
        router.replace('/subscription');
      }
    } catch (err) {
      console.error('Error loading submission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Pending Payment</Text>
          <Text style={styles.emptyText}>
            You don't have any pending payment submissions.
          </Text>
          <Button
            title="Back to Subscription"
            onPress={() => router.replace('/subscription')}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  const isPending = submission.status === 'pending';
  const isApproved = submission.status === 'approved';
  const isRejected = submission.status === 'rejected';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Payment Status</Text>
      </View>

      {/* Status Card */}
      <View
        style={[
          styles.statusCard,
          isPending && styles.statusCardPending,
          isApproved && styles.statusCardApproved,
          isRejected && styles.statusCardRejected,
        ]}
      >
        <Text style={styles.statusIcon}>
          {isPending ? '⏳' : isApproved ? '✅' : '❌'}
        </Text>
        <Text
          style={[
            styles.statusTitle,
            isPending && styles.statusTitlePending,
            isApproved && styles.statusTitleApproved,
            isRejected && styles.statusTitleRejected,
          ]}
        >
          {isPending
            ? 'Verification In Progress'
            : isApproved
            ? 'Payment Approved!'
            : 'Payment Rejected'}
        </Text>
        <Text style={styles.statusDescription}>
          {isPending
            ? 'We are reviewing your payment. This usually takes less than 24 hours.'
            : isApproved
            ? 'Your Premium subscription is now active. Enjoy unlimited access!'
            : 'Unfortunately, we could not verify your payment.'}
        </Text>

        {isRejected && submission.rejection_reason && (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionLabel}>Reason:</Text>
            <Text style={styles.rejectionText}>{submission.rejection_reason}</Text>
          </View>
        )}
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>PHP {submission.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>
              {submission.months_purchased} {submission.months_purchased === 1 ? 'month' : 'months'}
            </Text>
          </View>
          {submission.reference_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference #</Text>
              <Text style={styles.detailValue}>{submission.reference_number}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Submitted</Text>
            <Text style={styles.detailValue}>{formatDate(submission.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Screenshot Preview */}
      {submission.screenshot_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submitted Screenshot</Text>
          <View style={styles.screenshotContainer}>
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-screenshots/${submission.screenshot_url}`,
              }}
              style={styles.screenshot}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {isRejected && (
          <Button
            title="Try Again"
            onPress={() => router.replace('/subscription/upgrade')}
            variant="primary"
            fullWidth
          />
        )}
        {isPending && (
          <View style={styles.refreshContainer}>
            <ActivityIndicator size="small" color={Colors.primary.teal} />
            <Text style={styles.refreshText}>Checking for updates...</Text>
          </View>
        )}
        <Button
          title="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          variant={isRejected ? 'outline' : 'primary'}
          fullWidth
        />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    marginBottom: Spacing.xl,
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
  statusCard: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  statusCardPending: {
    backgroundColor: Colors.semantic.warning + '15',
    borderWidth: 2,
    borderColor: Colors.semantic.warning,
  },
  statusCardApproved: {
    backgroundColor: Colors.semantic.success + '15',
    borderWidth: 2,
    borderColor: Colors.semantic.success,
  },
  statusCardRejected: {
    backgroundColor: Colors.semantic.error + '15',
    borderWidth: 2,
    borderColor: Colors.semantic.error,
  },
  statusIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  statusTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  statusTitlePending: {
    color: Colors.semantic.warning,
  },
  statusTitleApproved: {
    color: Colors.semantic.success,
  },
  statusTitleRejected: {
    color: Colors.semantic.error,
  },
  statusDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  rejectionBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    width: '100%',
  },
  rejectionLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.xs,
  },
  rejectionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  detailsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  detailLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray500,
  },
  detailValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  screenshotContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  screenshot: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
  },
  actions: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  refreshText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.teal,
  },
});
