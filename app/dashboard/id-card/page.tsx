'use client';

import React from 'react';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { mockUser } from '@/data/mockData';
import { IdCard, CheckCircle2, Download, QrCode } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/lib/authContext';

export default function IdCardPage() {
  const { user: authUser } = useAuth();
  const user = authUser || mockUser;

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <DashboardNavbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <IdCard className="w-3.5 h-3.5" />
              <span>Digital Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Virtual Internship ID Card
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Official digital ID card verified for active internship enrollment and credential sharing.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download ID Card</span>
          </button>
        </div>

        {/* ID Card Display Container */}
        <div className="flex justify-center py-6">
          
          {/* Card Component */}
          <div className="w-full max-w-md bg-gradient-to-b from-[#0F0E38] via-[#17164B] to-[#1E1B4B] text-white rounded-3xl p-8 shadow-2xl border-2 border-indigo-900/60 relative overflow-hidden space-y-6">
            
            {/* Background Hologram effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Logo className="text-white" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VERIFIED INTERN</span>
              </div>
            </div>

            {/* Main Content: Avatar & Info */}
            <div className="flex items-center gap-6 pt-2">
              {/* Photo Avatar */}
              <div className="w-24 h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-xl shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mb-1">
                    {user.initials}
                  </div>
                  <span className="text-[9px] font-mono text-indigo-300 uppercase">OFFICIAL</span>
                </div>
              </div>

              {/* Student Meta */}
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-200">
                  {user.domain}
                </p>
                <div className="pt-2 text-[11px] space-y-1 text-slate-300">
                  <p><span className="text-slate-400 font-medium">Intern ID:</span> <strong className="text-white font-mono">{user.internId}</strong></p>
                  <p><span className="text-slate-400 font-medium">Status:</span> <strong className="text-emerald-400">{user.status}</strong></p>
                  <p><span className="text-slate-400 font-medium">Joined:</span> <span>{user.joinedOn}</span></p>
                </div>
              </div>
            </div>

            {/* Bottom Section: QR & Security barcode */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <div className="text-[10px] text-indigo-200/80 space-y-0.5">
                <p className="font-bold text-white uppercase tracking-wider">InternJourneys Authorization</p>
                <p>Valid for Virtual Internship Program 2026</p>
                <p className="text-[9px] text-slate-400 font-mono">HASH: 0x8F42...{user.internId}</p>
              </div>
              <div className="w-14 h-14 bg-white p-1.5 rounded-xl flex items-center justify-center text-slate-900 shadow-md">
                <QrCode className="w-10 h-10" />
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
