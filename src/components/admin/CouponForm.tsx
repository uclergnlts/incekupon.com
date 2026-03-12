'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCoupon, updateCoupon } from '@/lib/actions/coupon-actions';
import FixturePicker from './FixturePicker';
import type { FixtureForPicker } from '@/lib/actions/fixture-actions';
import type { Coupon } from '@/types';

interface MatchFormData {
  league: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  odds: number;
}

const emptyMatch: MatchFormData = {
  league: '',
  home_team: '',
  away_team: '',
  match_time: '',
  prediction: '',
  odds: 1.5,
};

interface CouponFormProps {
  coupon?: Coupon;
}

export default function CouponForm({ coupon }: CouponFormProps) {
  const isEdit = !!coupon;
  const router = useRouter();

  const [date, setDate] = useState(coupon?.date ?? new Date().toISOString().split('T')[0]);
  const [playedCouponUrl, setPlayedCouponUrl] = useState(coupon?.played_coupon_url ?? '');
  const [notes, setNotes] = useState(coupon?.notes ?? '');
  const [matches, setMatches] = useState<MatchFormData[]>(() => {
    if (coupon?.matches?.length) {
      return coupon.matches
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(match => ({
          league: match.league,
          home_team: match.home_team,
          away_team: match.away_team,
          match_time: match.match_time.slice(0, 16),
          prediction: match.prediction,
          odds: match.odds,
        }));
    }

    return [{ ...emptyMatch }];
  });
  const [loading, setLoading] = useState(false);

  function addMatch() {
    setMatches([...matches, { ...emptyMatch }]);
  }

  function addMatchFromFixture(fixture: FixtureForPicker) {
    const matchTime = new Date(fixture.date);
    const localIso = new Date(matchTime.getTime() - matchTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    const newMatch: MatchFormData = {
      league: fixture.leagueKey,
      home_team: fixture.homeName,
      away_team: fixture.awayName,
      match_time: localIso,
      prediction: '',
      odds: 1.5,
    };

    const firstEmptyIndex = matches.findIndex(
      m => !m.home_team && !m.away_team && !m.league,
    );

    if (firstEmptyIndex >= 0) {
      const updated = [...matches];
      updated[firstEmptyIndex] = newMatch;
      setMatches(updated);
    } else {
      setMatches([...matches, newMatch]);
    }
  }

  function removeMatch(index: number) {
    if (matches.length <= 1) return;
    setMatches(matches.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateMatch(index: number, field: keyof MatchFormData, value: string | number) {
    const updatedMatches = [...matches];
    updatedMatches[index] = { ...updatedMatches[index], [field]: value };
    setMatches(updatedMatches);
  }

  const totalOdds = matches.reduce((acc, match) => acc * (match.odds || 1), 1);

  function normalizeLinkInput(value: string): string {
    const raw = value.trim();
    if (!raw) return raw;
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const matchesData = matches.map((match, index) => ({
        ...match,
        odds: Number(match.odds),
        sort_order: index + 1,
      }));

      const payload = {
        date,
        played_coupon_url: normalizeLinkInput(playedCouponUrl),
        notes,
        matches: matchesData,
      };

      if (isEdit) {
        const result = await updateCoupon(coupon.id, payload);
        if (!result.ok) {
          toast.error(result.message);
          setLoading(false);
          return;
        }
        toast.success('Kupon guncellendi.');
        router.refresh();
        setLoading(false);
      } else {
        const result = await createCoupon(payload);
        if (!result.ok) {
          toast.error(result.message);
          setLoading(false);
          return;
        }
        toast.success('Kupon olusturuldu.');
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata olustu.';
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="admin-panel p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={event => setDate(event.target.value)}
              required
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Oynanan Kupon Linki</label>
            <input
              type="text"
              value={playedCouponUrl}
              onChange={event => setPlayedCouponUrl(event.target.value)}
              required
              placeholder="ornekbahis.com/kupon/123"
              className="admin-input"
            />
          </div>
        </div>

        <div>
          <label className="admin-label">Not (opsiyonel)</label>
          <textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            placeholder="Kupon notu..."
            rows={3}
            className="admin-input resize-y min-h-[88px]"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="admin-panel p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-base">Maclar</h3>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs sm:text-sm text-primary font-bold">
              Toplam Oran: {totalOdds.toFixed(2)}
            </span>
          </div>

          <FixturePicker date={date} onSelect={addMatchFromFixture} />

          {matches.map((match, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">Mac {index + 1}</span>
                {matches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMatch(index)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"
                    aria-label={`Mac ${index + 1} sil`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="admin-label">Lig</label>
                <input
                  type="text"
                  value={match.league}
                  onChange={event => updateMatch(index, 'league', event.target.value)}
                  required
                  placeholder="Super Lig"
                  className="admin-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Ev Sahibi</label>
                  <input
                    type="text"
                    value={match.home_team}
                    onChange={event => updateMatch(index, 'home_team', event.target.value)}
                    required
                    placeholder="Galatasaray"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Deplasman</label>
                  <input
                    type="text"
                    value={match.away_team}
                    onChange={event => updateMatch(index, 'away_team', event.target.value)}
                    required
                    placeholder="Fenerbahce"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Saat</label>
                  <input
                    type="datetime-local"
                    value={match.match_time}
                    onChange={event => updateMatch(index, 'match_time', event.target.value)}
                    required
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Tahmin</label>
                  <input
                    type="text"
                    value={match.prediction}
                    onChange={event => updateMatch(index, 'prediction', event.target.value)}
                    required
                    placeholder="MS 1, 2.5 Ust..."
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Oran</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={match.odds}
                    onChange={event => updateMatch(index, 'odds', parseFloat(event.target.value) || 1)}
                    required
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMatch}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="w-4 h-4" /> Elle Mac Ekle
          </button>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="admin-btn-primary w-full py-3"
      >
        {loading
          ? (isEdit ? 'Guncelleniyor...' : 'Olusturuluyor...')
          : (isEdit ? 'Kuponu Guncelle' : 'Kuponu Olustur')}
      </button>
    </form>
  );
}
