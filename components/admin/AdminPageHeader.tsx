import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  icon: Icon,
  badge,
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <Icon className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
