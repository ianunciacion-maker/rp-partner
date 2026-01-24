import { Platform } from 'react-native';
import { supabase } from './supabase';

export interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
}

// Web stubs - notifications only work on native
const isWeb = Platform.OS === 'web';

/**
 * Register for push notifications and save token to database
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (isWeb) return null;

  const Notifications = await import('expo-notifications');
  const Device = await import('expo-device');
  const Constants = await import('expo-constants');

  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Push notifications only work on physical devices
  if (!Device.default.isDevice) {
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    // Get the Expo push token
    const projectId = Constants.default.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Save token to database
    const { error } = await supabase
      .from('users')
      .update({ push_token: token.data })
      .eq('id', userId);

    if (error) {
      console.error('Failed to save push token:', error);
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14b8a6',
      });

      await Notifications.setNotificationChannelAsync('subscription', {
        name: 'Subscription Reminders',
        description: 'Reminders about your subscription status',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14b8a6',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Remove push token from database (on logout)
 */
export async function unregisterPushNotifications(userId: string): Promise<void> {
  try {
    await supabase
      .from('users')
      .update({ push_token: null })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to remove push token:', error);
  }
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(callback: (response: any) => void) {
  if (isWeb) return { remove: () => {} };

  // Dynamic import for native
  let subscription: any = null;
  import('expo-notifications').then((Notifications) => {
    subscription = Notifications.addNotificationResponseReceivedListener(callback);
  });

  return {
    remove: () => {
      if (subscription) subscription.remove();
    }
  };
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(callback: (notification: any) => void) {
  if (isWeb) return { remove: () => {} };

  let subscription: any = null;
  import('expo-notifications').then((Notifications) => {
    subscription = Notifications.addNotificationReceivedListener(callback);
  });

  return {
    remove: () => {
      if (subscription) subscription.remove();
    }
  };
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  triggerSeconds?: number
): Promise<string> {
  if (isWeb) return '';

  const Notifications = await import('expo-notifications');
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: triggerSeconds ? { seconds: triggerSeconds } : null,
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (isWeb) return;

  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  if (isWeb) return 0;

  const Notifications = await import('expo-notifications');
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (isWeb) return;

  const Notifications = await import('expo-notifications');
  await Notifications.setBadgeCountAsync(count);
}
