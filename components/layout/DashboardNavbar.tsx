'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Award,
  CreditCard,
  User,
  IdCard,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/lib/authContext';

export const DashboardNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout, isLoading } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = authUser;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Certifications', href: '/dashboard/certifications', icon: Award },
    { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0 flex items-center gap-6">
            <Logo href="/dashboard" />
          </div>

          {/* Center: Top Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, Help & Profile Dropdown */}
          <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
            {/* Help Button */}
            <Link
              href="/help"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help</span>
            </Link>

            {/* Profile Dropdown Trigger */}
            {isLoading ? (
              <div aria-label="Loading profile" className="h-10 w-14 animate-pulse rounded-full bg-slate-100" />
            ) : currentUser && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label={`Open ${currentUser.name} account menu`}
                  aria-expanded={userDropdownOpen}
                  aria-controls="student-account-menu"
                  className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentUser.initials}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div id="student-account-menu" hidden={!userDropdownOpen} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{currentUser.domain}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      ID: {currentUser.internId}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      View Profile
                    </Link>
                    <Link
                      href="/dashboard/id-card"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <IdCard className="w-4 h-4 text-slate-400" />
                      Intern ID Card
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="student-mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div id="student-mobile-navigation" hidden={!mobileMenuOpen} className="lg:hidden border-t border-slate-200/80 py-4 space-y-2 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {isLoading ? (
              <div aria-label="Loading profile" className="mx-2 h-10 animate-pulse rounded-xl bg-slate-100" />
            ) : currentUser && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500">{currentUser.internId}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
      </div>
    </header>
  );
};
