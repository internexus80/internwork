import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/redis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'careerai:domains';
const DOMAINS_TTL_SECONDS = 10 * 60;

export async function GET() {
  const cached = await getCached(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('domains')
      .select('*, domain_skills(*), tasks(id,title,task_number,short_description,difficulty,estimated_hours)')
      .eq('is_active', true)
      .eq('tasks.is_active', true)
      .order('display_order', { ascending: true })
      .order('display_order', { foreignTable: 'domain_skills', ascending: true })
      .order('display_order', { foreignTable: 'tasks', ascending: true });

    if (error) throw error;
    console.info('[domains] SUPABASE FETCH active domains');
    await setCached(CACHE_KEY, data || [], DOMAINS_TTL_SECONDS);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[domains] SUPABASE FETCH FAILED', error);
    return NextResponse.json({ error: 'Could not load internship domains.' }, { status: 500 });
  }
}
