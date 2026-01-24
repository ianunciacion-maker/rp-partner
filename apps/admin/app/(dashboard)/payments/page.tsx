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
          user:users!payment_submissions_user_id_fkey(id, full_name, email),
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
    pending: 'bg-warning/20 text-warning',
    approved: 'bg-success/20 text-success',
    rejected: 'bg-error/20 text-error',
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment Submissions</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              statusFilter === status
                ? 'bg-teal text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {statusFilter === 'all' ? '' : statusFilter} payments found
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/payments/${payment.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {payment.user?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{payment.user?.email}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0',
                        statusColors[payment.status]
                      )}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
                      <span className="text-gray-500 ml-2">
                        {payment.months_purchased} {payment.months_purchased === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                    <span className="text-gray-500">{formatDateTime(payment.created_at)}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {payment.payment_method?.display_name || 'Unknown'}
                    {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden lg:table w-full">
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
                        className="text-teal hover:opacity-80 font-medium text-sm"
                      >
                        {payment.status === 'pending' ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
