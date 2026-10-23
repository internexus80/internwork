'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { verifyCertificateByCode } from '@/lib/supabase/queries';
import { errorMessage } from '@/lib/errorMessage';

export const VerifyCertificateSection: React.FC = () => {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    name?: string;
    domain?: string;
    issueDate?: string;
    certCode?: string;
    message?: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await verifyCertificateByCode(certId.trim());
      setLoading(false);
      if (response.valid) {
        setResult({
          verified: true,
          name: response.student_name,
          domain: response.domain,
          issueDate: response.issue_date,
          certCode: response.certificate_id,
        });
      } else {
        setResult({
          verified: false,
          message: response.status === 'revoked' ? 'Certificate Revoked' : 'Certificate Not Found',
        });
      }
    } catch (error: unknown) {
      setLoading(false);
      setResult({ verified: false, message: errorMessage(error, 'Certificate Not Found') });
    }
  };

  return (
    <section id="verify-cert" className="py-16 md:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
        
        {/* Header Badge & Title */}
        <div className="space-y-3">
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-[#1D61FF] tracking-wider uppercase border border-blue-100">
            VERIFICATION REGISTRY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify Internship Certificate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
            Enter the unique certificate number (e.g. CDM/CERT/XXXXXX) to verify the authenticity of an InternJourneys digital certificate.
          </p>
        </div>

        {/* Verification Card Input Container */}
        <div className="bg-[#F8FAFC] p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm max-w-2xl mx-auto space-y-6">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-center gap-3">
            <label htmlFor="certificate-number" className="sr-only">Certificate number</label>
            <input
              id="certificate-number"
              type="text"
              required
              placeholder="Enter Certificate Number (e.g., CDM/CERT/123456)"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full flex-1 px-4 py-3.5 rounded-2xl border border-slate-300 focus:border-[#1D61FF] text-xs sm:text-sm font-medium text-slate-900 outline-none bg-white shadow-2xs placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#1D61FF] hover:bg-[#1550d0] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Certificate</span>
              )}
            </button>
          </form>

          {/* Verification Results */}
          {result && (
            <div className="pt-4 border-t border-slate-200 animate-in fade-in duration-300">
              {result.verified ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-left space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>VERIFIED AUTHENTIC CERTIFICATE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 pt-2 border-t border-emerald-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
                      <span className="text-slate-900 font-extrabold text-sm">{result.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Domain Track</span>
                      <span className="text-slate-900 font-bold">{result.domain}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Issued Date</span>
                      <span>{result.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Certificate ID</span>
                      <span className="font-mono text-emerald-700 font-bold">{result.certCode}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-left flex items-center gap-3 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{result.message}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
