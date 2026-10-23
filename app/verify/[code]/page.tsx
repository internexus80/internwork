'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { verifyCertificateByCode } from '@/lib/supabase/queries';
import { errorMessage } from '@/lib/errorMessage';

export default function PublicVerifyPage() {
  const params = useParams();
  const code = params.code as string;
  const [data, setData] = useState<Awaited<ReturnType<typeof verifyCertificateByCode>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    const fetchVerification = async () => {
      try {
        const res = await verifyCertificateByCode(code);
        setData(res);
        if (!res.valid) {
          setError('Certificate verification record not found.');
        }
      } catch (err: unknown) {
        setError(errorMessage(err, 'Certificate verification record not found.'));
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [code]);

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Logo href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to InternJourneys</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-8">
        
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-card">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Verifying credential against official records...</p>
          </div>
        ) : data?.valid ? (
          <div className="bg-white rounded-3xl border-2 border-emerald-100 shadow-2xl overflow-hidden">
            
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 sm:p-8 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Certificate Verified
              </h1>
              <p className="text-xs text-emerald-100 font-medium">
                This certificate was issued by InternJourneys AI Solutions and verified against the official records.
              </p>
            </div>

            {/* Credential Details */}
            <div className="p-6 sm:p-10 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Recipient</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">{data.student_name}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Certificate ID</span>
                  <p className="text-sm font-mono font-bold text-indigo-600 mt-0.5">{data.certificate_id}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Internship Track</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{data.domain}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Issue Date</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{data.issue_date}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Organization</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">InternJourneys AI Solutions</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mode</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">Virtual / Online</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-6 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Completion of all practical software projects verified.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Peer and automated code review benchmarks satisfied.</span>
                </div>
              </div>

              <div className="pt-4 text-center">
                <Link
                  href="/internships"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Explore InternJourneys Internships</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center space-y-4 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Certificate Verification Failed</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {error || (data?.status === 'revoked' ? 'Certificate Revoked' : <>Certificate Not Found. We could not find an active certificate record matching ID: <strong>{code}</strong>.</>)}
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
