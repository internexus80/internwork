'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { errorMessage } from '@/lib/errorMessage';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { redirect } = await login({ email, password });
      router.push(redirect);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Login failed. Please check your credentials.'));
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-background text-slate-900 font-sans flex flex-col justify-center antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Visual Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F0E38] via-[#17164B] to-[#1E1B4B] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <Logo href="/" className="text-white" />
            
            <div className="space-y-3 pt-6">
              <h2 className="text-3xl font-semibold text-white leading-snug">
                Build Real Skills. Gain Real Experience.
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Access project-based virtual internships, track tasks, manage credentials, and continue your learning journey.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-10 space-y-3 border-t border-white/10 text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Project-based virtual workflows</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified credentials and guided tasks</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Sign in to InternJourneys
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter your credentials to access your internship dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{isLoading ? "Signing in..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
