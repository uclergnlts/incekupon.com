'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface MatchInput {
  league: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  odds: number;
  sort_order: number;
}

interface CouponPayload {
  date: string;
  played_coupon_url: string;
  notes?: string;
  matches: MatchInput[];
}

function validateCouponUrl(value: string): string {
  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Gecerli bir kupon linki girin');
  }
  return url;
}

export async function createCoupon(data: CouponPayload) {
  const supabase = await createClient();
  const playedCouponUrl = validateCouponUrl(data.played_coupon_url);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Yetkisiz erisim');

  const totalOdds = data.matches.reduce((acc, match) => acc * match.odds, 1);

  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .insert({
      date: data.date,
      played_coupon_url: playedCouponUrl,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
      status: 'pending',
    })
    .select()
    .single();

  if (couponError) throw couponError;

  const matchesData = data.matches.map(match => ({
    ...match,
    coupon_id: coupon.id,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase.from('matches').insert(matchesData);
  if (matchesError) throw matchesError;

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateCoupon(couponId: string, data: CouponPayload) {
  const supabase = await createClient();
  const playedCouponUrl = validateCouponUrl(data.played_coupon_url);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Yetkisiz erisim');

  const totalOdds = data.matches.reduce((acc, match) => acc * match.odds, 1);

  const { error: couponError } = await supabase
    .from('coupons')
    .update({
      date: data.date,
      played_coupon_url: playedCouponUrl,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
    })
    .eq('id', couponId);

  if (couponError) throw couponError;

  await supabase.from('matches').delete().eq('coupon_id', couponId);

  const matchesData = data.matches.map(match => ({
    ...match,
    coupon_id: couponId,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase.from('matches').insert(matchesData);
  if (matchesError) throw matchesError;

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/admin/kupon/${couponId}`);
}

export async function updateMatchResult(matchId: string, result: 'pending' | 'won' | 'lost') {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Yetkisiz erisim');

  const { error } = await supabase.from('matches').update({ result }).eq('id', matchId);
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/gecmis-kuponlar');
}

export async function deleteCoupon(couponId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Yetkisiz erisim');

  const { error } = await supabase.from('coupons').delete().eq('id', couponId);
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}
