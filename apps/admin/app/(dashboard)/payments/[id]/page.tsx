'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PaymentDetail {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  months_purchased: number;
  reference_number: string | null;
  screenshot_url: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    subscription_status: string;
  };
  payment_method: {
    display_name: string;
    name: string;
  };
  reviewed_by_user?: {
    full_name: string;
  };
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPayment(params.id as string);
    }
  }, [params.id]);

  const fetchPayment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_submissions')
        .select(`
          *,
          user:users(id, full_name, email, subscription_status),
          payment_method:payment_methods(display_name, name),
          reviewed_by_user:users!payment_submissions_reviewed_by_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (err) {
      console.error('Error fetching payment:', err);
      router.push('/payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!payment) return;

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Update payment submission
      const { error: updateError } = await supabase
        .from('payment_submissions')
        .update({
          status: 'approved',
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Get the premium plan
      const { data: premiumPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'premium')
        .single();

      if (planError) throw planError;

      // Calculate subscription period
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + payment.months_purchased);

      // Check for existing active subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', payment.user_id)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        // Extend existing subscription
        const currentEnd = new Date(existingSub.current_period_end);
        const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()));
        newEnd.setMonth(newEnd.getMonth() + payment.months_purchased);

        const { error: extendError } = await supabase
          .from('subscriptions')
          .update({
            plan_id: premiumPlan.id,
            current_period_end: newEnd.toISOString(),
            grace_period_end: null,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id);

        if (extendError) throw extendError;

        // Link submission to subscription
        await supabase
          .from('payment_submissions')
          .update({ subscription_id: existingSub.id })
          .eq('id', payment.id);
      } else {
        // Create new subscription
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: payment.user_id,
            plan_id: premiumPlan.id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        // Link submission to subscription
        await supabase
          .from('payment_submissions')
          .update({ subscription_id: newSub.id })
          .eq('id', payment.id);
      }

      // Update user's subscription status
      await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_expires_at: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.user_id);

      router.push('/payments');
    } catch (err: any) {
      console.error('Error approving payment:', err);
      alert('Failed to approve payment: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payment || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payment_submissions')
        .update({
          status: 'rejected',
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', payment.id);

      if (error) throw error;

      router.push('/payments');
    } catch (err: any) {
      console.error('Error rejecting payment:', err);
      alert('Failed to reject payment: ' + err.message);
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Payment not found</p>
      </div>
    );
  }

  const screenshotUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-screenshots/${payment.screenshot_url}`;

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/payments" className="text-teal-600 hover:text-teal-700 mb-4 inline-block">
        ← Back to Payments
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Payment Review</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Screenshot */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Screenshot</h2>
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={screenshotUrl}
              alt="Payment screenshot"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium',
              payment.status === 'pending' && 'bg-yellow-100 text-yellow-800',
              payment.status === 'approved' && 'bg-green-100 text-green-800',
              payment.status === 'rejected' && 'bg-red-100 text-red-800'
            )}
          >
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(payment.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Duration</dt>
                <dd className="text-gray-900">
                  {payment.months_purchased} {payment.months_purchased === 1 ? 'month' : 'months'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Method</dt>
                <dd className="text-gray-900">{payment.payment_method?.display_name}</dd>
              </div>
              {payment.reference_number && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reference #</dt>
                  <dd className="text-gray-900">{payment.reference_number}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">{formatDateTime(payment.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">{payment.user?.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{payment.user?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Current Status</dt>
                <dd className="text-gray-900">{payment.user?.subscription_status}</dd>
              </div>
            </dl>
            <Link
              href={`/users/${payment.user?.id}`}
              className="mt-4 text-teal-600 hover:text-teal-700 text-sm font-medium inline-block"
            >
              View User Profile →
            </Link>
          </div>

          {/* Review Info (if already reviewed) */}
          {payment.reviewed_at && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Details</h2>
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reviewed by</dt>
                  <dd className="text-gray-900">
                    {payment.reviewed_by_user?.full_name || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Reviewed at</dt>
                  <dd className="text-gray-900">{formatDateTime(payment.reviewed_at)}</dd>
                </div>
                {payment.rejection_reason && (
                  <div>
                    <dt className="text-gray-500 mb-1">Rejection Reason</dt>
                    <dd className="text-red-600 bg-red-50 p-3 rounded-lg">
                      {payment.rejection_reason}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Action Buttons (only for pending) */}
          {payment.status === 'pending' && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Approve Payment'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Payment</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this payment. The user will see this message.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
