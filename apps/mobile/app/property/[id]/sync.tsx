import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Platform, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { isAuthError } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useCanAddIcalSubscription } from '@/stores/subscriptionStore';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { useToast } from '@/components/ui/Toast';
import {
  getIcalSubscriptions,
  addIcalSubscription,
  removeIcalSubscription,
  getSubscriptionCount,
  getOrCreateFeedToken,
  getFeedToken,
  revokeFeedToken,
  getFeedUrl,
  triggerSyncForSubscription,
  SOURCE_LABELS,
  type IcalSourceName,
} from '@/services/icalSync';
import type { IcalSubscription } from '@/types/database';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

const SOURCES: { key: IcalSourceName; label: string; color: string }[] = [
  { key: 'airbnb', label: 'Airbnb', color: '#FF5A5F' },
  { key: 'vrbo', label: 'VRBO', color: '#3B5998' },
  { key: 'booking_com', label: 'Booking.com', color: '#003580' },
  { key: 'other', label: 'Other', color: Colors.neutral.gray500 },
];

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function getStatusBadge(status: string): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'synced':
      return { label: 'Synced', color: Colors.semantic.success, bgColor: Colors.semantic.success + '20' };
    case 'error':
      return { label: 'Error', color: Colors.semantic.error, bgColor: Colors.semantic.error + '20' };
    default:
      return { label: 'Pending', color: Colors.neutral.gray500, bgColor: Colors.neutral.gray200 };
  }
}

function getSourceColor(sourceName: string): string {
  const source = SOURCES.find(s => s.key === sourceName);
  return source?.color || Colors.neutral.gray500;
}

function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

