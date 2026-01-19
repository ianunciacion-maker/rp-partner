'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  pendingPayments: number;
  monthlyRevenue: number;
}

interface PendingPayment {
  id: string;
  amount: number;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    premiumUsers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
  });
  const [recentPending, setRecentPending] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch premium users (active premium subscriptions)
      const { count: premiumUsers } = await supabase
        .from('subscriptions')
        .select('*, plan:subscription_plans!inner(*)', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('plan.name', 'premium');

      // Fetch pending payments
      const { count: pendingPayments, data: pendingData } = await supabase
        .from('payment_submissions')
        .select('*, user:users(full_name, email)', { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch monthly revenue (approved payments this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: revenueData } = await supabase
        .from('payment_submissions')
        .select('amount')
        .eq('status', 'approved')
        .gte('reviewed_at', startOfMonth.toISOString());

      const monthlyRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        pendingPayments: pendingPayments || 0,
        monthlyRevenue,
      });

      setRecentPending(pendingData || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Premium Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
          {stats.pendingPayments > 0 && (
            <Link
              href="/payments"
              className="mt-4 inline-block text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Review now →
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Payments */}
      {recentPending.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
            <Link
              href="/payments"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPending.map((payment) => (
              <Link
                key={payment.id}
                href={`/payments/${payment.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {payment.user?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500">{payment.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
