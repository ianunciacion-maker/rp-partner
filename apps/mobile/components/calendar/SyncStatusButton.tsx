import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { getIcalSubscriptions, triggerSyncForProperty } from '@/services/icalSync';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import { useToast } from '@/components/ui/Toast';
import type { IcalSubscription } from '@/types/database';
import { Colors, Spacing, Typography } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

interface SyncStatusButtonProps {
  propertyId: string | null;
  onSyncComplete?: () => void;
}

export function SyncStatusButton({ propertyId, onSyncComplete }: SyncStatusButtonProps) {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<IcalSubscription[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    if (!propertyId) {
      setSubscriptions([]);
      setIsLoaded(true);
      return;
    }
    try {
      const subs = await getIcalSubscriptions(propertyId);
      setSubscriptions(subs);
    } catch {
      setSubscriptions([]);
    } finally {
      setIsLoaded(true);
    }
  }, [propertyId]);

  useEffect(() => {
    setIsLoaded(false);
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleSync = async () => {
    if (!propertyId || isSyncing) return;
    setIsSyncing(true);
    try {
      await triggerSyncForProperty(propertyId);
      showToast('Calendar synced', 'success');
      await loadSubscriptions();
      onSyncComplete?.();
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoaded || !propertyId || subscriptions.length === 0) return null;

  const mostRecentSync = subscriptions.reduce<string | null>((latest, sub) => {
    if (!sub.last_synced_at) return latest;
    if (!latest) return sub.last_synced_at;
    return sub.last_synced_at > latest ? sub.last_synced_at : latest;
  }, null);

  return (
    <Pressable
      style={[styles.container, isWeb && ({ cursor: isSyncing ? 'not-allowed' : 'pointer' } as any)]}
      onPress={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={Colors.primary.teal} style={styles.spinner} />
          <Text style={styles.syncingText}>Syncing...</Text>
        </View>
      ) : (
        <Text style={styles.idleText}>
          Synced {formatRelativeTime(mostRecentSync, true)}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: Spacing.xs,
    transform: [{ scale: 0.7 }],
  },
  syncingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary.teal,
  },
  idleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral.gray500,
  },
});
