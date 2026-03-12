import { NextResponse } from 'next/server';
import { fetchApiFootballFixturesByDate } from '@/lib/api-football';

// Vercel Cron calls this every 2 hours.
// It fetches today's fixtures and warms the cache.
// Intended cadence: 1 API request every 2 hours for today's fixtures.

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
  }

  const now = new Date();
  // Istanbul timezone offset: UTC+3
  const istanbulOffset = 3 * 60 * 60 * 1000;
  const istanbulNow = new Date(now.getTime() + istanbulOffset);
  const dateKey = istanbulNow.toISOString().split('T')[0];

  // Fetch fresh fixtures directly (bypasses cache to get latest data)
  const result = await fetchApiFootballFixturesByDate(dateKey);

  return NextResponse.json({
    ok: result.ok,
    date: dateKey,
    fixtureCount: result.fixtures.length,
    message: result.ok
      ? `${result.fixtures.length} fikstur basariyla cekildi.`
      : result.message,
    fetchedAt: new Date().toISOString(),
  });
}
