import type { Metadata } from 'next';

const description = 'Browse active virtual internship tracks, guided project tasks, and learning roadmaps from InternJourneys.';

export const metadata: Metadata = {
  title: 'Virtual Internship Catalog',
  description,
  alternates: {
    canonical: '/internships',
  },
  openGraph: {
    title: 'Virtual Internship Catalog',
    description,
    url: '/internships',
  },
  twitter: {
    title: 'Virtual Internship Catalog',
    description,
  },
};

export default function InternshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
