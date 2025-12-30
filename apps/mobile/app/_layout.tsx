import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const { initialize, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.teal} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
      </Stack>
      <StatusBar style="auto" />
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
