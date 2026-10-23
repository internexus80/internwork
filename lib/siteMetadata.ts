export const SITE_URL = 'https://internjourneys.in';

export const STATIC_SITEMAP_PATHS = [
  '/',
  '/internships',
  '/help',
  '/about',
  '/contact',
  '/terms-and-conditions',
  '/privacy-policy',
  '/refund-policy',
] as const;

export function canonicalUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function sitemapUrls(domainSlugs: readonly string[]): string[] {
  const domainPaths = Array.from(
    new Set(domainSlugs),
    (slug) => `/domains/${encodeURIComponent(slug)}`
  );

  return [...STATIC_SITEMAP_PATHS, ...domainPaths].map(canonicalUrl);
}
