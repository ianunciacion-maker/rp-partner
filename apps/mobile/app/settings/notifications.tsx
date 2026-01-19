import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const isWeb = Platform.OS === 'web';

interface NotificationSetting {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      key: 'reservations',
      title: 'New Reservations',
      description: 'Get notified when you receive a new booking',
      enabled: true,
    },
    {
      key: 'reminders',
      title: 'Check-in Reminders',
      description: 'Reminders for upcoming guest check-ins',
      enabled: true,
    },
    {
      key: 'payments',
      title: 'Payment Updates',
      description: 'Updates on payment status and confirmations',
      enabled: true,
    },
    {
      key: 'subscription',
      title: 'Subscription Alerts',
      description: 'Reminders about your subscription status',
      enabled: true,
    },
  ]);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (!isWeb) {
      checkPushPermission();
    }
  }, []);

  const checkPushPermission = async () => {
    try {
      const Notifications = await import('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      setPushEnabled(status === 'granted');
    } catch (error) {
      console.log('Push notifications not available');
    }
  };

  const toggleSetting = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Stack.Screen options={{ title: 'Notifications', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container}>
        {isWeb ? (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeIcon}>📱</Text>
            <Text style={styles.webNoticeTitle}>Push Notifications</Text>
            <Text style={styles.webNoticeText}>
              Push notifications are only available on the mobile app. Download our app to receive real-time updates about your properties.
            </Text>
          </View>
        ) : (
          <>
            {/* Push Permission Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Push Notifications</Text>
              <View style={styles.permissionRow}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>
                    {pushEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                  <Text style={styles.permissionDescription}>
                    {pushEnabled
                      ? 'You will receive push notifications'
                      : 'Enable in device settings to receive notifications'}
                  </Text>
                </View>
                {!pushEnabled && (
                  <Text style={styles.enableLink} onPress={openSettings}>
                    Enable
                  </Text>
                )}
              </View>
            </View>

            {/* Notification Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Types</Text>
              {settings.map((setting) => (
                <View key={setting.key} style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={() => toggleSetting(setting.key)}
                    trackColor={{ false: Colors.neutral.gray300, true: Colors.primary.teal }}
                    thumbColor={Colors.neutral.white}
                    disabled={!pushEnabled}
                  />
                </View>
              ))}
            </View>

            {!pushEnabled && (
              <View style={styles.disabledNotice}>
                <Text style={styles.disabledNoticeText}>
                  Enable push notifications in your device settings to customize notification preferences.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.neutral.gray500,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.neutral.gray900,
  },
  permissionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
  enableLink: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.teal,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    color: Colors.neutral.gray900,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray500,
    marginTop: Spacing.xs,
  },
  disabledNotice: {
    padding: Spacing.lg,
    margin: Spacing.lg,
    backgroundColor: Colors.neutral.gray100,
    borderRadius: BorderRadius.lg,
  },
  disabledNoticeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral.gray600,
    textAlign: 'center',
  },
  webNotice: {
    alignItems: 'center',
    padding: Spacing.xl,
    margin: Spacing.lg,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
  },
  webNoticeIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  webNoticeTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '600',
    color: Colors.neutral.gray900,
    marginBottom: Spacing.sm,
  },
  webNoticeText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
});
