import { createClient } from '@/lib/supabase/server';
import type { DailyBanko } from '@/types';

export async function getTodayBanko(): Promise<DailyBanko | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_banko')
    .select('*')
    .eq('date', today)
    .single();

  if (error) return null;
  return data as DailyBanko;
}

export async function getBankoByDate(date: string): Promise<DailyBanko | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('daily_banko')
    .select('*')
    .eq('date', date)
    .single();

  if (error) return null;
  return data as DailyBanko;
}
