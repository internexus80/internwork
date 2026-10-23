import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'InternJourneys — Virtual Internships That Build Real Skills',
    description: 'Explore structured virtual internships, project-based learning tasks, and certificates with online verification through InternJourneys.',
    url: '/',
  },
  twitter: {
    title: 'InternJourneys — Virtual Internships That Build Real Skills',
    description: 'Explore structured virtual internships, project-based learning tasks, and certificates with online verification through InternJourneys.',
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
