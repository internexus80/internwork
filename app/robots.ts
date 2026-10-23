import type { MetadataRoute } from 'next';
import { canonicalUrl } from '@/lib/siteMetadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/api'],
    },
    sitemap: canonicalUrl('/sitemap.xml'),
  };
}
