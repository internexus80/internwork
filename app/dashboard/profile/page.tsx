'use client';

import React, { useState, useEffect } from 'react';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { mockUser } from '@/data/mockData';
import { UserProfile } from '@/lib/types';
import { User, Check, Save } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(authUser || mockUser);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (authUser) {
      setProfile(authUser);
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <DashboardNavbar />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <User className="w-3.5 h-3.5" />
              <span>Intern Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Account & Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Update your personal credentials, contact info, and academic institution.
            </p>
          </div>
        </div>

        {/* Saved Feedback */}
        {savedToast && (
          <div className="p-4 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
          
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-intern-id" className="block text-xs font-semibold text-slate-700 mb-1">Intern ID (Read-only)</label>
              <input
                id="profile-intern-id"
                type="text"
                disabled
                value={profile.internId}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">
            Academic & Program Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profile-college" className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
              <input
                id="profile-college"
                type="text"
                value={profile.college}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-graduation-year" className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                id="profile-graduation-year"
                type="text"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-domain" className="block text-xs font-semibold text-slate-700 mb-1">Internship Domain</label>
              <input
                id="profile-domain"
                type="text"
                disabled
                value={profile.domain}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
