'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  FileCheck2,
  IndianRupee,
  Clock3,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { getAdminPlatformStats } from '@/lib/supabase/queries';
import type { PlatformStats } from '@/lib/types';
import { errorMessage } from '@/lib/errorMessage';

const emptyStats: PlatformStats = {
  totalStudents: 0,
  activeInterns: 0,
  completedInterns: 0,
  pendingApplications: 0,
  totalApplications: 0,
  totalRevenue: 0,
  pendingRevenue: 0,
  completedPayments: 0,
  pendingPayments: 0,
  issuedCertificates: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const data = await getAdminPlatformStats();
        if (data) setStats({ ...emptyStats, ...data });
      } catch (err: unknown) {
        console.error('Failed to load admin stats:', err);
        setError(errorMessage(err, 'Could not load dashboard statistics.'));
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={LayoutDashboard}
        badge="Platform Overview"
        title="Admin Dashboard"
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">
          Loading live platform statistics…
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} accent="indigo" />
        <StatCard icon={UserCheck} label="Active Interns" value={stats.activeInterns} accent="sky" />
        <StatCard icon={GraduationCap} label="Completed Interns" value={stats.completedInterns} accent="emerald" />
        <StatCard icon={FileCheck2} label="Pending Applications" value={stats.pendingApplications} accent="amber" />
      </div>

      {/* Revenue + More stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} accent="indigo" sub={`₹${stats.pendingRevenue.toLocaleString('en-IN')} pending`} />
        <StatCard icon={Clock3} label="Pending Payments" value={stats.pendingPayments} accent="amber" />
        <StatCard icon={BadgeCheck} label="Certificates Issued" value={stats.issuedCertificates} accent="emerald" />
        <StatCard icon={TrendingUp} label="Total Applications" value={stats.totalApplications} accent="sky" />
      </div>

    </div>
  );
}
