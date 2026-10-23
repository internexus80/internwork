'use client';

import React from 'react';
import Link from 'next/link';

export const MovableNoticeBanner: React.FC = () => {
  return (
    <div
      aria-label="Internship information"
      className="w-full bg-gradient-to-r from-red-700 via-[#990000] to-red-800 text-white py-2.5 overflow-hidden relative border-b border-red-900 shadow-md select-none"
    >
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-bold">
        {[1, 2, 3].map((key) => (
          <div key={key} aria-hidden={key !== 1} className="flex items-center gap-8 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 text-sm">◆</span>
              <span className="text-white font-black uppercase tracking-wider">
                Explore guided project-based virtual internships at your own pace.
              </span>
              <Link
                href="/internships"
                className="ml-2 px-3 py-1 rounded-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-[11px] shadow-sm transition-transform hover:scale-105"
              >
                Browse Internship Tracks
              </Link>
            </div>
            <span className="text-red-300 font-bold">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
