'use client';

import { useState } from 'react';
import { createCoupon, updateCoupon } from '@/lib/actions/coupon-actions';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Coupon, Match } from '@/types';

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
  odds: 1.50,
};

interface CouponFormProps {
  coupon?: Coupon;
}

export default function CouponForm({ coupon }: CouponFormProps) {
  const isEdit = !!coupon;

  const [date, setDate] = useState(coupon?.date ?? new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(coupon?.notes ?? '');
  const [matches, setMatches] = useState<MatchFormData[]>(() => {
    if (coupon?.matches?.length) {
      return coupon.matches
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(m => ({
          league: m.league,
          home_team: m.home_team,
          away_team: m.away_team,
          match_time: m.match_time.slice(0, 16), // datetime-local format
          prediction: m.prediction,
          odds: m.odds,
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
    setMatches(matches.filter((_, i) => i !== index));
  }

  function updateMatch(index: number, field: keyof MatchFormData, value: string | number) {
    const updated = [...matches];
    updated[index] = { ...updated[index], [field]: value };
    setMatches(updated);
  }

  const totalOdds = matches.reduce((acc, m) => acc * (m.odds || 1), 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const matchesData = matches.map((m, i) => ({
        ...m,
        odds: Number(m.odds),
        sort_order: i + 1,
      }));

      if (isEdit) {
        await updateCoupon(coupon.id, { date, notes, matches: matchesData });
        toast.success('Kupon güncellendi.');
      } else {
        await createCoupon({ date, notes, matches: matchesData });
        toast.success('Kupon oluşturuldu.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tarih</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Not (opsiyonel)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kupon notu..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Maçlar</h3>
          <span className="text-sm text-primary font-bold">
            Toplam Oran: {totalOdds.toFixed(2)}
          </span>
        </div>

        {matches.map((match, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Maç {index + 1}</span>
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
                onChange={(e) => updateMatch(index, 'league', e.target.value)}
                required
                placeholder="Süper Lig"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Ev Sahibi</label>
                <input
                  type="text"
                  value={match.home_team}
                  onChange={(e) => updateMatch(index, 'home_team', e.target.value)}
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
                  onChange={(e) => updateMatch(index, 'away_team', e.target.value)}
                  required
                  placeholder="Fenerbahçe"
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
                  onChange={(e) => updateMatch(index, 'match_time', e.target.value)}
                  required
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Tahmin</label>
                <input
                  type="text"
                  value={match.prediction}
                  onChange={(e) => updateMatch(index, 'prediction', e.target.value)}
                  required
                  placeholder="MS 1, 2.5 Üst..."
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
                  onChange={(e) => updateMatch(index, 'odds', parseFloat(e.target.value) || 1)}
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
          <Plus className="w-4 h-4" /> Maç Ekle
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading
          ? (isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...')
          : (isEdit ? 'Kuponu Güncelle' : 'Kuponu Oluştur')
        }
      </button>
    </form>
  );
}
