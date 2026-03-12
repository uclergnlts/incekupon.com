'use server';

import { unstable_cache } from 'next/cache';
import { fetchApiFootballFixturesByDate, type ApiFootballFixture } from '@/lib/api-football';

export interface FixtureForPicker {
  fixtureId: number;
  date: string;
  homeName: string;
  awayName: string;
  leagueName: string;
  leagueCountry: string;
  leagueKey: string;
}

interface DailyFixturesResult {
  ok: boolean;
  message?: string;
  fixtures: FixtureForPicker[];
  leagues: string[];
  cachedAt: string;
}

function toPickerFixture(f: ApiFootballFixture): FixtureForPicker {
  const leagueKey = `${f.leagueCountry} - ${f.leagueName}`;
  return {
    fixtureId: f.fixtureId,
    date: f.date,
    homeName: f.homeName,
    awayName: f.awayName,
    leagueName: f.leagueName,
    leagueCountry: f.leagueCountry,
    leagueKey,
  };
}

// Fixtures cache: revalidates every 12 hours (43200 seconds)
// This means at most 1 API call per date per 12 hours
function getCachedFixtures(dateKey: string) {
  return unstable_cache(
    async () => {
      const result = await fetchApiFootballFixturesByDate(dateKey);
      return {
        ...result,
        fetchedAt: new Date().toISOString(),
      };
    },
    [`daily-fixtures-${dateKey}`],
    { revalidate: 43200, tags: [`fixtures-${dateKey}`] },
  )();
}

export async function getDailyFixtures(dateKey: string): Promise<DailyFixturesResult> {
  try {
    const result = await getCachedFixtures(dateKey);

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        fixtures: [],
        leagues: [],
        cachedAt: '',
      };
    }

    const pickerFixtures = result.fixtures
      .filter(f => !['FT', 'AET', 'PEN', 'CANC', 'PST', 'ABD', 'AWD', 'WO'].includes(f.statusShort))
      .map(toPickerFixture)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const leagueSet = new Set(pickerFixtures.map(f => f.leagueKey));
    const leagues = Array.from(leagueSet).sort();

    return {
      ok: true,
      fixtures: pickerFixtures,
      leagues,
      cachedAt: result.fetchedAt,
    };
  } catch {
    return {
      ok: false,
      message: 'Fikstur verileri alinirken hata olustu.',
      fixtures: [],
      leagues: [],
      cachedAt: '',
    };
  }
}
