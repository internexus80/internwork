'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  description: string;
}

const notifications: NotificationItem[] = [
  { id: 1, title: 'Explore virtual internships', description: 'Browse structured learning tracks.' },
  { id: 2, title: 'Build through projects', description: 'Practice with guided tasks and submissions.' },
  { id: 3, title: 'Start your learning journey', description: 'Choose a domain that interests you.' },
  { id: 4, title: 'Discover project-based learning', description: 'Learn by completing practical milestones.' },
];

export const LiveRegistrationToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const active = notifications[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-50 transition-all duration-500 transform">
      {isVisible && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200/90 max-w-[280px] space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 tracking-wide border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 uppercase">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Explore InternJourneys</span>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded-full hover:bg-slate-100"
              aria-label="Close message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href="/internships" className="flex items-start gap-3 pt-0.5 group">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600">
                {active.title}
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold">{active.description}</p>
            </div>
          </Link>

        </div>
      )}
    </div>
  );
};
