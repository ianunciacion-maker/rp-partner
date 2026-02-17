import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/services/supabase';
import type { User } from '@/types/database';

export type SessionErrorType = 'expired' | 'network' | null;

interface AuthState {
  session: Session | null;
  authUser: AuthUser | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  sessionError: SessionErrorType;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  handleAuthError: (type: 'expired' | 'network') => void;
  clearSessionError: () => void;
}

let authListenerSetup = false;

export const useAuthStore = create<AuthState>((set, get) => {
  if (!authListenerSetup) {
    authListenerSetup = true;
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (!get().isInitialized) {
        if (event === 'SIGNED_OUT') return;
        if (session?.user) {
          set({ session, authUser: session.user });
        }
        return;
      }

      try {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed successfully');
        }

        if (event === 'SIGNED_OUT') {
          set({ session: null, authUser: null, user: null });
          return;
        }

        if (session?.user) {
          const { data: userData, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (error) {
            console.error('Failed to fetch user data on auth change:', error);
          }
          set({ session, authUser: session.user, user: userData || null });
        } else {
          set({ session: null, authUser: null, user: null });
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        // On error, clear session to force re-authentication
        if (event === 'TOKEN_REFRESHED') {
          console.warn('Token refresh failed, clearing session');
          set({ session: null, authUser: null, user: null });
        }
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
    sessionError: null,

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

  handleAuthError: (type: 'expired' | 'network') => {
    if (type === 'expired') {
      set({ session: null, authUser: null, user: null, sessionError: type });
    } else {
      set({ sessionError: type });
    }
  },

  clearSessionError: () => set({ sessionError: null }),
  };
});

// Legacy alias - prefer using granular selectors below
export const useAuth = useAuthStore;

// =============================================================================
// GRANULAR SELECTORS - Use these to prevent unnecessary re-renders
// =============================================================================

// Atomic selectors - subscribe to individual state slices
export const useUser = () => useAuthStore(state => state.user);
export const useAuthUser = () => useAuthStore(state => state.authUser);
export const useSession = () => useAuthStore(state => state.session);
export const useAuthInitialized = () => useAuthStore(state => state.isInitialized);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Derived selectors
export const useIsAuthenticated = () => useAuthStore(state => !!state.session);
export const useUserId = () => useAuthStore(state => state.user?.id ?? state.authUser?.id ?? null);

// Session error selector
export const useSessionError = () => useAuthStore(state => state.sessionError);

// Action selectors - stable references (actions never change)
export const useAuthActions = () => useAuthStore(
  useShallow(state => ({
    initialize: state.initialize,
    signIn: state.signIn,
    signUp: state.signUp,
    signOut: state.signOut,
    clearError: state.clearError,
    handleAuthError: state.handleAuthError,
    clearSessionError: state.clearSessionError,
  }))
);
