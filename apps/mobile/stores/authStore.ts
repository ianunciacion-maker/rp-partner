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

let authListenerSetup = false;

export const useAuthStore = create<AuthState>((set, get) => {
  if (!authListenerSetup) {
    authListenerSetup = true;
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (!get().isInitialized) return;

      if (session?.user) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        set({ session, authUser: session.user, user: userData || null });
      } else {
        set({ session: null, authUser: null, user: null });
      }
    });
  }

  return {
    session: null,
    authUser: null,
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
      if (get().isInitialized) return;

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));

      try {
        set({ isLoading: true, error: null });
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ]);

        if (sessionResult === null) {
          console.warn('Auth getSession timed out, proceeding as unauthenticated');
          set({ session: null, authUser: null, user: null, isLoading: false, isInitialized: true });
          return;
        }

        const { data: { session } } = sessionResult;

        if (session?.user) {
          set({
            session,
            authUser: session.user,
            isLoading: false,
            isInitialized: true,
          });

          supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: userData }) => {
              set({ user: userData || null });
            });
        } else {
          set({ session: null, authUser: null, user: null, isLoading: false, isInitialized: true });
        }
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
  };
});

export const useAuth = useAuthStore;
