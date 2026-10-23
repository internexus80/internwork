import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/redis';
import { getPublicDomainBySlug } from '@/lib/supabase/publicDomains';

export const dynamic = 'force-dynamic';

const DOMAIN_TTL_SECONDS = 10 * 60;

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const cacheKey = `careerai:domain:${slug}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await getPublicDomainBySlug(slug);
    if (!data) return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });

    console.info(`[domains] SUPABASE FETCH domain=${slug}`);
    await setCached(cacheKey, data, DOMAIN_TTL_SECONDS);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[domains] SUPABASE FETCH FAILED domain=${slug}`, error);
    return NextResponse.json({ error: 'Could not load this domain.' }, { status: 500 });
  }
}
