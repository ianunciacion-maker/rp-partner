'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PaymentSubmission {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  months_purchased: number;
  reference_number: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  payment_method: {
    display_name: string;
  };
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payment_submissions')
        .select(`
          *,
          user:users(id, full_name, email),
          payment_method:payment_methods(display_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Submissions</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === status
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {statusFilter === 'all' ? '' : statusFilter} payments found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.user?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{payment.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {payment.months_purchased} {payment.months_purchased === 1 ? 'month' : 'months'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{payment.payment_method?.display_name || 'Unknown'}</p>
                    {payment.reference_number && (
                      <p className="text-sm text-gray-500">Ref: {payment.reference_number}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusColors[payment.status]
                      )}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/payments/${payment.id}`}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      {payment.status === 'pending' ? 'Review' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
