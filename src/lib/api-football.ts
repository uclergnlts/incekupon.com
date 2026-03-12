export interface ApiFootballFixture {
  fixtureId: number;
  date: string;
  statusShort: string;
  homeName: string;
  awayName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  leagueId: number;
  leagueName: string;
  leagueCountry: string;
}

interface ApiFootballResult {
  ok: boolean;
  message?: string;
  fixtures: ApiFootballFixture[];
}

const NAME_STOP_WORDS = new Set([
  'fc',
  'fk',
  'sk',
  'ac',
  'cf',
  'sc',
  'as',
  'club',
  'spor',
  'kulubu',
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !NAME_STOP_WORDS.has(word))
    .join(' ')
    .trim();
}

function getNameScore(left: string, right: string): number {
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.85;

  const leftWords = left.split(' ').filter(Boolean);
  const rightWords = right.split(' ').filter(Boolean);
  const rightSet = new Set(rightWords);
  const commonCount = leftWords.filter(word => rightSet.has(word)).length;

  return commonCount / Math.max(leftWords.length, rightWords.length);
}

function getDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateKey(dateKey: string, dayOffset: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return getDateKey(date);
}

export function getMatchDateKey(isoDate: string): string {
  return getDateKey(new Date(isoDate));
}

export function isFinishedFixture(statusShort: string): boolean {
  return ['FT', 'AET', 'PEN'].includes(statusShort);
}

export async function fetchApiFootballFixturesByDate(dateKey: string): Promise<ApiFootballResult> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return {
      ok: false,
      message: 'API_FOOTBALL_KEY tanimli degil. .env.local dosyasina ekleyin.',
      fixtures: [],
    };
  }

  const baseUrl = process.env.API_FOOTBALL_BASE_URL ?? 'https://v3.football.api-sports.io';
  const url = new URL('/fixtures', baseUrl);
  url.searchParams.set('date', dateKey);
  url.searchParams.set('timezone', 'Europe/Istanbul');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `API-Football hatasi: HTTP ${response.status}`,
        fixtures: [],
      };
    }

    const payload = (await response.json()) as {
      response?: Array<{
        fixture?: { id?: number; date?: string; status?: { short?: string } };
        league?: { id?: number; name?: string; country?: string };
        teams?: { home?: { name?: string }; away?: { name?: string } };
        goals?: { home?: number | null; away?: number | null };
      }>;
      errors?: Record<string, string> | string[];
    };

    if (payload.errors && Object.keys(payload.errors).length > 0) {
      return {
        ok: false,
        message: 'API-Football cevapta hata dondu.',
        fixtures: [],
      };
    }

    const fixtures: ApiFootballFixture[] = (payload.response ?? [])
      .map(item => ({
        fixtureId: item.fixture?.id ?? 0,
        date: item.fixture?.date ?? '',
        statusShort: item.fixture?.status?.short ?? '',
        homeName: item.teams?.home?.name ?? '',
        awayName: item.teams?.away?.name ?? '',
        homeGoals: item.goals?.home ?? null,
        awayGoals: item.goals?.away ?? null,
        leagueId: item.league?.id ?? 0,
        leagueName: item.league?.name ?? '',
        leagueCountry: item.league?.country ?? '',
      }))
      .filter(item => item.fixtureId > 0 && item.homeName && item.awayName);

    return { ok: true, fixtures };
  } catch {
    return {
      ok: false,
      message: 'API-Football baglantisi kurulurken hata olustu.',
      fixtures: [],
    };
  }
}

export function findBestFixture(
  match: { home_team: string; away_team: string; match_time: string },
  fixtures: ApiFootballFixture[],
): ApiFootballFixture | null {
  const localHome = normalizeText(match.home_team);
  const localAway = normalizeText(match.away_team);
  const localTime = new Date(match.match_time).getTime();

  let best: { fixture: ApiFootballFixture; score: number } | null = null;

  for (const fixture of fixtures) {
    const fixtureHome = normalizeText(fixture.homeName);
    const fixtureAway = normalizeText(fixture.awayName);

    const directScore = getNameScore(localHome, fixtureHome) + getNameScore(localAway, fixtureAway);
    const swappedScore = getNameScore(localHome, fixtureAway) + getNameScore(localAway, fixtureHome) - 0.45;
    const teamScore = Math.max(directScore, swappedScore);
    if (teamScore < 1.25) continue;

    const fixtureTime = new Date(fixture.date).getTime();
    const diffMinutes = Math.abs(localTime - fixtureTime) / 60000;
    const timeBonus = diffMinutes <= 180 ? (180 - diffMinutes) / 180 : 0;
    const score = teamScore + timeBonus * 0.5;

    if (!best || score > best.score) {
      best = { fixture, score };
    }
  }

  return best?.fixture ?? null;
}
