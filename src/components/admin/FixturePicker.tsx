'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { getDailyFixtures, type FixtureForPicker } from '@/lib/actions/fixture-actions';

interface FixturePickerProps {
  date: string;
  onSelect: (fixture: FixtureForPicker) => void;
}

export default function FixturePicker({ date, onSelect }: FixturePickerProps) {
  const [fixtures, setFixtures] = useState<FixtureForPicker[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [cachedAt, setCachedAt] = useState('');

  const fetchFixtures = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const result = await getDailyFixtures(date);
      if (!result.ok) {
        toast.error(result.message || 'Fiksturler alinamadi.');
        setFixtures([]);
        setLeagues([]);
        return;
      }
      setFixtures(result.fixtures);
      setLeagues(result.leagues);
      setCachedAt(result.cachedAt);
      if (result.fixtures.length === 0) {
        toast.info('Bu tarih icin mac bulunamadi.');
      }
    } catch {
      toast.error('Fiksturler yuklenirken hata olustu.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (open && fixtures.length === 0 && !loading) {
      fetchFixtures();
    }
  }, [open, fixtures.length, loading, fetchFixtures]);

  // Reset when date changes
  useEffect(() => {
    setFixtures([]);
    setLeagues([]);
    setSelectedLeague('all');
    setSearch('');
    setCachedAt('');
  }, [date]);

  const filteredFixtures = fixtures.filter(f => {
    const matchesLeague = selectedLeague === 'all' || f.leagueKey === selectedLeague;
    if (!matchesLeague) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.homeName.toLowerCase().includes(q) ||
      f.awayName.toLowerCase().includes(q) ||
      f.leagueName.toLowerCase().includes(q)
    );
  });

  // Group by league
  const grouped = new Map<string, FixtureForPicker[]>();
  for (const f of filteredFixtures) {
    const list = grouped.get(f.leagueKey) ?? [];
    list.push(f);
    grouped.set(f.leagueKey, list);
  }

  function formatTime(isoDate: string) {
    const d = new Date(isoDate);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  function handleSelect(fixture: FixtureForPicker) {
    onSelect(fixture);
    toast.success(`${fixture.homeName} - ${fixture.awayName} eklendi.`);
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-primary"
      >
        <span>API&apos;den Mac Sec ({date})</span>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Toolbar */}
          <div className="p-3 space-y-2 bg-gray-50 border-b border-border">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Takim ara..."
                  className="w-full border border-border rounded-lg pl-8 pr-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={fetchFixtures}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-white disabled:opacity-50"
                title="Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={selectedLeague}
                onChange={e => setSelectedLeague(e.target.value)}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tum Ligler ({fixtures.length} mac)</option>
                {leagues.map(league => {
                  const count = fixtures.filter(f => f.leagueKey === league).length;
                  return (
                    <option key={league} value={league}>
                      {league} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {cachedAt && (
              <p className="text-[10px] text-muted">
                Son guncelleme: {new Date(cachedAt).toLocaleString('tr-TR')}
              </p>
            )}
          </div>

          {/* Fixture List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && fixtures.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fiksturler yukleniyor...
              </div>
            ) : filteredFixtures.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted">
                {fixtures.length === 0 ? 'Bu tarih icin fikstur bulunamadi.' : 'Arama kriterine uygun mac yok.'}
              </div>
            ) : (
              Array.from(grouped.entries()).map(([leagueKey, leagueFixtures]) => (
                <div key={leagueKey}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-border">
                    <span className="text-xs font-bold text-muted">{leagueKey}</span>
                  </div>
                  {leagueFixtures.map(fixture => (
                    <button
                      key={fixture.fixtureId}
                      type="button"
                      onClick={() => handleSelect(fixture)}
                      className="w-full text-left px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fixture.homeName} - {fixture.awayName}
                        </p>
                      </div>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {formatTime(fixture.date)}
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
