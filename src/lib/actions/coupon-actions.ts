'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface MatchInput {
  league: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  odds: number;
  sort_order: number;
}

export async function createCoupon(data: {
  date: string;
  notes?: string;
  matches: MatchInput[];
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const totalOdds = data.matches.reduce((acc, m) => acc * m.odds, 1);

  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .insert({
      date: data.date,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
      status: 'pending',
    })
    .select()
    .single();

  if (couponError) throw couponError;

  const matchesData = data.matches.map(m => ({
    ...m,
    coupon_id: coupon.id,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase
    .from('matches')
    .insert(matchesData);

  if (matchesError) throw matchesError;

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateCoupon(
  couponId: string,
  data: {
    date: string;
    notes?: string;
    matches: MatchInput[];
  }
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const totalOdds = data.matches.reduce((acc, m) => acc * m.odds, 1);

  const { error: couponError } = await supabase
    .from('coupons')
    .update({
      date: data.date,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
    })
    .eq('id', couponId);

  if (couponError) throw couponError;

  // Eski maçları sil, yenilerini ekle
  await supabase.from('matches').delete().eq('coupon_id', couponId);

  const matchesData = data.matches.map(m => ({
    ...m,
    coupon_id: couponId,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase
    .from('matches')
    .insert(matchesData);

  if (matchesError) throw matchesError;

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/admin/kupon/${couponId}`);
}

export async function updateMatchResult(matchId: string, result: 'pending' | 'won' | 'lost') {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const { error } = await supabase
    .from('matches')
    .update({ result })
    .eq('id', matchId);

  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/gecmis-kuponlar');
}

export async function deleteCoupon(couponId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId);

  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}
