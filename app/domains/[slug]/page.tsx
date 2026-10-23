import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicDomainBySlug } from '@/lib/supabase/publicDomains';
import DomainDetailClient from './DomainDetailClient';

type DomainPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const domain = await getPublicDomainBySlug(params.slug);
  if (!domain) {
    return {
      title: 'Internship Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const domainName = domain.name.replace(/\s+/g, ' ').trim();
  const title = `${domainName} Virtual Internship`;
  const description = domain.short_description || `Explore the ${domainName} virtual internship track and guided project tasks from InternJourneys.`;
  const canonical = `/domains/${encodeURIComponent(domain.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function DomainDetailPage({ params }: DomainPageProps) {
  const domain = await getPublicDomainBySlug(params.slug);
  if (!domain) notFound();

  return <DomainDetailClient domain={domain} />;
}
