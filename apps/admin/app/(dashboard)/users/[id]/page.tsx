'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UserDetail {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  property_limit: number;
  calendar_months_override: number | null;
  report_months_override: number | null;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  property_limit: number;
  calendar_months_limit: number | null;
  report_months_limit: number | null;
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan_id: string;
  plan: {
    name: string;
    display_name: string;
    price_monthly: number;
  };
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: {
    display_name: string;
  };
}

interface Property {
  id: string;
  name: string;
  city: string | null;
  is_active: boolean;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [featureAccessChanges, setFeatureAccessChanges] = useState<{
    calendar_months_override: number | null;
    report_months_override: number | null;
  } | null>(null);
  const [subscriptionChanges, setSubscriptionChanges] = useState<{
    plan_id: string;
    status: string;
  } | null>(null);
  const [accountChanges, setAccountChanges] = useState<{
    role: string;
    property_limit: number;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<{ section: string; message: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchPlans();
    if (params.id) {
      fetchUserData(params.id as string);
    }
  }, [params.id]);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');
    setPlans(data || []);
  };

  const fetchUserData = async (id: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;
      setUser(userData);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('id, status, current_period_start, current_period_end, plan_id, plan:subscription_plans(name, display_name, price_monthly)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData) {
        setSubscription({
          ...subData,
          plan: Array.isArray(subData.plan) ? subData.plan[0] : subData.plan,
        } as Subscription);
      }

      const { data: paymentData } = await supabase
        .from('payment_submissions')
        .select('*, payment_method:payment_methods(display_name)')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPayments(paymentData || []);

      const { data: propData } = await supabase
        .from('properties')
        .select('id, name, city, is_active')
        .eq('user_id', id);

      setProperties(propData || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      router.push('/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (field: 'role' | 'property_limit', value: string | number) => {
    if (!user) return;
    setSaveSuccess(null);
    setAccountChanges(prev => ({
      role: prev?.role ?? user.role,
      property_limit: prev?.property_limit ?? user.property_limit,
      [field]: value,
    }));
  };

  const handleSaveAccount = async () => {
    if (!user || !accountChanges) return;

    setIsUpdating(true);
    setSaveSuccess(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: accountChanges.role,
          property_limit: accountChanges.property_limit,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        role: accountChanges.role,
        property_limit: accountChanges.property_limit,
      });
      setAccountChanges(null);
      setSaveSuccess({ section: 'account', message: 'Account settings saved successfully!' });
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert('Failed to save account settings: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDiscardAccount = () => {
    setAccountChanges(null);
    setSaveSuccess(null);
  };

  const handleManualSubscription = async (months: number) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: premiumPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'premium')
        .single();

      if (planError) throw planError;

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + months);

      if (subscription) {
        const currentEnd = new Date(subscription.current_period_end);
        const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()));
        newEnd.setMonth(newEnd.getMonth() + months);

        await supabase
          .from('subscriptions')
          .update({
            plan_id: premiumPlan.id,
            current_period_end: newEnd.toISOString(),
            status: 'active',
          })
          .eq('id', subscription.id);
      } else {
        await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan_id: premiumPlan.id,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
      }

      await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_expires_at: periodEnd.toISOString(),
        })
        .eq('id', user.id);

      fetchUserData(user.id);
    } catch (err: any) {
      alert('Failed to update subscription: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionChange = (field: 'plan_id' | 'status', value: string) => {
    if (!subscription) return;
    setSaveSuccess(null);
    setSubscriptionChanges(prev => ({
      plan_id: prev?.plan_id ?? subscription.plan_id,
      status: prev?.status ?? subscription.status,
      [field]: value,
    }));
  };

  const handleSaveSubscription = async () => {
    if (!user || !subscription || !subscriptionChanges) return;

    setIsUpdating(true);
    setSaveSuccess(null);
    try {
      const selectedPlan = plans.find(p => p.id === subscriptionChanges.plan_id);
      if (!selectedPlan) throw new Error('Plan not found');

      const now = new Date();
      const isFree = selectedPlan.name === 'free';
      const planChanged = subscriptionChanges.plan_id !== subscription.plan_id;

      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: subscriptionChanges.plan_id,
          status: subscriptionChanges.status,
          ...(planChanged && {
            current_period_start: now.toISOString(),
            current_period_end: isFree
              ? new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
              : subscription.current_period_end,
          }),
        })
        .eq('id', subscription.id);

      if (subError) throw subError;

      const userUpdate: Record<string, any> = {
        subscription_status: subscriptionChanges.status === 'cancelled' ? 'cancelled' : (isFree ? 'free' : subscriptionChanges.status),
      };
      if (planChanged) {
        userUpdate.property_limit = selectedPlan.property_limit;
        userUpdate.subscription_expires_at = isFree ? null : subscription.current_period_end;
      }

      await supabase.from('users').update(userUpdate).eq('id', user.id);

      setSubscriptionChanges(null);
      setSaveSuccess({ section: 'subscription', message: 'Subscription settings saved successfully!' });
      setTimeout(() => setSaveSuccess(null), 3000);
      fetchUserData(user.id);
    } catch (err: any) {
      alert('Failed to save subscription: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDiscardSubscription = () => {
    setSubscriptionChanges(null);
    setSaveSuccess(null);
  };

  const handleFeatureAccessChange = (field: 'calendar_months_override' | 'report_months_override', value: number | null) => {
    if (!user) return;
    setSaveSuccess(null);

    setFeatureAccessChanges(prev => ({
      calendar_months_override: prev?.calendar_months_override ?? user.calendar_months_override,
      report_months_override: prev?.report_months_override ?? user.report_months_override,
      [field]: value,
    }));
  };

  const handleSaveFeatureAccess = async () => {
    if (!user || !featureAccessChanges) return;

    setIsUpdating(true);
    setSaveSuccess(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          calendar_months_override: featureAccessChanges.calendar_months_override,
          report_months_override: featureAccessChanges.report_months_override,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        calendar_months_override: featureAccessChanges.calendar_months_override,
        report_months_override: featureAccessChanges.report_months_override,
      });
      setFeatureAccessChanges(null);
      setSaveSuccess({ section: 'feature', message: 'Feature access settings saved successfully!' });

      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDiscardFeatureAccess = () => {
    setFeatureAccessChanges(null);
    setSaveSuccess(null);
  };

  const getCalendarOverrideValue = () => {
    if (featureAccessChanges !== null) {
      return featureAccessChanges.calendar_months_override;
    }
    return user?.calendar_months_override ?? null;
  };
  const getReportOverrideValue = () => {
    if (featureAccessChanges !== null) {
      return featureAccessChanges.report_months_override;
    }
    return user?.report_months_override ?? null;
  };
  const hasFeatureAccessChanges = featureAccessChanges !== null;

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-8 text-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const getCurrentPlanId = () => subscriptionChanges?.plan_id ?? subscription?.plan_id ?? '';
  const getCurrentStatus = () => subscriptionChanges?.status ?? subscription?.status ?? '';
  const hasSubscriptionChanges = subscriptionChanges !== null;

  const getCurrentRole = () => accountChanges?.role ?? user.role;
  const getCurrentPropertyLimit = () => accountChanges?.property_limit ?? user.property_limit;
  const hasAccountChanges = accountChanges !== null;

  const getSubscriptionDuration = () => {
    if (!subscription) return null;
    const plan = plans.find(p => p.id === subscription.plan_id);
    if (plan?.name === 'free') return 'Unlimited (Free Plan)';

    const now = new Date();
    const end = new Date(subscription.current_period_end);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return `${months} month${months > 1 ? 's' : ''}${days > 0 ? `, ${days} day${days > 1 ? 's' : ''}` : ''} remaining`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
  };

  const statusColors: Record<string, string> = {
    active: 'bg-success/20 text-success',
    trial: 'bg-info/20 text-info',
    expired: 'bg-error/20 text-error',
    grace_period: 'bg-warning/20 text-warning',
    free: 'bg-gray-100 text-gray-600',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    approved: 'bg-success/20 text-success',
    rejected: 'bg-error/20 text-error',
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <Link href="/users" className="text-teal hover:opacity-80 mb-4 inline-block font-medium">
        ← Back to Users
      </Link>

      <div className="bg-white rounded-xl shadow-card p-4 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-teal">
                {user.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
              <p className="text-gray-500">{user.email}</p>
              {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                statusColors[user.subscription_status] || 'bg-gray-100 text-gray-600'
              )}
            >
              {user.subscription_status}
            </span>
            {user.role === 'admin' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className={cn(
          "bg-white rounded-xl shadow-card border p-4 lg:p-6",
          hasSubscriptionChanges ? "border-amber-300 ring-1 ring-amber-200" : "border-transparent"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            {hasSubscriptionChanges && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          {saveSuccess?.section === 'subscription' && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-success">{saveSuccess.message}</span>
            </div>
          )}

          {subscription ? (
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Plan</dt>
                <dd>
                  <select
                    value={getCurrentPlanId()}
                    onChange={(e) => handleSubscriptionChange('plan_id', e.target.value)}
                    disabled={isUpdating}
                    className={cn(
                      "px-3 py-2 border rounded-lg text-sm font-medium min-h-[44px] bg-white",
                      subscriptionChanges?.plan_id && subscriptionChanges.plan_id !== subscription.plan_id
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200"
                    )}
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.display_name} ({plan.name === 'free' ? 'Free' : `₱${plan.price_monthly}/mo`})
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <select
                    value={getCurrentStatus()}
                    onChange={(e) => handleSubscriptionChange('status', e.target.value)}
                    disabled={isUpdating}
                    className={cn(
                      'px-3 py-2 border rounded-lg text-sm font-medium min-h-[44px] bg-white',
                      subscriptionChanges?.status && subscriptionChanges.status !== subscription.status
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200"
                    )}
                  >
                    <option value="active">Active</option>
                    <option value="grace_period">Grace Period</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Started</dt>
                <dd className="text-gray-900">{formatDate(subscription.current_period_start)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Expires</dt>
                <dd className="text-gray-900">
                  {subscription.plan?.name === 'free' ? 'Never' : formatDate(subscription.current_period_end)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Time Remaining</dt>
                <dd className={cn(
                  "font-medium",
                  isMounted && getSubscriptionDuration()?.includes('Expired') ? 'text-error' : 'text-teal'
                )}>
                  {isMounted ? getSubscriptionDuration() : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-500">No active subscription</p>
          )}

          {hasSubscriptionChanges && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSaveSubscription}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-teal text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleDiscardSubscription}
                disabled={isUpdating}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm min-h-[44px]"
              >
                Discard
              </button>
            </div>
          )}

          <div className={cn("mt-4 pt-4 border-t border-gray-100", hasSubscriptionChanges && "mt-0")}>
            <p className="text-sm text-gray-500 mb-2">Add Premium Time</p>
            <div className="flex gap-2 flex-wrap">
              {[1, 3, 6, 12].map((months) => (
                <button
                  key={months}
                  onClick={() => handleManualSubscription(months)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm bg-teal text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium min-h-[44px]"
                >
                  +{months} month{months > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Adding time will set the plan to Premium and extend the expiration date.
            </p>
          </div>
        </div>

        <div className={cn(
          "bg-white rounded-xl shadow-card border p-4 lg:p-6",
          hasAccountChanges ? "border-amber-300 ring-1 ring-amber-200" : "border-transparent"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            {hasAccountChanges && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          {saveSuccess?.section === 'account' && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-success">{saveSuccess.message}</span>
            </div>
          )}

          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Role</dt>
              <dd>
                <select
                  value={getCurrentRole()}
                  onChange={(e) => handleAccountChange('role', e.target.value)}
                  disabled={isUpdating}
                  className={cn(
                    'px-3 py-2 border rounded-lg text-sm font-medium min-h-[44px] bg-white',
                    accountChanges?.role && accountChanges.role !== user.role
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200"
                  )}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Property Limit</dt>
              <dd className="flex items-center gap-2">
                <select
                  value={getCurrentPropertyLimit()}
                  onChange={(e) => handleAccountChange('property_limit', parseInt(e.target.value))}
                  disabled={isUpdating}
                  className={cn(
                    "px-3 py-2 border rounded-lg text-sm min-h-[44px] bg-white",
                    accountChanges?.property_limit && accountChanges.property_limit !== user.property_limit
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200"
                  )}
                >
                  {[1, 2, 3, 5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'property' : 'properties'}
                    </option>
                  ))}
                </select>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Member Since</dt>
              <dd className="text-gray-900">{formatDate(user.created_at)}</dd>
            </div>
          </dl>

          {hasAccountChanges && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSaveAccount}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-teal text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleDiscardAccount}
                disabled={isUpdating}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm min-h-[44px]"
              >
                Discard
              </button>
            </div>
          )}

          <div className={cn("mt-4 pt-4 border-t border-gray-100", hasAccountChanges && "mt-0 pt-0 border-t-0")}>
            <p className="text-xs text-gray-400">
              Property limit is automatically updated when changing plans, but can be manually overridden.
            </p>
          </div>
        </div>

        <div className={cn(
          "bg-white rounded-xl shadow-card border p-4 lg:p-6",
          hasFeatureAccessChanges ? "border-amber-300 ring-1 ring-amber-200" : "border-transparent"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Feature Access</h2>
            {hasFeatureAccessChanges && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Override default plan limits. Paid subscribers automatically get unlimited access.
          </p>

          {saveSuccess?.section === 'feature' && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-success">{saveSuccess.message}</span>
            </div>
          )}

          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Calendar History</dt>
              <dd>
                <select
                  value={getCalendarOverrideValue() === null ? 'default' : getCalendarOverrideValue()!.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleFeatureAccessChange('calendar_months_override', val === 'default' ? null : parseInt(val));
                  }}
                  disabled={isUpdating}
                  className={cn(
                    "px-3 py-2 border rounded-lg text-sm min-h-[44px] bg-white",
                    featureAccessChanges?.calendar_months_override !== undefined &&
                    featureAccessChanges.calendar_months_override !== user.calendar_months_override
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200"
                  )}
                >
                  <option value="default">Use plan default</option>
                  <option value="-1">Unlimited</option>
                  <option value="2">2 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500">Report Export</dt>
              <dd>
                <select
                  value={getReportOverrideValue() === null ? 'default' : getReportOverrideValue()!.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleFeatureAccessChange('report_months_override', val === 'default' ? null : parseInt(val));
                  }}
                  disabled={isUpdating}
                  className={cn(
                    "px-3 py-2 border rounded-lg text-sm min-h-[44px] bg-white",
                    featureAccessChanges?.report_months_override !== undefined &&
                    featureAccessChanges.report_months_override !== user.report_months_override
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200"
                  )}
                >
                  <option value="default">Use plan default</option>
                  <option value="-1">Unlimited</option>
                  <option value="2">2 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </dd>
            </div>
          </dl>

          {hasFeatureAccessChanges && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSaveFeatureAccess}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-teal text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleDiscardFeatureAccess}
                disabled={isUpdating}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium text-sm min-h-[44px]"
              >
                Discard
              </button>
            </div>
          )}

          <div className={cn("mt-4 pt-4 border-t border-gray-100", hasFeatureAccessChanges && "mt-0 pt-0 border-t-0")}>
            <p className="text-xs text-gray-400">
              These overrides apply to free users or for special cases. Active Premium subscribers always have unlimited access regardless of these settings.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Properties ({properties.length}/{user.property_limit})
          </h2>
          {properties.length === 0 ? (
            <p className="text-gray-500">No properties</p>
          ) : (
            <ul className="space-y-2">
              {properties.map((prop) => (
                <li
                  key={prop.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{prop.name}</p>
                    <p className="text-sm text-gray-500">{prop.city || 'No location'}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full font-medium',
                      prop.is_active ? 'bg-success/20 text-success' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {prop.is_active ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          {payments.length === 0 ? (
            <p className="text-gray-500">No payment history</p>
          ) : (
            <ul className="space-y-3">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {payment.payment_method?.display_name} • {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs rounded-full font-medium',
                      paymentStatusColors[payment.status]
                    )}
                  >
                    {payment.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
