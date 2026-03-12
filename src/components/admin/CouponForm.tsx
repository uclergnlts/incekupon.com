'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createCoupon, updateCoupon } from '@/lib/actions/coupon-actions';
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
        await updateCoupon(coupon.id, payload);
        toast.success('Kupon guncellendi.');
      } else {
        await createCoupon(payload);
        toast.success('Kupon olusturuldu.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata olustu.';
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih</label>
          <input
            type="date"
            value={date}
            onChange={event => setDate(event.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Oynanan Kupon Linki</label>
          <input
            type="text"
            value={playedCouponUrl}
            onChange={event => setPlayedCouponUrl(event.target.value)}
            required
            placeholder="ornekbahis.com/kupon/123"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Not (opsiyonel)</label>
        <input
          type="text"
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="Kupon notu..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Maclar</h3>
          <span className="text-sm text-primary font-bold">Toplam Oran: {totalOdds.toFixed(2)}</span>
        </div>

        {matches.map((match, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Mac {index + 1}</span>
              {matches.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMatch(index)}
                  className="p-1 text-muted hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Lig</label>
              <input
                type="text"
                value={match.league}
                onChange={event => updateMatch(index, 'league', event.target.value)}
                required
                placeholder="Super Lig"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Ev Sahibi</label>
                <input
                  type="text"
                  value={match.home_team}
                  onChange={event => updateMatch(index, 'home_team', event.target.value)}
                  required
                  placeholder="Galatasaray"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Deplasman</label>
                <input
                  type="text"
                  value={match.away_team}
                  onChange={event => updateMatch(index, 'away_team', event.target.value)}
                  required
                  placeholder="Fenerbahce"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Saat</label>
                <input
                  type="datetime-local"
                  value={match.match_time}
                  onChange={event => updateMatch(index, 'match_time', event.target.value)}
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Tahmin</label>
                <input
                  type="text"
                  value={match.prediction}
                  onChange={event => updateMatch(index, 'prediction', event.target.value)}
                  required
                  placeholder="MS 1, 2.5 Ust..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Oran</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={match.odds}
                  onChange={event => updateMatch(index, 'odds', parseFloat(event.target.value) || 1)}
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMatch}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" /> Mac Ekle
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading
          ? (isEdit ? 'Guncelleniyor...' : 'Olusturuluyor...')
          : (isEdit ? 'Kuponu Guncelle' : 'Kuponu Olustur')}
      </button>
    </form>
  );
}
