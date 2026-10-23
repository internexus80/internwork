'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Cpu,
  Database,
  Globe,
  LineChart,
  Palette,
  Shield,
  Terminal,
} from 'lucide-react';
import { getActiveDomains } from '@/lib/supabase/queries';
import { DomainRow } from '@/lib/supabase/types';

export const SimpleDomainsSection: React.FC = () => {
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const iconMap = useMemo(
    () => ({
      cloud: <Globe className="w-6 h-6" />,
      code: <Code2 className="w-6 h-6" />,
      coffee: <Terminal className="w-6 h-6" />,
      cpu: <Cpu className="w-6 h-6" />,
      database: <Database className="w-6 h-6" />,
      globe: <Globe className="w-6 h-6" />,
      image: <Palette className="w-6 h-6" />,
      palette: <Palette className="w-6 h-6" />,
      shield: <Shield className="w-6 h-6" />,
      smartphone: <Code2 className="w-6 h-6" />,
      sparkles: <Cpu className="w-6 h-6" />,
      terminal: <Terminal className="w-6 h-6" />,
      chart: <LineChart className="w-6 h-6" />,
    }),
    []
  );

  const borderColorMap: Record<string, string> = {
    amber: 'border-t-amber-500',
    blue: 'border-t-blue-500',
    cyan: 'border-t-cyan-500',
    emerald: 'border-t-emerald-500',
    fuchsia: 'border-t-fuchsia-500',
    indigo: 'border-t-indigo-500',
    pink: 'border-t-pink-500',
    purple: 'border-t-purple-500',
    rose: 'border-t-rose-500',
    sky: 'border-t-sky-500',
    teal: 'border-t-teal-500',
  };

  const iconColorMap: Record<string, string> = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    fuchsia: 'bg-fuchsia-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    teal: 'bg-teal-500',
  };

  useEffect(() => {
    getActiveDomains()
      .then(setDomains)
      .catch((err) => setError(err.message || 'Could not load internship domains.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="domains" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-[#1D61FF] tracking-wider uppercase border border-blue-100">
            INTERNSHIP TRACKS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Career Path
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Select a structured virtual internship and build practical project experience through guided tasks.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500">
            Loading internship tracks...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && domains.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500">
            No active internship domains are available right now.
          </div>
        )}

        {!loading && !error && domains.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {domains.map((domain) => {
              const borderColor = borderColorMap[domain.color || 'blue'] || borderColorMap.blue;
              const iconBg = iconColorMap[domain.color || 'blue'] || iconColorMap.blue;

              return (
                <Link
                  key={domain.id}
                  href={`/domains/${domain.slug}`}
                  className={`bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 border-t-4 ${borderColor} flex flex-col justify-between space-y-5 group hover:-translate-y-1`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      {iconMap[domain.icon as keyof typeof iconMap] || iconMap.code}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#1D61FF] transition-colors leading-snug">
                      {domain.name}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {domain.short_description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {domain.domain_skills?.slice(0, 3).map((skill) => (
                        <span key={skill.id} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                          {skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 text-xs font-extrabold text-[#1D61FF]">
                    <span>{domain.duration_label || `${domain.duration_weeks} Weeks`} · {domain.tasks?.length || 0} Tasks</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Apply Free <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="pt-4 flex justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#1D61FF] hover:bg-[#1550d0] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Apply for Your Domain Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
