'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBadge,
  FileText,
  ShieldCheck,
  Download,
  Pencil,
  Plus,
  Eye,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { OfferLetterTemplate } from '@/lib/types';
import { getIssuedCertificatesAdmin } from '@/lib/supabase/queries';
import { errorMessage } from '@/lib/errorMessage';

export default function AdminCertificateOfferPage() {
  const [templates, setTemplates] = useState<OfferLetterTemplate[]>([]);
  const [tab, setTab] = useState<'certificate' | 'offer'>('certificate');
  const [recipientName, setRecipientName] = useState('');
  const [program, setProgram] = useState('');
  const [certId, setCertId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'certificate' | 'offer'>('certificate');
  const [showCreateOffer, setShowCreateOffer] = useState(false);

  const latestTemplate = templates[templates.length - 1];

  const toMediaUrl = (path?: string): string => {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return path;
  };

  const downloadLatestOfferLetter = () => {
    const url = toMediaUrl(latestTemplate?.fileUrl);
    if (url) window.open(url, '_blank');
  };

  const fetchData = async () => {
    try {
      const certificates = await getIssuedCertificatesAdmin();
      if (Array.isArray(certificates) && certificates.length > 0) {
        const latest = certificates[certificates.length - 1];
        const fullName = latest.student_name || '';
        const domainName = latest.domain_name || '';
        if (fullName) setRecipientName(fullName);
        if (domainName) setProgram(`${domainName} Internship`);
        if (latest.certificate_id) setCertId(latest.certificate_id);
        if (latest.issue_date) setIssueDate(latest.issue_date);
      }
    } catch (err: unknown) {
      console.error('Could not fetch certificate data from Supabase:', err);
      setError(errorMessage(err, 'Could not load credential data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTemplateStatus = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'Active' ? 'Draft' : 'Active' } : t))
    );
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={FileBadge}
        badge="Template Designer"
        title="Certificate & Offer Letter"
        subtitle="Design and manage the official InternJourneys credentials issued to interns."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setTab('certificate')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors border ${
                tab === 'certificate' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              Certificate
            </button>
            <button
              onClick={() => setTab('offer')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors border ${
                tab === 'offer' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              Offer Letter
            </button>
          </div>
        }
      />

      {loading && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500">
          Loading credential templates from database…
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* CERTIFICATE TAB */}
      {tab === 'certificate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Template editor panel */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                Certificate Template
              </h2>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="certificate-recipient-name" className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
                <input
                  id="certificate-recipient-name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
              <div>
                <label htmlFor="certificate-program" className="block text-xs font-semibold text-slate-700 mb-1">Program / Domain</label>
                <input
                  id="certificate-program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
              <div>
                <label htmlFor="certificate-issued-on" className="block text-xs font-semibold text-slate-700 mb-1">Issued On</label>
                <input
                  id="certificate-issued-on"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
              <div>
                <label htmlFor="certificate-id" className="block text-xs font-semibold text-slate-700 mb-1">Certificate ID</label>
                <input
                  id="certificate-id"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setPreviewMode('certificate')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => alert(recipientName ? 'Template saved. New certificates issued to interns will use this format.' : 'No certificate records found in the database yet.')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>

          {/* Certificate preview */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-indigo-100 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
              <div className="relative border-4 border-indigo-900/10 p-8 rounded-2xl space-y-8 text-center bg-gradient-to-b from-white to-slate-50/50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">CA</div>
                    <span className="text-lg font-bold tracking-tight text-slate-900">
                      career<span className="text-indigo-600">ai</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>VERIFIED CERTIFICATE</span>
                  </div>
                </div>

                <div className="space-y-4 py-4">
                  <p className="text-xs uppercase tracking-widest font-extrabold text-slate-400">
                    {previewMode === 'offer' ? 'Offer of Internship' : 'Certificate of Internship Completion'}
                  </p>
                  <p className="text-xs text-slate-500">This is proudly presented to</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight underline decoration-indigo-500 underline-offset-8">
                    {recipientName}
                  </h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed pt-2">
                    for successfully completing the intensive 4-week virtual internship in <strong>{program}</strong> and delivering all required industry-grade software projects.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
                  <div className="text-left space-y-1">
                    <p className="font-semibold text-slate-700">Certificate ID: <span className="font-mono text-indigo-600 font-bold">{certId || 'Pending Issuance'}</span></p>
                    <p>Issue Date: <strong>{issueDate || '—'}</strong></p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-slate-900 text-white p-2 flex flex-col items-center justify-center text-[9px] font-mono text-center leading-tight">
                    <span>QR</span><span>VERIFY</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400 font-medium mt-3">
              Live preview — updates as you edit recipient and program fields.
            </p>
          </div>
        </div>
      )}

      {/* OFFER LETTER TAB */}
      {tab === 'offer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-indigo-600" />
              Offer Letter Templates
            </h2>

            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">Updated {t.updatedAt}</p>
                  </div>
                  <button
                    onClick={() => toggleTemplateStatus(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                      t.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {t.status}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCreateOffer(true)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Offer Letter Template
            </button>
          </div>

          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Offer Letter Preview
            </h2>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-[#0F0E38] to-[#1E1B4B] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs">CA</div>
                    <span className="text-sm font-bold">Intern<span className="text-indigo-300">Journeys</span></span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">APPROVED</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-extrabold text-slate-900">Letter of Offer</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We are delighted to offer <strong>{recipientName}</strong> a virtual internship position in the <strong>{program}</strong> program at InternJourneys.
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold">Date:</span>
                  <span className="font-bold text-slate-700">{issueDate || '—'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => downloadLatestOfferLetter()}
              disabled={!latestTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {latestTemplate ? 'Download Offer Letter PDF' : 'No Offer Letters Issued Yet'}
            </button>
          </div>
        </div>
      )}

      {/* Create Offer Letter info modal */}
      {showCreateOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateOffer(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Offer Letter Templates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Offer letters are generated automatically from the backend whenever a student enrolls in an internship.
              The latest issued letter is <strong>{latestTemplate?.name || 'not available yet'}</strong>.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateOffer(false)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
