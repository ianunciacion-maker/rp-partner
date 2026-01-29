import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/services/supabase';
import type { SubscriptionPlan, PaymentMethod, PaymentSubmission, SubscriptionWithPlan } from '@/types/database';

// Constants for billing cycle
export const BILLING_CYCLE_DAYS = 30;
export const GRACE_PERIOD_DAYS = 3;

// Subscription state types
export type SubscriptionStateType = 'none' | 'active' | 'expiring_soon' | 'grace_period' | 'expired' | 'payment_pending';

interface UserOverrides {
  calendar_months_override: number | null;
  report_months_override: number | null;
  property_limit: number;
}

interface SubscriptionState {
  subscription: SubscriptionWithPlan | null;
  plan: SubscriptionPlan | null;
  plans: SubscriptionPlan[];
  paymentMethods: PaymentMethod[];
  pendingSubmission: PaymentSubmission | null;
  userOverrides: UserOverrides | null;
  isLoading: boolean;
  error: string | null;

  // Feature checks
  canAccessCalendarMonth: (monthsFromNow: number) => boolean;
  canExportReportMonth: (monthsBack: number) => boolean;
  canAddProperty: (currentCount: number) => boolean;
  isPremium: () => boolean;
  isInGracePeriod: () => boolean;

  // State helpers
  getDaysUntilExpiry: () => number | null;
  getSubscriptionState: () => SubscriptionStateType;

  // Actions
  fetchSubscription: (userId: string) => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  checkPendingSubmission: (userId: string) => Promise<void>;
  submitPayment: (data: {
    userId: string;
    paymentMethodId: string;
    amount: number;
    screenshotUrl: string;
    referenceNumber?: string;
    monthsPurchased?: number;
  }) => Promise<PaymentSubmission>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  plan: null,
  plans: [],
  paymentMethods: [],
  pendingSubmission: null,
  userOverrides: null,
  isLoading: false,
  error: null,

  canAccessCalendarMonth: (monthsFromNow: number) => {
    const { plan, subscription, userOverrides } = get();

    // Active paid subscription = unlimited access
    if (subscription?.status === 'active' && plan?.name === 'premium') {
      return true;
    }

    // Check user-level override first (admin granted)
    // -1 means unlimited, null means use plan default
    if (userOverrides?.calendar_months_override !== null && userOverrides?.calendar_months_override !== undefined) {
      if (userOverrides.calendar_months_override === -1) return true;
      return Math.abs(monthsFromNow) <= userOverrides.calendar_months_override;
    }

    // No subscription or expired = no access beyond current month
    if (!subscription || subscription.status === 'expired') {
      return monthsFromNow === 0;
    }

    // In grace period, allow limited access
    if (subscription.status === 'grace_period') {
      return monthsFromNow >= -2 && monthsFromNow <= 2;
    }

    // No plan means free tier
    if (!plan) return monthsFromNow >= -2 && monthsFromNow <= 2;

    // Unlimited if plan has no limit
    if (plan.calendar_months_limit === null) return true;

    // Check against limit (negative for past, positive for future)
    return Math.abs(monthsFromNow) <= plan.calendar_months_limit;
  },

  canExportReportMonth: (monthsBack: number) => {
    const { plan, subscription, userOverrides } = get();

    // Active paid subscription = unlimited access
    if (subscription?.status === 'active' && plan?.name === 'premium') {
      return true;
    }

    // Check user-level override first (admin granted)
    // -1 means unlimited, null means use plan default
    if (userOverrides?.report_months_override !== null && userOverrides?.report_months_override !== undefined) {
      if (userOverrides.report_months_override === -1) return true;
      return monthsBack <= userOverrides.report_months_override;
    }

    // No subscription or expired = no export access
    if (!subscription || subscription.status === 'expired') {
      return monthsBack <= 1;
    }

    // In grace period, allow limited access
    if (subscription.status === 'grace_period') {
      return monthsBack <= 2;
    }

    // No plan means free tier
    if (!plan) return monthsBack <= 2;

    // Unlimited if plan has no limit
    if (plan.report_months_limit === null) return true;

    // Check against limit
    return monthsBack <= plan.report_months_limit;
  },

