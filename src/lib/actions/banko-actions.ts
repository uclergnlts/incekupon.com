'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface BankoPayload {
  date: string;
  league: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  odds: number;
  notes?: string;
}

type BankoActionResult = { ok: true } | { ok: false; message: string };

export async function upsertBanko(data: BankoPayload): Promise<BankoActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };
  }

  // Check if a banko already exists for this date
  const { data: existing } = await supabase
    .from('daily_banko')
    .select('id')
    .eq('date', data.date)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('daily_banko')
      .update({
        league: data.league,
        home_team: data.home_team,
        away_team: data.away_team,
        match_time: data.match_time,
        prediction: data.prediction,
        odds: Math.round(data.odds * 100) / 100,
        notes: data.notes || null,
      })
      .eq('id', existing.id);

    if (error) return { ok: false, message: error.message };
  } else {
    // Insert new
    const { error } = await supabase
      .from('daily_banko')
      .insert({
        date: data.date,
        league: data.league,
        home_team: data.home_team,
        away_team: data.away_team,
        match_time: data.match_time,
        prediction: data.prediction,
        odds: Math.round(data.odds * 100) / 100,
        notes: data.notes || null,
      });

    if (error) return { ok: false, message: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/banko');
  return { ok: true };
}

export async function deleteBanko(date: string): Promise<BankoActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Oturum bulunamadi.' };
  }

  const { error } = await supabase
    .from('daily_banko')
    .delete()
    .eq('date', date);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/banko');
  return { ok: true };
}
