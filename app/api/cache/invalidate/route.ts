import { NextRequest, NextResponse } from 'next/server';
import { invalidateCached } from '@/lib/redis';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const accessToken = authorization.slice(7);
    const supabase = createServerSupabaseClient(accessToken);
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const keys = ['careerai:domains'];
    if (typeof body.slug === 'string' && body.slug) keys.push(`careerai:domain:${body.slug}`);
    await invalidateCached(keys);
    return NextResponse.json({ invalidated: keys });
  } catch (error) {
    console.error('[redis] CACHE INVALIDATION REQUEST FAILED', error);
    return NextResponse.json({ error: 'Could not invalidate cache.' }, { status: 500 });
  }
}
