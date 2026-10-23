import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: 'indigo' | 'emerald' | 'amber' | 'sky';
  sub?: string;
}

const accentStyles: Record<string, { iconBg: string; text: string }> = {
  indigo: { iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600', text: 'text-indigo-600' },
  emerald: { iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600', text: 'text-emerald-600' },
  amber: { iconBg: 'bg-amber-50 border-amber-100 text-amber-600', text: 'text-amber-600' },
  sky: { iconBg: 'bg-sky-50 border-sky-100 text-sky-600', text: 'text-sky-600' },
};

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  accent = 'indigo',
  sub,
}) => {
  const styles = accentStyles[accent];
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-2xl ${styles.iconBg} border`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className={`text-3xl font-extrabold tracking-tight ${styles.text}`}>{value}</div>
        <div className="text-xs font-semibold text-slate-500 mt-1">{label}</div>
        {sub && <div className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};
