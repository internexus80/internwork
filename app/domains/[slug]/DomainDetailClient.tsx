'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { createInternshipEnrollment } from '@/lib/supabase/queries';
import type { DomainRow } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, CheckCircle2, Clock, Loader2, Signal } from 'lucide-react';
import { errorMessage } from '@/lib/errorMessage';

export default function DomainDetailClient({ domain }: { domain: DomainRow }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const startInternship = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push(`/login?domain=${encodeURIComponent(domain.slug)}`);
      return;
    }

    setStarting(true);
    setError('');
    try {
      await createInternshipEnrollment(domain.id);
      router.push('/dashboard/tasks');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Could not start this internship.'));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo href="/" />
          <Link href="/internships" className="text-xs font-bold text-indigo-600 hover:underline">
            Browse all internships
          </Link>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Signal className="w-3.5 h-3.5" />
                {domain.level} · Virtual Internship
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {domain.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {domain.description}
              </p>
            </div>
            <button
              onClick={startInternship}
              disabled={starting}
              className="inline-flex min-h-11 items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md disabled:opacity-60"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Start Internship Free
            </button>
          </div>

          {error && (
            <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <Clock className="w-4 h-4 text-indigo-600 mb-2" />
              <p className="text-[11px] uppercase font-bold text-slate-400">Duration</p>
              <p className="text-sm font-extrabold text-slate-900">{domain.duration_label || `${domain.duration_weeks} Weeks`}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 mb-2" />
              <p className="text-[11px] uppercase font-bold text-slate-400">Tasks</p>
              <p className="text-sm font-extrabold text-slate-900">{domain.tasks?.length || 0} Practical Tasks</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <Signal className="w-4 h-4 text-indigo-600 mb-2" />
              <p className="text-[11px] uppercase font-bold text-slate-400">Credential</p>
              <p className="text-sm font-extrabold text-slate-900">Verified Certificate</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Skills You Build</h2>
            <div className="flex flex-wrap gap-2">
              {domain.domain_skills?.map((skill) => (
                <span key={skill.id} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  {skill.skill_name}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-card space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900">Task Roadmap</h2>
            <div className="space-y-3">
              {domain.tasks?.map((task) => (
                <div key={task.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                    {task.task_number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{task.short_description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
