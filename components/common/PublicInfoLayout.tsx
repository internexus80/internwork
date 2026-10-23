import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

const legalLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund & Cancellation Policy' },
  { href: '/contact', label: 'Contact Us' },
];

export function PublicInfoLayout({
  title,
  description,
  updatedAt,
  children,
}: {
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo href="/" />
          <nav aria-label="Main navigation" className="flex items-center gap-3 text-xs font-bold sm:gap-5">
            <Link href="/internships" className="hidden text-slate-600 hover:text-indigo-600 sm:inline">Internships</Link>
            <Link href="/login" className="hidden text-slate-600 hover:text-indigo-600 sm:inline">Sign In</Link>
            <Link href="/register" className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 sm:px-4">Get Started</Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-10 lg:p-12">
          <header className="mb-9 border-b border-slate-100 pb-7">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">InternJourneys</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            {updatedAt && <p className="mt-4 text-xs text-slate-500">Last updated: {updatedAt}</p>}
          </header>
          <div className="space-y-8 text-sm leading-7 text-slate-700">{children}</div>
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_2fr] lg:items-center lg:px-8">
          <div className="space-y-2">
            <Logo subtitle={false} />
            <p className="text-xs text-slate-500">InternJourneys · Proprietor: VADIVEL BHUVANESH · Pudukkottai district, Tamil Nadu, India</p>
            <a href="mailto:bhuvaneshbhuvan128@gmail.com" className="text-xs font-semibold text-indigo-600 hover:underline">
              bhuvaneshbhuvan128@gmail.com
            </a>
          </div>
          <nav aria-label="Legal and company information" className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-slate-600 lg:justify-end">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-indigo-600">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-slate-400 lg:col-span-2 lg:text-right">© 2026 InternJourneys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold leading-6 text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
