import { createClient } from '@/lib/supabase/server';
import type { SportTotoWeek } from '@/types';

export async function getCurrentTotoWeek(): Promise<SportTotoWeek | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .eq('status', 'pending')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as SportTotoWeek;
}

export async function getTotoWeeks(): Promise<SportTotoWeek[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data as SportTotoWeek[]) ?? [];
}

export async function getTotoWeekById(id: string): Promise<SportTotoWeek | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as SportTotoWeek;
}
