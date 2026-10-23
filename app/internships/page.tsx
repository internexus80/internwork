'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { getActiveDomains } from '@/lib/supabase/queries';
import { DomainRow } from '@/lib/supabase/types';
import { ArrowRight, Award, Clock, Search, Signal, Sparkles } from 'lucide-react';

export default function InternshipsPage() {
  const [search, setSearch] = useState('');
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getActiveDomains()
      .then(setDomains)
      .catch((err) => setError(err.message || 'Could not load internship domains.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return domains;

    return domains.filter((domain) =>
      [
        domain.name,
        domain.short_description,
        domain.description,
        domain.level,
        ...(domain.domain_skills || []).map((skill) => skill.skill_name),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [domains, search]);

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo href="/" />
          <Link
            href="/login"
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-gradient-to-br from-[#0F0E38] via-[#17164B] to-[#1E1B4B] text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Virtual Internship Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find Your Virtual Internship
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
            Choose a structured virtual internship, build project work and follow a guided task roadmap.
          </p>

          <div className="relative max-w-xl pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-5" />
            <label htmlFor="internship-search" className="sr-only">Search by role, skill, or domain</label>
            <input
              id="internship-search"
              type="text"
              placeholder="Search by role, skill, or domain..."
              aria-label="Search by role, skill, or domain"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-xs font-semibold outline-none shadow-md"
            />
          </div>
        </div>

        {loading && (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-sm font-semibold text-slate-500">
            Loading internships...
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-50 p-10 rounded-3xl border border-rose-200 text-center text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-sm font-semibold text-slate-500">
            No active internships match your search.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {domain.level}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900">{domain.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{domain.short_description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {domain.domain_skills?.slice(0, 3).map((skill) => (
                      <span key={skill.id} className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 mx-auto mb-1" />
                      <p className="font-bold text-slate-800">{domain.duration_label || `${domain.duration_weeks} Weeks`}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <Signal className="w-3.5 h-3.5 text-indigo-600 mx-auto mb-1" />
                      <p className="font-bold text-slate-800">Virtual</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <Award className="w-3.5 h-3.5 text-indigo-600 mx-auto mb-1" />
                      <p className="font-bold text-slate-800">{domain.tasks?.length || 0} Tasks</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/domains/${domain.slug}`}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
