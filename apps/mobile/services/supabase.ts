import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';
import { useAuthStore } from '@/stores/authStore';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Check if we're in a browser environment (not SSR/Node.js)
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    // Web browser - use localStorage
    if (Platform.OS === 'web' && isBrowser) {
      return window.localStorage.getItem(key);
    }
    // SSR/Node.js - return null (no persistence)
    if (Platform.OS === 'web') {
      return null;
    }
    // Native - use SecureStore with AsyncStorage fallback
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web' && isBrowser) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (Platform.OS === 'web') {
      return; // SSR - no-op
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web' && isBrowser) {
      window.localStorage.removeItem(key);
      return;
    }
    if (Platform.OS === 'web') {
      return; // SSR - no-op
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // Enable URL session detection for web (password reset, OAuth callbacks)
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Production web URL for password reset redirects
const PRODUCTION_URL = 'https://tuknang.com';

export const resetPassword = async (email: string) => {
  // Always use production URL for web to ensure email links work
  // Native apps use deep link scheme
  const redirectUrl = Platform.OS === 'web'
    ? `${PRODUCTION_URL}/reset-password`
    : 'rp-partner://reset-password';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

/**
 * Utility to wrap a promise with a timeout
 * Use for critical queries that shouldn't hang indefinitely
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

export const ensureSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await withTimeout(
      supabase.auth.getSession(),
      10000,
      'Session check timed out'
    );
    if (error || !session) return false;
    useAuthStore.setState({ session, authUser: session.user });
    return true;
  } catch {
    const existingSession = useAuthStore.getState().session;
    return !!existingSession;
  }
};

export const isAuthError = (error: any): boolean => {
  const code = error?.code;
  const status = error?.status ?? error?.statusCode;
  const message = error?.message?.toLowerCase() ?? '';
  return status === 401 || status === 403 || status === 406
    || code === 'PGRST301' || code === '42501'
    || message.includes('jwt') || message.includes('token')
    || message.includes('not authenticated');
};

/**
 * Check if the Supabase connection is healthy
 * Returns true if we can reach the database
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    const result = await withTimeout(
      supabase.from('users').select('id').limit(1),
      5000,
      'Connection check timed out'
    );
    return !result.error;
  } catch {
    return false;
  }
};
