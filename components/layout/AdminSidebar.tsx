'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  FileBadge,
  CreditCard,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/lib/authContext';

export const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Domains & Tasks', href: '/admin/domains-tasks', icon: Layers },
  { label: 'Certificate & Offer Letter', href: '/admin/certificate-offer', icon: FileBadge },
  { label: 'Certificate Access', href: '/admin/certificate-access', icon: ShieldCheck },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
];

export const AdminSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      router.replace('/login');
    }
  }, [isLoading, role, router]);

  if (isLoading || role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm font-semibold text-slate-500">
        Checking administrator access…
      </div>
    );
  }

  const adminUser = {
    name: user?.name || 'InternJourneys Admin',
    initials: user?.initials || 'AD',
    role: 'Super Administrator',
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const NavList = () => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/admin'
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200/80 sticky top-0 h-screen">
        <div className="flex items-center justify-between px-5 h-20 border-b border-slate-200/80">
          <Logo href="/admin" />
        </div>

        <NavList />

        <div className="p-4 border-t border-slate-200/80">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {adminUser.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{adminUser.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{adminUser.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4">
        <Logo href="/admin" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Admin Navigation"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div id="admin-mobile-navigation" hidden={!mobileOpen} className="lg:hidden fixed inset-0 z-30 pt-16 bg-white">
          <NavList />
          <div className="p-4 border-t border-slate-200/80">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
