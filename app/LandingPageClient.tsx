'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { CompanyLogosMarquee } from '@/components/common/CompanyLogosMarquee';
import { MovableNoticeBanner } from '@/components/common/MovableNoticeBanner';
import { HowVirtualInternshipWorksSection } from '@/components/common/HowVirtualInternshipWorksSection';
import { SimpleDomainsSection } from '@/components/common/SimpleDomainsSection';
import { VerifyCertificateSection } from '@/components/common/VerifyCertificateSection';
import { LiveRegistrationToast } from '@/components/common/LiveRegistrationToast';
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Users,
  Play,
  BarChart2,
  BadgeCheck,
  Activity,
  ChevronDown,
  ChevronUp,
  LogIn,
} from 'lucide-react';

export default function LandingPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const landingFaqs = [
    {
      q: 'Will my internship or certificate be recognized by my college or employer?',
      a: 'Recognition policies vary by institution and employer. InternJourneys provides structured project-based learning and certificates with verification IDs, but cannot guarantee that a particular college, university, employer, or government body will recognize them.'
    },
    {
      q: 'Who can enroll in InternJourneys virtual internships?',
      a: 'Students, freshers, and graduates from any university or background who want to build real software engineering skills.'
    },
    {
      q: 'How do I verify my Completion Certificate?',
      a: 'You can verify your certificate anytime using the Verify Cert section on this portal by entering your unique Certificate ID.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">

      {/* 1. MAIN HEADER NAVIGATION NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-6">
            <Logo href="/" />
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-extrabold text-slate-700">
            <a href="#how-it-works" className="hover:text-[#1d61ff] transition-colors">How It Works</a>
            <a href="#domains" className="hover:text-[#1d61ff] transition-colors">Domains</a>
            <a href="#workflow" className="hover:text-[#1d61ff] transition-colors">Workflow</a>
            <a href="#verify-cert" className="hover:text-[#1d61ff] transition-colors">Verify Cert</a>
            <a href="#faq" className="hover:text-[#1d61ff] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/login"
              aria-label="Sign in"
              className="inline-flex items-center justify-center px-3 py-2.5 sm:px-5 rounded-full border border-slate-300 hover:border-slate-400 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <LogIn className="w-4 h-4 min-[390px]:hidden" />
              <span className="hidden min-[390px]:inline">Sign In</span>
            </Link>

            <Link
              href="/internships"
              aria-label="Explore internships"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:px-6 rounded-full bg-[#1d61ff] hover:bg-[#1650d4] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span className="whitespace-nowrap sm:hidden">Explore</span>
              <span className="hidden whitespace-nowrap sm:inline">Explore Internships</span>
              <ArrowRight className="hidden w-3.5 h-3.5 sm:block" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MOVABLE NOTICE BANNER BELOW NAVBAR */}
      <MovableNoticeBanner />

      <main id="main-content">
      {/* 3. HERO SECTION */}
      <section className="relative pt-8 pb-12 md:pt-14 md:pb-20 overflow-hidden bg-hero-curved-swoosh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#E8EEFF] text-[#1D61FF] border border-[#CBDCFD] shadow-2xs">
                <span className="text-base">🎓</span>
                <span>The Next-Gen Virtual Internship Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
                Build Job-Ready Skills <br />
                with <span className="text-[#1D61FF] font-black">Free Enrollment</span> <br />
                Virtual Internships
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Learn through structured virtual internships, guided project tasks, and work submissions. Enrollment is free; certificate issuance requires all tasks to be complete and the ₹199 INR fee to be successfully verified.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1D61FF] hover:bg-[#1650D4] text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Explore Internships</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#workflow"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-extrabold text-sm shadow-xs transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[#1D61FF]">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span>How It Works</span>
                </a>
              </div>

              {/* Features Checklist */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-bold">
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/60">
                  <FileText className="w-4 h-4 text-[#1D61FF]" />
                  <span>Instant Offer Letter</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/60">
                  <ShieldCheck className="w-4 h-4 text-[#1D61FF]" />
                  <span>Verified Certificate</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-slate-200/60">
                  <Users className="w-4 h-4 text-[#1D61FF]" />
                  <span>Real-World Projects</span>
                </div>
              </div>

            </div>

            {/* Right Column Visual: User Provided Image with Annotations & Floating Elements */}
            <div className="lg:col-span-6 relative flex items-center justify-center">

              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 via-indigo-100/40 to-blue-50 rounded-full blur-2xl transform scale-95 pointer-events-none" />

              <div className="relative w-full max-w-lg">

                {/* Provided Image of Student */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/hero-student.jpg"
                    alt="Student working on laptop for virtual internship"
                    className="w-full h-auto object-cover max-h-[460px]"
                  />
                  <div className="absolute inset-0 ring-1 ring-black/5 rounded-3xl pointer-events-none" />
                </div>

                {/* Hand-drawn style Annotation: "Learn Build Grow" */}
                <div className="absolute -top-6 left-6 sm:left-12 z-20 animate-float-gentle">
                  <div className="relative flex flex-col items-center">
                    <span className="font-serif italic font-bold text-lg sm:text-xl text-[#3B62F6] rotate-[-6deg] bg-white/95 px-3 py-1 rounded-2xl shadow-sm border border-blue-100">
                      Learn <br />
                      <span className="ml-3">Build</span> <br />
                      <span className="ml-6">Grow</span>
                    </span>
                    <svg className="w-12 h-10 text-[#3B62F6] ml-8 -mt-1" viewBox="0 0 60 50" fill="none">
                      <path
                        d="M10 5 C 25 25, 40 30, 50 42 M 42 42 L 52 44 L 48 34"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Floating Badge Card */}
                <div className="absolute top-10 -right-2 sm:-right-6 z-20 animate-float-slow">
                  <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3.5 max-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D61FF] flex items-center justify-center font-bold shadow-2xs">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-tight">Skills today</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                        Better tomorrow
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. MOVABLE COMPANY LOGOS MARQUEE */}
      <section id="learning-areas" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <CompanyLogosMarquee />
      </section>

      {/* 5. PLATFORM TRUST METRICS SECTION */}
      <section className="relative overflow-hidden bg-[#F8FAFC] py-16 md:py-24 border-y border-slate-200/70">
        <div className="absolute inset-x-0 top-0 h-16 bg-[#2447A7]" />
        <div className="absolute right-[12%] top-0 h-16 w-96 rounded-bl-full bg-[#2F55BD]/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-9">
            <div className="relative overflow-hidden rounded-[28px] bg-white p-8 sm:p-10 lg:p-12 min-h-[300px] border border-slate-200/80 shadow-xl shadow-slate-200/70 flex flex-col items-center justify-center text-center">
              <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-blue-100/45 blur-3xl" />
              <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
              <div className="relative z-10 space-y-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDF3FF] text-[#1D61FF] text-[11px] font-extrabold tracking-wider uppercase">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
                  Platform Live
                </span>
                <div>
                  <div className="flex items-center justify-center gap-3">
                    <Activity className="hidden sm:block h-9 w-9 text-[#1D61FF]" />
                    <p className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-[#1D61FF] to-[#7C3AED] bg-clip-text text-transparent">
                      12
                    </p>
                  </div>
                  <h2 className="mt-3 text-sm sm:text-base font-extrabold text-slate-600 tracking-[0.22em] uppercase">
                    Internship Domains
                  </h2>
                </div>
                <p className="max-w-sm mx-auto text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  Career-focused tracks seeded from the Supabase domain catalog.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-white p-8 sm:p-10 lg:p-12 min-h-[300px] border border-slate-200/80 shadow-xl shadow-slate-200/70 flex flex-col items-center justify-center text-center">
              <div className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-emerald-100/50 blur-3xl" />
              <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
              <div className="relative z-10 space-y-5">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDF3FF] text-[#1D61FF] text-[11px] font-extrabold tracking-wider uppercase">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
                  Secure Verification
                </span>
                <div>
                  <div className="flex items-center justify-center gap-3">
                    <BadgeCheck className="hidden sm:block h-9 w-9 text-emerald-500" />
                    <p className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-emerald-600">
                      60+
                    </p>
                  </div>
                  <h2 className="mt-3 text-sm sm:text-base font-extrabold text-slate-600 tracking-[0.22em] uppercase">
                    Practical Tasks
                  </h2>
                </div>
                <p className="max-w-sm mx-auto text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                  Project-based tasks with guides, deliverables, and evaluation criteria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW VIRTUAL INTERNSHIP WORKS SECTION (Image 4) */}
      <HowVirtualInternshipWorksSection />

      {/* 7. CLEAN INTERNSHIP DOMAINS SECTION (Images 2 & 3) */}
      <SimpleDomainsSection />

      {/* 8. VERIFY INTERNSHIP CERTIFICATE SECTION (Image 5) */}
      <VerifyCertificateSection />

      {/* 9. FAQ SECTION */}
      <section id="faq" className="bg-white border-t border-slate-200/80 py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {landingFaqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`landing-faq-${idx}`}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-[#1D61FF]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                <div
                  id={`landing-faq-${idx}`}
                  hidden={openFaq !== idx}
                  className="px-4 pb-4 text-xs text-slate-600 bg-white border-t border-slate-100 pt-3 leading-relaxed font-medium"
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>

      {/* 10. LIVE REGISTRATION TOAST POPUP (Bottom-Left Floating Message) */}
      <LiveRegistrationToast />

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Logo subtitle={false} />
            <span className="text-[10px] text-slate-400">InternJourneys · Proprietor: VADIVEL BHUVANESH · Pudukkottai district, Tamil Nadu, India</span>
            <a href="mailto:bhuvaneshbhuvan128@gmail.com" className="text-[10px] font-semibold text-indigo-600 hover:underline">
              bhuvaneshbhuvan128@gmail.com
            </a>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 font-semibold">
            <a href="#workflow" className="hover:text-[#1d61ff]">Workflow</a>
            <a href="#domains" className="hover:text-[#1d61ff]">Domains</a>
            <a href="#verify-cert" className="hover:text-[#1d61ff]">Verify Cert</a>
            <Link href="/about" className="hover:text-[#1d61ff]">About Us</Link>
            <Link href="/terms-and-conditions" className="hover:text-[#1d61ff]">Terms & Conditions</Link>
            <Link href="/privacy-policy" className="hover:text-[#1d61ff]">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#1d61ff]">Refund & Cancellation Policy</Link>
            <Link href="/contact" className="hover:text-[#1d61ff]">Contact Us</Link>
          </nav>
          <p className="text-slate-400">© 2026 InternJourneys. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
