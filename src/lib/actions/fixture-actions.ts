'use server';

import { fetchApiFootballFixturesByDate, type ApiFootballFixture } from '@/lib/api-football';

export interface FixtureForPicker {
  fixtureId: number;
  date: string;
  homeName: string;
  awayName: string;
  leagueName: string;
  leagueCountry: string;
  leagueKey: string;
  statusShort: string;
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
    statusShort: f.statusShort,
  };
}

// Simple in-memory cache to avoid redundant API calls within the same server lifecycle
const fixtureCache = new Map<string, { data: DailyFixturesResult; timestamp: number }>();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Only exclude cancelled/abandoned matches
const EXCLUDED_STATUSES = new Set(['CANC', 'PST', 'ABD', 'AWD', 'WO']);

export async function getDailyFixtures(dateKey: string): Promise<DailyFixturesResult> {
  // Check in-memory cache
  const cached = fixtureCache.get(dateKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const result = await fetchApiFootballFixturesByDate(dateKey);

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
      .filter(f => !EXCLUDED_STATUSES.has(f.statusShort))
      .map(toPickerFixture)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const leagueSet = new Set(pickerFixtures.map(f => f.leagueKey));
    const leagues = Array.from(leagueSet).sort();

    const response: DailyFixturesResult = {
      ok: true,
      fixtures: pickerFixtures,
      leagues,
      cachedAt: new Date().toISOString(),
    };

    // Store in cache
    fixtureCache.set(dateKey, { data: response, timestamp: Date.now() });

    return response;
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
