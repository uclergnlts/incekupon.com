import { NextResponse } from 'next/server';
import { fetchApiFootballFixturesByDate } from '@/lib/api-football';
import { syncCouponResults } from '@/lib/coupon-result-sync';
import { revalidateCouponPaths } from '@/lib/coupon-revalidation';
import { createAdminClient, isSupabaseAdminConfigured } from '@/lib/supabase/admin';

// Combined cron: warms today's fixtures and syncs coupon results in the background.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
  }

  const now = new Date();
  const istanbulOffset = 3 * 60 * 60 * 1000;
  const istanbulNow = new Date(now.getTime() + istanbulOffset);
  const dateKey = istanbulNow.toISOString().split('T')[0];

  // --- Step 1: Fetch today's fixtures ---
  const fixturesResult = await fetchApiFootballFixturesByDate(dateKey);

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      ok: false,
      fixtures: { ok: fixturesResult.ok, date: dateKey, count: fixturesResult.fixtures.length },
      results: {
        ok: false,
        message: 'SUPABASE_SERVICE_ROLE_KEY tanimli degil.',
        couponsChecked: 0,
        checkedMatchCount: 0,
        updatedCount: 0,
        pendingCount: 0,
        unmatchedCount: 0,
      },
      fetchedAt: new Date().toISOString(),
    }, { status: 500 });
  }

  // --- Step 2: Sync results for started / finished matches ---
  const supabase = createAdminClient();
  const result = await syncCouponResults(supabase);

  if (result.updatedCouponIds.length > 0) {
    revalidateCouponPaths(result.updatedCouponIds);
  }

  return NextResponse.json({
    ok: result.ok,
    fixtures: { ok: fixturesResult.ok, date: dateKey, count: fixturesResult.fixtures.length },
    results: result,
    fetchedAt: new Date().toISOString(),
  }, { status: result.ok ? 200 : 500 });
}
