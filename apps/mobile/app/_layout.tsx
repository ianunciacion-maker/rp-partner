import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore, useSessionError } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { supabase, withTimeout } from '@/services/supabase';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';

// Component that handles session errors and redirects to login
function SessionErrorHandler() {
  const router = useRouter();
  const sessionError = useSessionError();
  const { showToast } = useToast();

  useEffect(() => {
    if (sessionError === 'expired') {
      showToast('Your session has expired. Please sign in again.', 'error');
      // Small delay to let toast appear before redirect
      setTimeout(() => {
        useAuthStore.getState().clearSessionError();
        router.replace('/(auth)/login');
      }, 100);
    } else if (sessionError === 'network') {
      showToast('Connection issue. Please refresh the page.', 'error');
      useAuthStore.getState().clearSessionError();
    }
  }, [sessionError, router, showToast]);

  return null;
}

export default function RootLayout() {
  const router = useRouter();
  const { initialize, isInitialized, user } = useAuthStore();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    initialize();

    if (Platform.OS === 'web') {
      const timeout = setTimeout(() => {
        if (!useAuthStore.getState().isInitialized) {
          useAuthStore.setState({ isInitialized: true, isLoading: false });
          console.warn('Auth initialization timed out, proceeding as unauthenticated');
        }
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Subscribe to realtime subscription updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh subscription data when it changes
          useSubscriptionStore.getState().fetchSubscription(user.id);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Handle browser visibility changes (web) and app state changes (native)
  // Refresh auth session when app/tab becomes active after being idle
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const isVisible = Platform.OS === 'web'
        ? document.visibilityState === 'visible'
        : AppState.currentState === 'active';

      if (isVisible && useAuthStore.getState().session) {
        try {
          // Refresh the session when app becomes visible with 10s timeout
          const { data: { session }, error } = await withTimeout(
            supabase.auth.getSession(),
            10000,
            'Session refresh timed out'
          );

          if (error) {
            console.error('Failed to refresh session on visibility change:', error);
            useAuthStore.getState().handleAuthError('network');
            return;
          }

          if (session) {
            // Session is still valid, update the store
            useAuthStore.setState({ session, authUser: session.user });
          } else {
            // Session expired, clear auth state and notify user
            console.warn('Session expired while app was inactive');
            useAuthStore.getState().handleAuthError('expired');
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
          // Timeout or network error
          useAuthStore.getState().handleAuthError('network');
        }
      }
    };

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
        if (state === 'active') {
          handleVisibilityChange();
        }
      });
      return () => {
        subscription.remove();
      };
    }
  }, []);

  // Register for push notifications when user is authenticated (native only)
  useEffect(() => {
    if (user?.id && Platform.OS !== 'web') {
      // Dynamically import notifications for native platforms only
      import('@/services/notifications').then(({
        registerForPushNotifications,
        addNotificationReceivedListener,
        addNotificationResponseListener
      }) => {
        registerForPushNotifications(user.id);

        notificationListener.current = addNotificationReceivedListener(() => {});

        responseListener.current = addNotificationResponseListener((response: any) => {
          const data = response.notification.request.content.data;
          if (data?.screen) {
            router.push(data.screen as any);
          }
        });
      });

      return () => {
        if (Platform.OS !== 'web') {
          import('expo-notifications').then((Notifications) => {
            if (notificationListener.current) {
              Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
              Notifications.removeNotificationSubscription(responseListener.current);
            }
          });
        }
      };
    }
  }, [user?.id]);

  // Only block on isInitialized - isLoading is also used during sign-in/out
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
      <SessionErrorHandler />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.neutral.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="property/add"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="property/edit"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="property/[id]/calendar"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="reservation/add"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="reservation/[id]"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="cashflow/add"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="cashflow/[id]"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="subscription/index"
          options={{
            headerShown: true,
            title: 'Subscription',
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="subscription/upgrade"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="subscription/pay"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="subscription/pending"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings/profile"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="settings/help"
          options={{
            headerShown: true,
            headerTintColor: Colors.primary.teal,
            headerStyle: { backgroundColor: Colors.neutral.white },
          }}
        />
        <Stack.Screen
          name="share/[token]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.navy,
  },
});
