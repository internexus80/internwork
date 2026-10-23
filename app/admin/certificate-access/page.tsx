'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, LockKeyhole, Search, ShieldCheck, UnlockKeyhole } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { AdminCertificateAccess } from '@/lib/types';
import { getAdminCertificateAccess, setAdminCertificateAccess } from '@/lib/supabase/queries';

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function accessErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    const details = error as { code?: unknown; message?: unknown };
    const message = typeof details.message === 'string' ? details.message : '';
    if (details.code === 'PGRST202' || message.includes('admin_certificate_access_overview')) {
      return 'Certificate access database setup is missing. Apply the latest Supabase migration, then reload this page.';
    }
    if (message) return message;
  }
  return 'Could not load certificate access details.';
}

export default function AdminCertificateAccessPage() {
  const [students, setStudents] = useState<AdminCertificateAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchAccess = async () => {
    try {
      const rows = await getAdminCertificateAccess();
      setStudents(rows);
      setError('');
    } catch (fetchError) {
      setError(accessErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      student.student_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.domain_name.toLowerCase().includes(query)
    );
  }, [searchQuery, students]);

  const paidCount = students.filter((student) => student.payment_completed).length;
  const unlockedCount = students.filter((student) => student.access_unlocked).length;
  const overrideCount = students.filter((student) => student.admin_override).length;

  const toggleOverride = async (student: AdminCertificateAccess) => {
    const enabled = !student.admin_override;
    setSavingId(student.student_id);
    try {
      await setAdminCertificateAccess(student.student_id, enabled, overrideNote);
      await fetchAccess();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update certificate access.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={ShieldCheck}
        badge="Certificate Controls"
        title="Certificate Access"
        subtitle="Review payment and task eligibility, then grant or remove an audited admin override."
        action={(
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search students, email, domain..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        )}
      />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {(!error || students.length > 0) && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase text-slate-500">Certificate payments complete</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700">{paidCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase text-slate-500">Access currently unlocked</p>
          <p className="mt-2 text-2xl font-extrabold text-indigo-700">{unlockedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase text-slate-500">Admin overrides active</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-700">{overrideCount}</p>
        </div>
      </div>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="override-note" className="text-sm font-bold text-slate-700">Override reason</label>
        <input
          id="override-note"
          value={overrideNote}
          onChange={(event) => setOverrideNote(event.target.value)}
          placeholder="Optional audit note"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div role="region" aria-label="Certificate access table; scroll horizontally to view all columns" tabIndex={0} className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="px-5 py-3">Student / Domain</th>
                <th className="px-5 py-3">Tasks</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Certificate</th>
                <th className="px-5 py-3 text-right">Admin control</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.student_id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{student.student_name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{student.email}</p>
                    <p className="mt-1 text-xs font-semibold text-indigo-700">{student.domain_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-bold ${student.tasks_complete ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {student.verified_task_count} / {student.required_task_count} verified
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{student.enrollment_status || 'No enrollment'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-sm font-bold ${student.payment_completed ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {student.payment_completed ? 'Paid' : student.payment_status}
                      {student.payment_amount !== null && ` · ₹${student.payment_amount}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(student.paid_at || student.payment_created_at)}</p>
                    {student.payment_provider && <p className="mt-1 text-[11px] capitalize text-slate-500">Provider: {student.payment_provider}</p>}
                    <p className="mt-1 max-w-[220px] break-all text-[11px] text-slate-500">
                      {student.provider_payment_id || student.provider_order_id || 'No transaction recorded'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {student.access_unlocked ? <BadgeCheck className="h-4 w-4 text-emerald-600" /> : <LockKeyhole className="h-4 w-4 text-amber-600" />}
                      <span className={`text-sm font-bold ${student.access_unlocked ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {student.access_unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Record: {student.certificate_status || 'Not issued'}</p>
                    {student.admin_override && (
                      <p className="mt-1 text-xs text-indigo-700">
                        Override since {formatDateTime(student.override_granted_at)}
                        {student.override_note && <span className="block text-slate-500">{student.override_note}</span>}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleOverride(student)}
                      disabled={savingId === student.student_id || (student.certificate_status === 'REVOKED' && !student.admin_override)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50 ${student.admin_override ? 'bg-slate-700 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {student.admin_override ? <LockKeyhole className="h-3.5 w-3.5" /> : <UnlockKeyhole className="h-3.5 w-3.5" />}
                      <span>{savingId === student.student_id ? 'Saving...' : student.admin_override ? 'Remove override' : 'Grant access'}</span>
                    </button>
                    {!student.admin_override && !student.access_unlocked && (
                      <p className="mt-2 max-w-48 text-right text-[11px] text-slate-500">Bypasses payment and task requirements.</p>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredStudents.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                    {loading
                      ? 'Loading student access...'
                      : error
                        ? 'Student access records are unavailable.'
                        : students.length === 0
                          ? 'No student accounts found.'
                          : 'No students match this search.'}
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