  canAddProperty: (currentCount: number) => {
    const { plan, subscription, userOverrides } = get();

    // User's property_limit (set by admin) takes precedence
    const limit = userOverrides?.property_limit ?? plan?.property_limit ?? 1;
    return currentCount < limit;
  },

  isPremium: () => {
    const { plan, subscription } = get();
    return subscription?.status === 'active' && plan?.name === 'premium';
  },

  isInGracePeriod: () => {
    const { subscription } = get();
    return subscription?.status === 'grace_period';
  },

  getDaysUntilExpiry: () => {
    const { subscription } = get();
    if (!subscription?.current_period_end) return null;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getSubscriptionState: () => {
    const { subscription, pendingSubmission } = get();

    // Check for pending payment first
    if (pendingSubmission?.status === 'pending') return 'payment_pending';

    // No subscription means free tier
    if (!subscription) return 'none';

    // Check subscription status
    if (subscription.status === 'expired') return 'expired';
    if (subscription.status === 'grace_period') return 'grace_period';

    // Check if expiring soon (within 7 days)
    const daysLeft = get().getDaysUntilExpiry();
    if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) return 'expiring_soon';

    return 'active';
  },

  fetchSubscription: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch subscription and user overrides in parallel
      const [subResult, userResult] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('users')
          .select('calendar_months_override, report_months_override, property_limit')
          .eq('id', userId)
          .single(),
      ]);

      if (subResult.error && subResult.error.code !== 'PGRST116') {
        throw subResult.error;
      }

      const userOverrides: UserOverrides | null = userResult.data ? {
        calendar_months_override: userResult.data.calendar_months_override,
        report_months_override: userResult.data.report_months_override,
        property_limit: userResult.data.property_limit,
      } : null;

      if (subResult.data) {
        set({
          subscription: subResult.data as SubscriptionWithPlan,
          plan: subResult.data.plan as SubscriptionPlan || null,
          userOverrides,
          isLoading: false,
        });
      } else {
        set({ subscription: null, plan: null, userOverrides, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        isLoading: false,
      });
    }
  },

  fetchPlans: async () => {
    const { plans } = get();
    if (plans.length > 0) return;

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      set({ plans: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch plans' });
    }
  },

  fetchPaymentMethods: async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      set({ paymentMethods: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch payment methods' });
    }
  },

  checkPendingSubmission: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_submissions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      set({ pendingSubmission: data || null });
    } catch (error) {
      set({ pendingSubmission: null });
    }
  },

  submitPayment: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const { data: submission, error } = await supabase
        .from('payment_submissions')
        .insert({
          user_id: data.userId,
          payment_method_id: data.paymentMethodId,
          amount: data.amount,
          screenshot_url: data.screenshotUrl,
          reference_number: data.referenceNumber || null,
          months_purchased: data.monthsPurchased || 1,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      set({ pendingSubmission: submission, isLoading: false });
      return submission;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit payment',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Legacy alias - prefer using granular selectors below
export const useSubscription = useSubscriptionStore;

// =============================================================================
// GRANULAR SELECTORS - Use these to prevent unnecessary re-renders
// =============================================================================

// Atomic selectors - subscribe to individual state slices
export const useSubscriptionData = () => useSubscriptionStore(state => state.subscription);
export const usePlan = () => useSubscriptionStore(state => state.plan);
export const usePlans = () => useSubscriptionStore(state => state.plans);
export const useUserOverrides = () => useSubscriptionStore(state => state.userOverrides);
export const usePendingSubmission = () => useSubscriptionStore(state => state.pendingSubmission);
export const usePaymentMethods = () => useSubscriptionStore(state => state.paymentMethods);
export const useSubscriptionLoading = () => useSubscriptionStore(state => state.isLoading);
export const useSubscriptionError = () => useSubscriptionStore(state => state.error);

// Derived state hooks - computed from state without calling get()
export const useIsPremium = () => useSubscriptionStore(
  state => state.subscription?.status === 'active' && state.plan?.name === 'premium'
);

export const useIsInGracePeriod = () => useSubscriptionStore(
  state => state.subscription?.status === 'grace_period'
);

export const useDaysUntilExpiry = () => useSubscriptionStore(state => {
  if (!state.subscription?.current_period_end) return null;
  const endDate = new Date(state.subscription.current_period_end);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export const useSubscriptionState = (): SubscriptionStateType => {
  const subscription = useSubscriptionData();
  const pendingSubmission = usePendingSubmission();
  const daysUntilExpiry = useDaysUntilExpiry();

  return useMemo(() => {
    // Check for pending payment first
    if (pendingSubmission?.status === 'pending') return 'payment_pending';

    // No subscription means free tier
    if (!subscription) return 'none';

    // Check subscription status
    if (subscription.status === 'expired') return 'expired';
    if (subscription.status === 'grace_period') return 'grace_period';

    // Check if expiring soon (within 7 days)
    if (daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0) return 'expiring_soon';

    return 'active';
  }, [subscription, pendingSubmission, daysUntilExpiry]);
};

// Feature check hooks - return stable callback references
export const useCanAccessCalendarMonth = () => {
  const { plan, subscription, userOverrides } = useSubscriptionStore(
    useShallow(state => ({
      plan: state.plan,
      subscription: state.subscription,
      userOverrides: state.userOverrides,
    }))
  );

  return useCallback((monthsFromNow: number): boolean => {
    // Active paid subscription = unlimited access
    if (subscription?.status === 'active' && plan?.name === 'premium') {
      return true;
    }

    // Check user-level override first (admin granted)
    if (userOverrides?.calendar_months_override !== null && userOverrides?.calendar_months_override !== undefined) {
      if (userOverrides.calendar_months_override === -1) return true;
      return Math.abs(monthsFromNow) <= userOverrides.calendar_months_override;
    }

    // No subscription or expired = no access beyond current month
    if (!subscription || subscription.status === 'expired') {
      return monthsFromNow === 0;
    }

    // In grace period, allow limited access
    if (subscription.status === 'grace_period') {
      return monthsFromNow >= -2 && monthsFromNow <= 2;
    }

    // No plan means free tier
    if (!plan) return monthsFromNow >= -2 && monthsFromNow <= 2;

    // Unlimited if plan has no limit
    if (plan.calendar_months_limit === null) return true;

    // Check against limit (negative for past, positive for future)
    return Math.abs(monthsFromNow) <= plan.calendar_months_limit;
  }, [plan, subscription, userOverrides]);
};

export const useCanExportReportMonth = () => {
  const { plan, subscription, userOverrides } = useSubscriptionStore(
    useShallow(state => ({
      plan: state.plan,
      subscription: state.subscription,
      userOverrides: state.userOverrides,
    }))
  );

  return useCallback((monthsBack: number): boolean => {
    // Active paid subscription = unlimited access
    if (subscription?.status === 'active' && plan?.name === 'premium') {
      return true;
    }

    // Check user-level override first (admin granted)
    if (userOverrides?.report_months_override !== null && userOverrides?.report_months_override !== undefined) {
      if (userOverrides.report_months_override === -1) return true;
      return monthsBack <= userOverrides.report_months_override;
    }

    // No subscription or expired = no export access
    if (!subscription || subscription.status === 'expired') {
      return monthsBack <= 1;
    }

    // In grace period, allow limited access
    if (subscription.status === 'grace_period') {
      return monthsBack <= 2;
    }

    // No plan means free tier
    if (!plan) return monthsBack <= 2;

    // Unlimited if plan has no limit
    if (plan.report_months_limit === null) return true;

    // Check against limit
    return monthsBack <= plan.report_months_limit;
  }, [plan, subscription, userOverrides]);
};

export const useCanAddProperty = () => {
  const { plan, userOverrides } = useSubscriptionStore(
    useShallow(state => ({
      plan: state.plan,
      userOverrides: state.userOverrides,
    }))
  );

  return useCallback((currentCount: number): boolean => {
    // User's property_limit (set by admin) takes precedence
    const limit = userOverrides?.property_limit ?? plan?.property_limit ?? 1;
    return currentCount < limit;
  }, [plan, userOverrides]);
};

// Action selectors - stable references (actions never change)
export const useSubscriptionActions = () => useSubscriptionStore(
  useShallow(state => ({
    fetchSubscription: state.fetchSubscription,
    fetchPlans: state.fetchPlans,
    fetchPaymentMethods: state.fetchPaymentMethods,
    checkPendingSubmission: state.checkPendingSubmission,
    submitPayment: state.submitPayment,
    clearError: state.clearError,
  }))
);
