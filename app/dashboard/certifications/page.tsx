'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { CertificateData } from '@/lib/types';
import { Award, ShieldCheck, Download, AlertTriangle, Lock, Loader2, ArrowRight, IndianRupee, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';
import { issueCertificateForCurrentStudent } from '@/lib/supabase/queries';
import { certificateFileName, generateCertificate } from '@/utils/certificateGenerator';
import { certificateVerificationUrl } from '@/utils/certificateVerificationUrl';
import type { StudentCertificateAccess } from '@/lib/types';
import certificateTemplate from '@/assets/finalcert.png';

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export default function CertificationsPage() {
  const { user: authUser } = useAuth();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [access, setAccess] = useState<StudentCertificateAccess | null>(null);

  const fetchCertData = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Please sign in to view your certificate.');

      const result = await issueCertificateForCurrentStudent();
      setAccess(result);
      if (!result.eligible || !result.certificate) {
        setCertificate(null);
        setPreviewUrl('');
        setLoadError('');
        return;
      }

      const data = result.certificate;
      setCertificate({
        id: data.id,
        certId: data.certificate_id,
        studentName: data.student_name || authUser?.name || 'Student',
        program: `${data.domain_name || authUser?.domain || 'Internship'} Internship`,
        issueDate: data.issue_date || 'Pending',
        status: data.status === 'ISSUED' ? 'Verified' : 'Pending Payment',
        endDate: data.end_date || undefined,
        verificationUrl: certificateVerificationUrl(data.certificate_id, window.location.origin),
        pdfUrl: data.file_path || undefined
      });
      setPreviewUrl('');
      setLoadError('');
    } catch (err: unknown) {
      console.warn('Error loading certificate info:', err);
      setLoadError(errorMessage(err, 'Could not load your certificate.'));
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    void fetchCertData();
  }, [fetchCertData]);

  const isVerified = certificate?.status === 'Verified' && access?.eligible === true;

  const createCertificateCanvas = async () => {
    if (!certificate) throw new Error('Certificate data is not available.');
    return generateCertificate(certificateTemplate.src, {
      studentName: certificate.studentName,
      domainName: certificate.program.replace(/\s+Internship$/, ''),
      issueDate: certificate.issueDate,
      certificateId: certificate.certId,
      verificationUrl: certificate.verificationUrl,
    });
  };

  const handlePreview = async () => {
    try {
      setGeneratingPreview(true);
      const canvas = await createCertificateCanvas();
      setPreviewUrl(canvas.toDataURL('image/png'));
    } catch (err: unknown) {
      setLoadError(errorMessage(err, 'Could not generate certificate preview.'));
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const canvas = await createCertificateCanvas();
      const link = document.createElement('a');
      link.download = certificateFileName(certificate?.studentName || 'Student');
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err: unknown) {
      alert(errorMessage(err, 'Could not download certificate image.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <DashboardNavbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Certifications & Credential Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Preview and download your internship completion certificate.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/90 shadow-card flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading your credential...</p>
          </div>
        )}

        {!loading && loadError && !certificate && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/90 shadow-card flex flex-col items-center justify-center gap-3 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">{loadError}</p>
            <button
              onClick={() => { setLoading(true); setLoadError(''); fetchCertData(); }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !loadError && !certificate && access && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-card">
              <div className="aspect-[1456/1024] w-full rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  <Lock className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Certificate Locked</h2>
                <p className="max-w-md px-4 text-sm text-slate-600">
                  {access.reason === 'tasks_incomplete'
                    ? 'Payment received. Complete all required internship tasks to unlock your certificate.'
                    : access.reason === 'enrollment_required'
                      ? 'Enroll in an internship to become eligible for a completion certificate.'
                      : access.reason === 'certificate_revoked'
                        ? 'This certificate is no longer available. Contact support for assistance.'
                        : 'Pay the certificate fee to unlock your certificate. Required internship tasks must also be completed.'}
                </p>
                {access.required_task_count > 0 && access.reason !== 'certificate_revoked' && (
                  <p className="text-xs font-semibold text-slate-500">
                    {access.verified_task_count} of {access.required_task_count} required tasks verified
                  </p>
                )}
              </div>
            </div>

            <aside className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Unlock Certificate</h2>
              {access.reason === 'tasks_incomplete' ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">Payment received. Finish your required tasks to unlock the certificate.</p>
                </div>
              ) : access.reason === 'enrollment_required' ? (
                <Link
                  href="/internships"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  <span>Explore Internships</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : access.reason === 'certificate_revoked' ? (
                <Link href="/help" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Contact support</Link>
              ) : (
                <>
                  <p className="text-sm text-slate-600">Pay ₹199. Your certificate unlocks after payment and verification of all required tasks.</p>
                  <Link
                    href="/dashboard/payments?purpose=certificate"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    <IndianRupee className="h-4 w-4" />
                    <span>Pay Now · ₹199</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </aside>
          </div>
        )}

        {!loading && certificate && (
          <>

          {/* Certificate Card Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-3xl border-2 border-indigo-100 shadow-2xl">
              <div className="aspect-[1456/1024] w-full overflow-hidden rounded-xl bg-slate-100">
                {previewUrl ? <Image src={previewUrl} alt="Generated internship certificate" width={1456} height={1024} unoptimized className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-slate-500">Select Preview Certificate to generate your certificate.</div>}
              </div>
            </div>

            {/* Certificate Actions Sidebar */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Certificate Actions
              </h3>

              {/* Verification Link */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verification Link
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-indigo-600 break-all">
                  {certificate.verificationUrl}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  disabled={!isVerified || generatingPreview}
                  onClick={handlePreview}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {generatingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{generatingPreview ? 'Generating Preview...' : 'Preview Certificate'}</span>
                </button>
                <button
                  disabled={!isVerified || downloading}
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{downloading ? 'Generating PNG...' : 'Download Certificate'}</span>
                </button>

              </div>
            </div>

          </div>
          </>
        )}

      </main>
    </div>
  );
}
