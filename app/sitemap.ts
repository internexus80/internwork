import type { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sitemapUrls } from '@/lib/siteMetadata';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();
  const { data: domains, error } = await supabase
    .from('domains')
    .select('slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[sitemap] Could not load active internship domains.', error);
    throw new Error('Could not generate the internship sitemap.');
  }

  return sitemapUrls((domains || []).map(({ slug }) => slug)).map((url) => ({ url }));
}
