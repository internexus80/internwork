'use client';

import React from 'react';

export const HowVirtualInternshipWorksSection: React.FC = () => {
  const steps = [
    {
      stepNum: '01',
      badgeNum: '1',
      title: 'Free Registration',
      description: 'Choose your desired track and submit your basic registration form in 1 minute.',
    },
    {
      stepNum: '02',
      badgeNum: '2',
      title: 'Offer Activation',
      description: 'Access your internship offer letter from your internship portal.',
    },
    {
      stepNum: '03',
      badgeNum: '3',
      title: 'Execute Tasks',
      description: 'Build hands-on milestones, push changes to GitHub, and submit task URLs.',
    },
    {
      stepNum: '04',
      badgeNum: '4',
      title: 'Earn Certification',
      description: 'Complete required tasks and pay the ₹199 certificate fee. Your certificate is available after payment verification and eligibility confirmation.',
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        
        {/* Title & Subtitle */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-[#1D61FF] tracking-wider uppercase border border-blue-100">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How Virtual Internship Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Complete your tasks and get verified in 4 steps.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {steps.map((s) => (
            <div
              key={s.stepNum}
              className="bg-[#F8FAFC] p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs relative space-y-4 hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Background Step Number */}
              <span className="absolute top-4 right-5 text-4xl font-black text-slate-200/60 select-none">
                {s.stepNum}
              </span>

              <div className="space-y-3 relative z-10">
                {/* Number Badge matching Primary Blue theme */}
                <div className="w-8 h-8 rounded-full bg-[#1D61FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {s.badgeNum}
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {s.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
