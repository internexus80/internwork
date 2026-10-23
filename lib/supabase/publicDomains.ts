import { cache } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DomainRow } from '@/lib/supabase/types';

export const getPublicDomainBySlug = cache(async (slug: string): Promise<DomainRow | null> => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('domains')
    .select('*, domain_skills(*), tasks(id,title,task_number,short_description,difficulty,estimated_hours)')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('tasks.is_active', true)
    .order('display_order', { foreignTable: 'domain_skills', ascending: true })
    .order('display_order', { foreignTable: 'tasks', ascending: true })
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as DomainRow;
});
