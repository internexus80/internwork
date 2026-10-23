'use client';

import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import { QuestLog } from '@/components/dashboard/QuestLog';
import { CompanyLogosMarquee } from '@/components/common/CompanyLogosMarquee';
import { Task, UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { getStudentTasks, submitStudentTask } from '@/lib/supabase/queries';
import { errorMessage } from '@/lib/errorMessage';

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(authUser);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasPendingVerification = tasks.some((task) =>
      task.internshipStatus === 'VERIFICATION_PENDING' || task.internshipStatus === 'SUBMITTED'
    );
    if (!hasPendingVerification) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchDashboardData();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, [tasks]);

  const fetchDashboardData = async () => {
    try {
      const liveTasks = await getStudentTasks();
      setTasks(liveTasks);
      setLoadError('');
    } catch (err: unknown) {
      console.warn('Dashboard Supabase fetch error:', err);
      setLoadError(errorMessage(err, 'Could not load your dashboard tasks.'));
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (taskId: string, submissionUrl: string) => {
    try {
      await submitStudentTask(taskId, { url: submissionUrl });
      await fetchDashboardData();
    } catch (err: unknown) {
      console.error('Task submission error:', err);
      setLoadError(errorMessage(err, 'Could not submit this task.'));
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      {/* Signed-in Top Dashboard Navbar */}
      <DashboardNavbar />

      {/* Main Student Workspace Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* 1. Student Welcome Hero Card (Offer Letter & Intern ID) */}
        {user && <WelcomeHero user={user} />}

        {/* 2. Quest Log Header & Task Cards Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#1d61ff] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading your internship tasks...</p>
          </div>
        ) : loadError && tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <p className="text-xs font-semibold text-slate-600">{loadError}</p>
            <button
              onClick={fetchDashboardData}
              className="px-5 py-2.5 rounded-full bg-[#1d61ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <QuestLog tasks={tasks} onTaskSubmit={handleTaskSubmit} />
        )}

        {/* 3. Partner Logos Section */}
        <div className="pt-6">
          <CompanyLogosMarquee />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>© 2026 InternJourneys. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="/help" className="hover:text-[#1d61ff]">Help Center</a>
            <a href="#" className="hover:text-[#1d61ff]">Privacy Policy</a>
            <a href="#" className="hover:text-[#1d61ff]">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
