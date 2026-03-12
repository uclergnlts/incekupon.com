'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  fetchApiFootballFixturesByDate,
  findBestFixture,
  getMatchDateKey,
  isFinishedFixture,
  shiftDateKey,
} from '@/lib/api-football';
import { evaluatePrediction } from '@/lib/prediction-evaluator';

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

type CouponActionResult = { ok: true } | { ok: false; message: string };
type SyncActionResult = {
  ok: boolean;
  message: string;
  updatedCount: number;
  pendingCount: number;
  unmatchedCount: number;
};

function normalizeCouponUrl(value: string): { ok: true; url: string } | { ok: false; message: string } {
  const raw = value.trim();
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'Gecerli bir kupon linki girin.' };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, message: 'Gecerli bir kupon linki girin (ornek: https://site.com/kupon).' };
  }
}

function mapCouponDbError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message;
    if (message.includes('played_coupon_url')) {
      return 'Veritabani guncel degil: supabase-coupon-played-link.sql dosyasini calistirin.';
    }
    return message;
  }

  return 'Beklenmeyen bir hata olustu.';
}

export async function createCoupon(data: CouponPayload): Promise<CouponActionResult> {
  const supabase = await createClient();
  const normalizedUrl = normalizeCouponUrl(data.played_coupon_url);
  if (!normalizedUrl.ok) return normalizedUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };
  }

  const totalOdds = data.matches.reduce((acc, match) => acc * match.odds, 1);

  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .insert({
      date: data.date,
      played_coupon_url: normalizedUrl.url,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
      status: 'pending',
    })
    .select()
    .single();

  if (couponError) {
    return { ok: false, message: mapCouponDbError(couponError) };
  }

  const matchesData = data.matches.map(match => ({
    ...match,
    coupon_id: coupon.id,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase.from('matches').insert(matchesData);
  if (matchesError) {
    return { ok: false, message: mapCouponDbError(matchesError) };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { ok: true };
}

export async function updateCoupon(couponId: string, data: CouponPayload): Promise<CouponActionResult> {
  const supabase = await createClient();
  const normalizedUrl = normalizeCouponUrl(data.played_coupon_url);
  if (!normalizedUrl.ok) return normalizedUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };
  }

  const totalOdds = data.matches.reduce((acc, match) => acc * match.odds, 1);

  const { error: couponError } = await supabase
    .from('coupons')
    .update({
      date: data.date,
      played_coupon_url: normalizedUrl.url,
      notes: data.notes || null,
      total_odds: Math.round(totalOdds * 100) / 100,
    })
    .eq('id', couponId);

  if (couponError) {
    return { ok: false, message: mapCouponDbError(couponError) };
  }

  await supabase.from('matches').delete().eq('coupon_id', couponId);

  const matchesData = data.matches.map(match => ({
    ...match,
    coupon_id: couponId,
    result: 'pending',
  }));

  const { error: matchesError } = await supabase.from('matches').insert(matchesData);
  if (matchesError) {
    return { ok: false, message: mapCouponDbError(matchesError) };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/admin/kupon/${couponId}`);
  return { ok: true };
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

export async function syncCouponResultsFromApiFootball(couponId: string): Promise<SyncActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.',
      updatedCount: 0,
      pendingCount: 0,
      unmatchedCount: 0,
    };
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('id, matches(*)')
    .eq('id', couponId)
    .single();

  if (error || !coupon) {
    return {
      ok: false,
      message: 'Kupon bulunamadi.',
      updatedCount: 0,
      pendingCount: 0,
      unmatchedCount: 0,
    };
  }

  const matches = (coupon.matches ?? []) as Array<{
    id: string;
    home_team: string;
    away_team: string;
    match_time: string;
    prediction: string;
    result: 'pending' | 'won' | 'lost';
  }>;

  if (matches.length === 0) {
    return {
      ok: false,
      message: 'Kuponda mac bulunmuyor.',
      updatedCount: 0,
      pendingCount: 0,
      unmatchedCount: 0,
    };
  }

  const fixtureCache = new Map<string, Awaited<ReturnType<typeof fetchApiFootballFixturesByDate>>>();

  async function getFixturesForDate(dateKey: string) {
    if (!fixtureCache.has(dateKey)) {
      fixtureCache.set(dateKey, await fetchApiFootballFixturesByDate(dateKey));
    }
    return fixtureCache.get(dateKey)!;
  }

  let updatedCount = 0;
  let pendingCount = 0;
  let unmatchedCount = 0;

  for (const match of matches) {
    const baseDate = getMatchDateKey(match.match_time);
    const dateKeys = [baseDate, shiftDateKey(baseDate, -1), shiftDateKey(baseDate, 1)];

    const dateResults = await Promise.all(dateKeys.map(getFixturesForDate));
    const failedResult = dateResults.find(item => !item.ok);
    if (failedResult && failedResult.message) {
      return {
        ok: false,
        message: failedResult.message,
        updatedCount,
        pendingCount,
        unmatchedCount,
      };
    }

    const fixtures = dateResults.flatMap(item => item.fixtures);
    const matchedFixture = findBestFixture(match, fixtures);

    if (!matchedFixture) {
      unmatchedCount += 1;
      continue;
    }

    if (!isFinishedFixture(matchedFixture.statusShort)) {
      pendingCount += 1;
      continue;
    }

    if (matchedFixture.homeGoals == null || matchedFixture.awayGoals == null) {
      pendingCount += 1;
      continue;
    }

    const evaluation = evaluatePrediction(
      match.prediction,
      matchedFixture.homeGoals,
      matchedFixture.awayGoals,
    );

    if (evaluation == null) {
      pendingCount += 1;
      continue;
    }

    const nextResult: 'won' | 'lost' = evaluation ? 'won' : 'lost';
    if (match.result === nextResult) continue;

    const { error: updateError } = await supabase
      .from('matches')
      .update({ result: nextResult })
      .eq('id', match.id);

    if (updateError) {
      return {
        ok: false,
        message: mapCouponDbError(updateError),
        updatedCount,
        pendingCount,
        unmatchedCount,
      };
    }

    updatedCount += 1;
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath(`/admin/kupon/${couponId}`);
  revalidatePath('/gecmis-kuponlar');

  return {
    ok: true,
    message: `API senkronu tamamlandi. Guncellenen: ${updatedCount}, Beklemede: ${pendingCount}, Eslesmeyen: ${unmatchedCount}.`,
    updatedCount,
    pendingCount,
    unmatchedCount,
  };
}

export async function deleteCoupon(couponId: string): Promise<CouponActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Yetkisiz erisim');

  const { error } = await supabase.from('coupons').delete().eq('id', couponId);
  if (error) return { ok: false, message: mapCouponDbError(error) } as const;

  revalidatePath('/');
  revalidatePath('/admin');
  return { ok: true } as const;
}
