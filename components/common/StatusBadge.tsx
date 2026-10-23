import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { TaskStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: TaskStatus | 'Active' | 'Available' | 'Pending';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isCompleted = status === 'Completed';
  const isAvailable = status === 'Available';
  const isActive = status === 'Active';

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Completed
      </span>
    );
  }

  if (isAvailable) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Available
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      Pending
    </span>
  );
};
