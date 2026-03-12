import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  fetchApiFootballFixturesByDate,
  findBestFixture,
  getMatchDateKey,
  isFinishedFixture,
  shiftDateKey,
} from '@/lib/api-football';
import { evaluatePrediction } from '@/lib/prediction-evaluator';
import { revalidatePath } from 'next/cache';

// Vercel Cron calls this every 2 hours.
// It syncs results for all pending coupons.
// Uses API requests for the dates needed by pending matches.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
  }

  const supabase = await createClient();

  // Get all pending coupons
  const { data: pendingCoupons, error: queryError } = await supabase
    .from('coupons')
    .select('id, date, matches(*)')
    .eq('status', 'pending');

  if (queryError) {
    return NextResponse.json({ ok: false, message: queryError.message }, { status: 500 });
  }

  if (!pendingCoupons || pendingCoupons.length === 0) {
    return NextResponse.json({ ok: true, message: 'Bekleyen kupon yok.', updatedCount: 0 });
  }

  // Collect unique dates from pending matches
  const dateKeys = new Set<string>();
  for (const coupon of pendingCoupons) {
    const matches = (coupon.matches ?? []) as Array<{ match_time: string }>;
    for (const match of matches) {
      dateKeys.add(getMatchDateKey(match.match_time));
    }
  }

  // Fetch fixtures for all needed dates (with caching per date)
  const fixtureCache = new Map<string, Awaited<ReturnType<typeof fetchApiFootballFixturesByDate>>>();

  for (const dateKey of dateKeys) {
    if (!fixtureCache.has(dateKey)) {
      fixtureCache.set(dateKey, await fetchApiFootballFixturesByDate(dateKey));
    }
  }

  let totalUpdated = 0;
  let totalPending = 0;
  let totalUnmatched = 0;

  for (const coupon of pendingCoupons) {
    const matches = (coupon.matches ?? []) as Array<{
      id: string;
      home_team: string;
      away_team: string;
      match_time: string;
      prediction: string;
      result: string;
    }>;

    for (const match of matches) {
      if (match.result as string !== 'pending') continue;

      const baseDate = getMatchDateKey(match.match_time);
      const searchDates = [baseDate, shiftDateKey(baseDate, -1), shiftDateKey(baseDate, 1)];

      const allFixtures = searchDates.flatMap(dk => {
        const cached = fixtureCache.get(dk);
        if (!cached && !fixtureCache.has(dk)) {
          // Lazy-fetch dates we haven't fetched yet
          return [];
        }
        return cached?.fixtures ?? [];
      });

      // Fetch any missing dates
      for (const dk of searchDates) {
        if (!fixtureCache.has(dk)) {
          fixtureCache.set(dk, await fetchApiFootballFixturesByDate(dk));
          allFixtures.push(...(fixtureCache.get(dk)?.fixtures ?? []));
        }
      }

      const matchedFixture = findBestFixture(match, allFixtures);

      if (!matchedFixture) {
        totalUnmatched += 1;
        continue;
      }

      if (!isFinishedFixture(matchedFixture.statusShort)) {
        totalPending += 1;
        continue;
      }

      if (matchedFixture.homeGoals == null || matchedFixture.awayGoals == null) {
        totalPending += 1;
        continue;
      }

      const evaluation = evaluatePrediction(
        match.prediction,
        matchedFixture.homeGoals,
        matchedFixture.awayGoals,
      );

      if (evaluation == null) {
        totalPending += 1;
        continue;
      }

      const nextResult: 'won' | 'lost' = evaluation ? 'won' : 'lost';
      if ((match.result as string) === nextResult) continue;

      const { error: updateError } = await supabase
        .from('matches')
        .update({ result: nextResult })
        .eq('id', match.id);

      if (!updateError) {
        totalUpdated += 1;
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/gecmis-kuponlar');

  return NextResponse.json({
    ok: true,
    message: `Sonuc senkronu tamamlandi.`,
    couponsChecked: pendingCoupons.length,
    updatedCount: totalUpdated,
    pendingCount: totalPending,
    unmatchedCount: totalUnmatched,
    datesFetched: fixtureCache.size,
    fetchedAt: new Date().toISOString(),
  });
}