export default function CalendarSyncScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const canAddSubscription = useCanAddIcalSubscription();

  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<IcalSubscription[]>([]);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [selectedSource, setSelectedSource] = useState<IcalSourceName>('airbnb');
  const [feedUrl, setFeedUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [exportToken, setExportToken] = useState<string | null>(null);
  const [isEnablingExport, setIsEnablingExport] = useState(false);
  const [isDisablingExport, setIsDisablingExport] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [subs, count, token] = await Promise.all([
        getIcalSubscriptions(id),
        getSubscriptionCount(id),
        getFeedToken(id),
      ]);
      setSubscriptions(subs);
      setSubscriptionCount(count);
      setExportToken(token);
    } catch (error: any) {
      if (isAuthError(error)) {
        showToast('Session expired. Please sign in again.', 'error');
        useAuthStore.getState().handleAuthError('expired');
        return;
      }
      showToast('Failed to load sync settings', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSubscription = async () => {
    if (!id) return;

    const trimmedUrl = feedUrl.trim();
    if (!trimmedUrl) {
      showToast('Please enter an iCal feed URL', 'error');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      showToast('Please enter a valid URL starting with http:// or https://', 'error');
      return;
    }

    if (!canAddSubscription(subscriptionCount)) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsAdding(true);
    try {
      const newSub = await addIcalSubscription(id, trimmedUrl, selectedSource);
      setFeedUrl('');
      showToast('Calendar added! Syncing now...', 'success');
      await loadData();
      triggerSyncForSubscription(newSub.id).catch(() => {});
    } catch (error: any) {
      if (isAuthError(error)) {
        showToast('Session expired. Please sign in again.', 'error');
        useAuthStore.getState().handleAuthError('expired');
        return;
      }
      showToast(error.message || 'Failed to add calendar', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSubscription = async (subscriptionId: string) => {
    const confirmRemove = () => {
      setRemovingId(subscriptionId);
      removeIcalSubscription(subscriptionId)
        .then(() => {
          showToast('Calendar removed', 'success');
          loadData();
        })
        .catch((error: any) => {
          if (isAuthError(error)) {
            showToast('Session expired. Please sign in again.', 'error');
            useAuthStore.getState().handleAuthError('expired');
            return;
          }
          showToast(error.message || 'Failed to remove calendar', 'error');
        })
        .finally(() => setRemovingId(null));
    };

    if (isWeb) {
      if (window.confirm('Remove this calendar subscription?')) {
        confirmRemove();
      }
    } else {
      Alert.alert(
        'Remove Calendar',
        'Remove this calendar subscription?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: confirmRemove },
        ]
      );
    }
  };

  const handleEnableExport = async () => {
    if (!id) return;
    setIsEnablingExport(true);
    try {
      const token = await getOrCreateFeedToken(id);
      setExportToken(token);
      showToast('Export feed enabled', 'success');
    } catch (error: any) {
      if (isAuthError(error)) {
        showToast('Session expired. Please sign in again.', 'error');
        useAuthStore.getState().handleAuthError('expired');
        return;
      }
      showToast(error.message || 'Failed to enable export feed', 'error');
    } finally {
      setIsEnablingExport(false);
    }
  };

  const handleDisableExport = async () => {
    if (!id) return;

    const confirmDisable = () => {
      setIsDisablingExport(true);
      revokeFeedToken(id)
        .then(() => {
          setExportToken(null);
          showToast('Export feed disabled', 'success');
        })
        .catch((error: any) => {
          if (isAuthError(error)) {
            showToast('Session expired. Please sign in again.', 'error');
            useAuthStore.getState().handleAuthError('expired');
            return;
          }
          showToast(error.message || 'Failed to disable export feed', 'error');
        })
        .finally(() => setIsDisablingExport(false));
    };

    if (isWeb) {
      if (window.confirm('Disable the export feed? Any platforms using this URL will lose access.')) {
        confirmDisable();
      }
    } else {
      Alert.alert(
        'Disable Export Feed',
        'Any platforms using this URL will lose access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: confirmDisable },
        ]
      );
    }
  };

  const handleCopyFeedUrl = async () => {
    if (!exportToken) return;
    const url = getFeedUrl(exportToken);
    await Clipboard.setStringAsync(url);
    showToast('Feed URL copied to clipboard', 'success');
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Calendar Sync', headerBackTitle: 'Back' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.teal} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Calendar Sync', headerBackTitle: 'Back' }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import External Calendar</Text>
          <Text style={styles.sectionSubtitle}>
            Sync bookings from Airbnb, VRBO, or other platforms
          </Text>

          <View style={styles.sourceRow}>
            {SOURCES.map((source) => (
              <Pressable
                key={source.key}
                style={[
                  styles.sourceChip,
                  selectedSource === source.key && { backgroundColor: source.color + '20', borderColor: source.color },
                  isWeb && ({ cursor: 'pointer' } as any),
                ]}
                onPress={() => setSelectedSource(source.key)}
              >
                <View style={[styles.sourceDot, { backgroundColor: source.color }]} />
                <Text
                  style={[
                    styles.sourceChipText,
                    selectedSource === source.key && { color: source.color, fontWeight: Typography.fontWeight.semibold },
                  ]}
                >
                  {source.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.urlInput}
            placeholder="Paste iCal feed URL here..."
            placeholderTextColor={Colors.neutral.gray400}
            value={feedUrl}
            onChangeText={setFeedUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Pressable
            style={[
              styles.addButton,
              (isAdding || !feedUrl.trim()) && styles.disabledButton,
              isWeb && ({ cursor: isAdding || !feedUrl.trim() ? 'not-allowed' : 'pointer' } as any),
            ]}
            onPress={handleAddSubscription}
            disabled={isAdding || !feedUrl.trim()}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={Colors.neutral.white} />
            ) : (
              <Text style={styles.addButtonText}>Add Calendar</Text>
            )}
          </Pressable>

          {subscriptions.length > 0 && (
            <View style={styles.subscriptionList}>
              {subscriptions.map((sub) => {
                const badge = getStatusBadge(sub.last_sync_status);
                const sourceColor = getSourceColor(sub.source_name);
                const isRemoving = removingId === sub.id;

                return (
                  <View key={sub.id} style={styles.subscriptionCard}>
                    <View style={styles.subscriptionHeader}>
                      <View style={styles.sourceLabel}>
                        <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
                        <Text style={styles.sourceLabelText}>
                          {SOURCE_LABELS[sub.source_name as IcalSourceName] || sub.source_name}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.feedUrlText} numberOfLines={1}>
                      {truncateUrl(sub.feed_url)}
                    </Text>

                    <View style={styles.subscriptionFooter}>
                      <Text style={styles.lastSyncedText}>
                        Last synced: {formatRelativeTime(sub.last_synced_at)}
                      </Text>
                      <Pressable
                        style={[
                          styles.removeButton,
                          isRemoving && styles.disabledButton,
                          isWeb && ({ cursor: isRemoving ? 'not-allowed' : 'pointer' } as any),
                        ]}
                        onPress={() => handleRemoveSubscription(sub.id)}
                        disabled={isRemoving}
                      >
                        <Text style={styles.removeButtonText}>
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </Text>
                      </Pressable>
                    </View>

                    {sub.last_sync_status === 'error' && sub.last_error_message && (
                      <Text style={styles.errorMessage} numberOfLines={2}>
                        {sub.last_error_message}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {subscriptions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No external calendars connected yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Your Calendar</Text>
          <Text style={styles.sectionSubtitle}>
            Share your Tuknang availability with other platforms
          </Text>

          {exportToken ? (
            <View style={styles.exportEnabled}>
              <View style={styles.exportUrlRow}>
                <TextInput
                  style={styles.exportUrlInput}
                  value={getFeedUrl(exportToken)}
                  editable={false}
                  selectTextOnFocus
                />
                <Pressable
                  style={[styles.copyButton, isWeb && ({ cursor: 'pointer' } as any)]}
                  onPress={handleCopyFeedUrl}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </Pressable>
              </View>

              <Text style={styles.instructionsText}>
                Paste this URL into Airbnb, VRBO, or any calendar app to share your availability
              </Text>

              <Pressable
                style={[
                  styles.disableFeedButton,
                  isDisablingExport && styles.disabledButton,
                  isWeb && ({ cursor: isDisablingExport ? 'not-allowed' : 'pointer' } as any),
                ]}
                onPress={handleDisableExport}
                disabled={isDisablingExport}
              >
                <Text style={styles.disableFeedButtonText}>
                  {isDisablingExport ? 'Disabling...' : 'Disable Feed'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.enableFeedButton,
                isEnablingExport && styles.disabledButton,
                isWeb && ({ cursor: isEnablingExport ? 'not-allowed' : 'pointer' } as any),
              ]}
              onPress={handleEnableExport}
              disabled={isEnablingExport}
            >
              {isEnablingExport ? (
                <ActivityIndicator size="small" color={Colors.neutral.white} />
              ) : (
                <Text style={styles.enableFeedButtonText}>Enable Export Feed</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="calendar"
        reason="limit_reached"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.gray50,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    backgroundColor: Colors.neutral.white,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  sourceChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
  },
  urlInput: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray900,
    marginBottom: Spacing.md,
  },
  addButton: {
    backgroundColor: Colors.primary.teal,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  addButtonText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  disabledButton: {
    opacity: 0.5,
  },
  subscriptionList: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  subscriptionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sourceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLabelText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral.gray900,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  feedUrlText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginBottom: Spacing.sm,
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSyncedText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray400,
  },
  removeButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  removeButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.semantic.error,
    fontWeight: Typography.fontWeight.medium,
  },
  errorMessage: {
    fontSize: Typography.fontSize.xs,
    color: Colors.semantic.error,
    marginTop: Spacing.sm,
    backgroundColor: Colors.semantic.error + '10',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray400,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.gray200,
    marginHorizontal: Spacing.lg,
  },
  exportEnabled: {
    gap: Spacing.md,
  },
  exportUrlRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exportUrlInput: {
    flex: 1,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
  },
  copyButton: {
    backgroundColor: Colors.primary.teal,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  instructionsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    lineHeight: 20,
  },
  disableFeedButton: {
    borderWidth: 1,
    borderColor: Colors.semantic.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  disableFeedButtonText: {
    color: Colors.semantic.error,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  enableFeedButton: {
    backgroundColor: Colors.primary.navy,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  enableFeedButtonText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
