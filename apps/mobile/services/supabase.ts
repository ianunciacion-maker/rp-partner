import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';

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
    detectSessionInUrl: false,
  },
});

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
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

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'rp-partner://reset-password',
  });
  if (error) throw error;
};
