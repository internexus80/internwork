'use client';

import React from 'react';

const learningAreas = [
  'Generative AI',
  'Cybersecurity',
  'Cloud & DevOps',
  'Web Development',
  'Data Science',
  'AI & Machine Learning',
  'UI/UX Design',
  'Python & Java',
  'Graphic Design',
  'Mobile App Development',
];

export const CompanyLogosMarquee: React.FC = () => {
  const items = [...learningAreas, ...learningAreas, ...learningAreas];

  return (
    <div className="w-full min-w-0 space-y-5 select-none pointer-events-none">
      <div className="text-center">
        <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#1D61FF]">
          Explore project-based learning areas
        </p>
      </div>

      {/* Moving Marquee */}
      <div className="relative w-full min-w-0 overflow-hidden py-4 border-y border-slate-200/60 bg-white/40">
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10"></div>

        <div className="flex items-center gap-12 sm:gap-16 animate-marquee">
          {items.map((area, index) => (
            <div
              key={`${area}-${index}`}
              className="flex-shrink-0 px-5 py-2 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs flex items-center justify-center min-w-[150px] h-12 text-sm font-bold text-slate-700"
            >
              {area}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
