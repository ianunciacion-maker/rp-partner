import { create } from 'zustand';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/services/supabase';
import type { User } from '@/types/database';

interface AuthState {
  session: Session | null;
  authUser: AuthUser | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  authUser: null,
  user: null,
  isLoading: false, // Start false - isInitialized gates the UI
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({ session, authUser: session.user, user: userData || null, isLoading: false, isInitialized: true });
      } else {
        set({ session: null, authUser: null, user: null, isLoading: false, isInitialized: true });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          set({ session, authUser: session.user, user: userData || null });
        } else {
          set({ session: null, authUser: null, user: null });
        }
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initialize', isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { session, user: authUser } = await signInWithEmail(email, password);
      if (authUser) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        set({ session, authUser, user: userData || null, isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign in', isLoading: false });
      throw error;
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      set({ isLoading: true, error: null });
      const { session, user: authUser } = await signUpWithEmail(email, password, fullName);
      if (authUser) {
        set({ session, authUser, user: null, isLoading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign up', isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabaseSignOut();
      set({ session: null, authUser: null, user: null, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign out', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export const useAuth = useAuthStore;
