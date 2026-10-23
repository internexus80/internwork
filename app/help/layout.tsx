import type { Metadata } from 'next';

const description = 'Find answers about InternJourneys accounts, virtual internship tasks, certificate eligibility, and payments.';

export const metadata: Metadata = {
  title: 'Help and Frequently Asked Questions',
  description,
  alternates: {
    canonical: '/help',
  },
  openGraph: {
    title: 'Help and Frequently Asked Questions',
    description,
    url: '/help',
  },
  twitter: {
    title: 'Help and Frequently Asked Questions',
    description,
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
