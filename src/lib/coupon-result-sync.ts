import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  fetchApiFootballFixturesByDate,
  findBestFixture,
  getMatchDateKey,
  isFinishedFixture,
  shiftDateKey,
} from '@/lib/api-football';
import { evaluatePrediction } from '@/lib/prediction-evaluator';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

type MatchResult = 'pending' | 'won' | 'lost';

interface CouponSyncMatch {
  id: string;
  coupon_id: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  result: MatchResult;
}

interface CouponSyncRecord {
  id: string;
  matches?: CouponSyncMatch[] | null;
}

interface CouponIdRow {
  coupon_id: string;
}

export interface CouponSyncSummary {
  ok: boolean;
  message: string;
  couponsChecked: number;
  checkedMatchCount: number;
  updatedCount: number;
  pendingCount: number;
  unmatchedCount: number;
  updatedCouponIds: string[];
}

function mapSyncError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return 'Beklenmeyen bir senkronizasyon hatasi olustu.';
}

async function loadCouponsForSync(
  supabase: SupabaseClient,
  couponId?: string,
): Promise<{ coupons: CouponSyncRecord[]; message?: string }> {
  if (couponId) {
    const { data, error } = await supabase
      .from('coupons')
      .select('id, matches(*)')
      .eq('id', couponId)
      .single();

    if (error || !data) {
      return { coupons: [], message: 'Kupon bulunamadi.' };
    }

    return { coupons: [data as CouponSyncRecord] };
  }

  const nowIso = new Date().toISOString();
  const { data: pendingMatches, error: pendingError } = await supabase
    .from('matches')
    .select('coupon_id')
    .eq('result', 'pending')
    .lte('match_time', nowIso);

  if (pendingError) {
    return { coupons: [], message: mapSyncError(pendingError) };
  }

  const couponIds = Array.from(
    new Set(((pendingMatches ?? []) as CouponIdRow[]).map(match => match.coupon_id).filter(Boolean)),
  );

  if (couponIds.length === 0) {
    return { coupons: [] };
  }

  const { data: coupons, error: couponError } = await supabase
    .from('coupons')
    .select('id, matches(*)')
    .in('id', couponIds);

  if (couponError) {
    return { coupons: [], message: mapSyncError(couponError) };
  }

  return { coupons: (coupons as CouponSyncRecord[]) ?? [] };
}

export async function syncCouponResults(
  supabase: SupabaseClient,
  options?: { couponId?: string },
): Promise<CouponSyncSummary> {
  const { coupons, message } = await loadCouponsForSync(supabase, options?.couponId);

  if (message) {
    return {
      ok: false,
      message,
      couponsChecked: 0,
      checkedMatchCount: 0,
      updatedCount: 0,
      pendingCount: 0,
      unmatchedCount: 0,
      updatedCouponIds: [],
    };
  }

  if (coupons.length === 0) {
    return {
      ok: true,
      message: 'Senkronize edilecek bekleyen mac yok.',
      couponsChecked: 0,
      checkedMatchCount: 0,
      updatedCount: 0,
      pendingCount: 0,
      unmatchedCount: 0,
      updatedCouponIds: [],
    };
  }

  const fixtureCache = new Map<string, Awaited<ReturnType<typeof fetchApiFootballFixturesByDate>>>();
  const updatedCouponIds = new Set<string>();

  async function getFixturesForDate(dateKey: string) {
    if (!fixtureCache.has(dateKey)) {
      fixtureCache.set(dateKey, await fetchApiFootballFixturesByDate(dateKey));
    }

    return fixtureCache.get(dateKey)!;
  }

  let checkedMatchCount = 0;
  let updatedCount = 0;
  let pendingCount = 0;
  let unmatchedCount = 0;

  for (const coupon of coupons) {
    const matches = (coupon.matches ?? []) as CouponSyncMatch[];

    for (const match of matches) {
      if (match.result !== 'pending' && !options?.couponId) continue;

      checkedMatchCount += 1;

      const baseDate = getMatchDateKey(match.match_time);
      const dateKeys = [baseDate, shiftDateKey(baseDate, -1), shiftDateKey(baseDate, 1)];
      const dateResults = await Promise.all(dateKeys.map(getFixturesForDate));
      const failedResult = dateResults.find(item => !item.ok);

      if (failedResult?.message) {
        return {
          ok: false,
          message: failedResult.message,
          couponsChecked: coupons.length,
          checkedMatchCount,
          updatedCount,
          pendingCount,
          unmatchedCount,
          updatedCouponIds: Array.from(updatedCouponIds),
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

      const nextResult: MatchResult = evaluation ? 'won' : 'lost';
      if (match.result === nextResult) continue;

      const { error: updateError } = await supabase
        .from('matches')
        .update({ result: nextResult })
        .eq('id', match.id);

      if (updateError) {
        return {
          ok: false,
          message: mapSyncError(updateError),
          couponsChecked: coupons.length,
          checkedMatchCount,
          updatedCount,
          pendingCount,
          unmatchedCount,
          updatedCouponIds: Array.from(updatedCouponIds),
        };
      }

      updatedCount += 1;
      updatedCouponIds.add(coupon.id);
    }
  }

  return {
    ok: true,
    message: `API senkronu tamamlandi. Guncellenen: ${updatedCount}, Beklemede: ${pendingCount}, Eslesmeyen: ${unmatchedCount}.`,
    couponsChecked: coupons.length,
    checkedMatchCount,
    updatedCount,
    pendingCount,
    unmatchedCount,
    updatedCouponIds: Array.from(updatedCouponIds),
  };
}

const ensureAutomaticCouponSyncOnce = cache(async () => {
  if (!process.env.API_FOOTBALL_KEY || !isSupabaseAdminConfigured()) {
    return;
  }

  const supabase = createAdminClient();
  const result = await syncCouponResults(supabase);

  if (!result.ok) {
    console.error('Automatic coupon sync failed:', result.message);
  }
});

export async function ensureAutomaticCouponResultSync() {
  try {
    await ensureAutomaticCouponSyncOnce();
  } catch (error) {
    console.error('Automatic coupon sync crashed:', mapSyncError(error));
  }
}
