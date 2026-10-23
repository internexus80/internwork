'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/lib/authContext';
import { getActiveDomains } from '@/lib/supabase/queries';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { errorMessage } from '@/lib/errorMessage';

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [domains, setDomains] = useState<{ title: string; slug?: string }[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    graduationYear: '2026',
    domain: '',
    password: '',
    confirmPassword: '',
    agree: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await getActiveDomains();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((d) => ({ title: d.name, slug: d.slug }));
          const requestedDomain = searchParams.get('domain');
          const selected = mapped.find((d) => d.title === requestedDomain || d.slug === requestedDomain);
          setDomains(mapped);
          setFormData((prev) => ({ ...prev, domain: selected?.title || mapped[0]?.title || '' }));
        }
      } catch (err) {
        console.warn('Could not fetch domains from Supabase:', err);
      }
    };
    fetchDomains();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    if (!email.endsWith('@gmail.com')) {
      setError('Please enter a valid Gmail address (must end with @gmail.com).');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password || 'careerai123',
        phone: formData.phone,
        college: formData.college,
        graduation_year: formData.graduationYear,
        domain: formData.domain,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Registration failed. Please try again.'));
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-background text-slate-900 font-sans flex flex-col justify-center antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 space-y-6">

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Logo href="/" />
          <span className="text-xs font-bold text-slate-500">New Intern Registration</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your InternJourneys Account
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Enroll in structured virtual internships and start building industry projects today.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                id="register-name"
                type="text"
                required
                placeholder="Hari Narayan S"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="register-email"
                type="email"
                required
                pattern="[^@]*@gmail\.com"
                title="Please enter a valid Gmail address ending with @gmail.com"
                placeholder="hari@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                id="register-password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input
                id="register-confirm-password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-phone" className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <input
                id="register-phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                maxLength={10}
                title="Mobile number must be exactly 10 digits"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-college" className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
              <input
                id="register-college"
                type="text"
                required
                placeholder="IIT / Anna University"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="register-graduation-year" className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <select
                id="register-graduation-year"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            <div>
              <label htmlFor="register-domain" className="block text-xs font-semibold text-slate-700 mb-1">Internship Domain</label>
              <select
                id="register-domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 text-xs text-slate-900 outline-none"
              >
                {domains.map((d) => (
                  <option key={d.slug || d.title} value={d.title || d.slug}>
                    {d.title || d.slug}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
            <input
              type="checkbox"
              id="agree"
              checked={formData.agree}
              onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="agree">
              I agree to the <Link href="/terms-and-conditions" className="font-semibold text-indigo-600 hover:underline">Terms & Conditions</Link> and <Link href="/privacy-policy" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <span>{isLoading ? "Creating Account & Generating Offer Letter..." : "Create InternJourneys Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </main>
  );
}

function RegisterFallback() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-slate-900 font-sans flex flex-col justify-center antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Logo href="/" />
          <span className="text-xs font-bold text-slate-500">New Intern Registration</span>
        </div>
        <div className="text-xs text-slate-500 font-medium">Loading registration...</div>
      </div>
    </main>
  );
}
