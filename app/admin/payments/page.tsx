'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  IndianRupee,
  Search,
  Check,
  RotateCcw,
  Clock3,
  XCircle,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminPayment } from '@/lib/types';
import { getAdminPayments, updatePaymentStatus } from '@/lib/supabase/queries';
import { errorMessage } from '@/lib/errorMessage';

type PaymentFilter = 'All' | AdminPayment['status'];

const statusStyles: Record<AdminPayment['status'], string> = {
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Failed: 'bg-rose-100 text-rose-700 border-rose-200',
  Refunded: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const data = await getAdminPayments();
      if (Array.isArray(data)) setPayments(data);
    } catch (err: unknown) {
      console.error('Could not fetch admin payments from Supabase:', err);
      setError(errorMessage(err, 'Could not load payments.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.internId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateStatus = async (id: string, status: AdminPayment['status']) => {
    setSavingId(id);
    try {
      await updatePaymentStatus(id, status);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (err: unknown) {
      console.error('API update payment notice:', err);
      alert(errorMessage(err, `Could not update payment status to ${status}.`));
    } finally {
      setSavingId(null);
    }
  };

  const completedSum = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingSum = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = payments.length;
  const pendingPayments = payments.filter((p) => p.status === 'Pending').length;

  const filters: PaymentFilter[] = ['All', 'Completed', 'Pending', 'Failed', 'Refunded'];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={CreditCard}
        badge="Financial Management"
        title="Payments"
        subtitle="View and manage all platform payments and transaction records."
        action={
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, ID or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-900 outline-none transition-all"
            />
          </div>
        }
      />

      {/* Payment summary */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 inline-flex">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-emerald-600">₹{completedSum.toLocaleString('en-IN')}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Collected Revenue</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 inline-flex">
            <Clock3 className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-amber-600">₹{pendingSum.toLocaleString('en-IN')}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Outstanding</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 inline-flex">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-indigo-600">{totalTransactions}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Total Transactions</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 inline-flex">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{pendingPayments}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Pending Payments</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div role="region" aria-label="Payment records table; scroll horizontally to view all columns" tabIndex={0} className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Purpose</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Transaction</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{p.studentName}</p>
                      <p className="text-[11px] font-mono text-slate-500 font-medium">{p.internId}</p>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-xs font-semibold text-slate-700 max-w-[220px]">{p.purpose}</td>
                  <td className="py-3.5 pr-4 text-xs text-slate-500 whitespace-nowrap">{p.date}</td>
                  <td className="py-3.5 pr-4 text-sm font-extrabold text-slate-900">₹{p.amount}</td>
                  <td className="py-3.5 pr-4 text-xs font-mono text-slate-500">{p.transactionId ?? '—'}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(p.status === 'Pending' || p.status === 'Failed') && p.purpose !== 'Certificate fee' && (
                        <button
                          onClick={() => updateStatus(p.id, 'Completed')}
                          disabled={savingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {savingId === p.id ? 'Saving...' : 'Mark Paid'}
                        </button>
                      )}
                      {(p.status === 'Pending' || p.status === 'Failed') && p.purpose === 'Certificate fee' && (
                        <span className="text-xs font-medium text-slate-500">Awaiting provider verification</span>
                      )}
                      {p.status === 'Completed' && (
                        <button
                          onClick={() => updateStatus(p.id, 'Refunded')}
                          disabled={savingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Refund
                        </button>
                      )}
                      {p.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus(p.id, 'Failed')}
                          disabled={savingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Mark Failed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs font-medium text-slate-400">
                    {loading ? 'Loading payments…' : error ? 'Could not load payments.' : 'No payments match your filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
