'use client';

import React from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  completed,
  total,
  size = 180,
  strokeWidth = 10,
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* SVG Ring Container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Outer glow aura */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-indigo-950/60"
            fill="transparent"
          />
          {/* Animated gradient progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-3xl font-extrabold tracking-tight">
            {completed} / {total}
          </div>
          <div className="text-xs font-medium text-purple-200/90 mt-0.5 tracking-wide">
            Internships
          </div>
        </div>
      </div>

      {/* Under text */}
      <div className="mt-3 text-xs sm:text-sm font-medium text-purple-100/90 max-w-[220px]">
        {completed === total ? "You've completed all your internships! 🎉" : `${total - completed} internship(s) remaining`}
      </div>
    </div>
  );
};
