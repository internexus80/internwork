'use client';

import React, { useState } from 'react';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { HelpCircle, Search, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: "How do I submit my completed internship tasks?",
    a: "Click on any active task card in your Quest Log or Tasks tab to open the Task Detail Modal. Input your GitHub/project repository URL or drag & drop files and click 'Submit Work'."
  },
  {
    q: "What do I need to access my certificate?",
    a: "Pay the ₹199 certificate fee and complete all required internship tasks to unlock your certificate in the Certifications tab."
  },
  {
    q: "How can I share my certificate on LinkedIn?",
    a: "Visit the Certifications tab to preview your certificate, download it, or share it on LinkedIn."
  },
  {
    q: "What should I do if I missed a task due date?",
    a: "InternJourneys virtual internships feature flexible pacing! You can submit tasks even after the suggested due date without penalty."
  },
  {
    q: "Where can I download my official Offer Letter?",
    a: "Your offer letter is accessible directly on your Dashboard Welcome Hero section by clicking the 'Download Offer Letter' button."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <DashboardNavbar />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Search our knowledge base or browse frequently asked questions regarding virtual internships, payments, and certificates.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-5" />
            <input
              type="text"
              placeholder="Search help articles, tasks, certificate rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`help-faq-${idx}`}
                    className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  <div
                    id={`help-faq-${idx}`}
                    hidden={!isOpen}
                    className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Support Banner */}
        <div className="p-6 rounded-3xl bg-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 text-white shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Still need assistance?</h3>
              <p className="text-xs text-indigo-200">Email us with your question and relevant account details.</p>
            </div>
          </div>
          <a
            href="mailto:bhuvaneshbhuvan128@gmail.com"
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Contact Support
          </a>
        </div>

      </main>
    </div>
  );
}
