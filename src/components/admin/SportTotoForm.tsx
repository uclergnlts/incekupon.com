'use client';

import { useState } from 'react';
import { createTotoWeek, updateTotoWeek } from '@/lib/actions/spor-toto-actions';
import { toast } from 'sonner';
import type { SportTotoWeek } from '@/types';

interface TotoMatchForm {
  match_number: number;
  home_team: string;
  away_team: string;
  prediction: '1' | '0' | '2';
  actual_result: '1' | '0' | '2' | null;
}

interface SportTotoFormProps {
  week?: SportTotoWeek;
}

export default function SportTotoForm({ week }: SportTotoFormProps) {
  const isEdit = !!week;

  const [weekLabel, setWeekLabel] = useState(week?.week_label ?? '');
  const [date, setDate] = useState(week?.date ?? new Date().toISOString().split('T')[0]);
  const [matches, setMatches] = useState<TotoMatchForm[]>(() => {
    if (week?.spor_toto_matches?.length) {
      return week.spor_toto_matches
        .sort((a, b) => a.match_number - b.match_number)
        .map(m => ({
          match_number: m.match_number,
          home_team: m.home_team,
          away_team: m.away_team,
          prediction: m.prediction,
          actual_result: m.actual_result,
        }));
    }
    return Array.from({ length: 13 }, (_, i) => ({
      match_number: i + 1,
      home_team: '',
      away_team: '',
      prediction: '1' as const,
      actual_result: null,
    }));
  });
  const [loading, setLoading] = useState(false);

  function updateMatch(index: number, field: keyof TotoMatchForm, value: string | number | null) {
    const updated = [...matches];
    updated[index] = { ...updated[index], [field]: value };
    setMatches(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await updateTotoWeek(week.id, { week_label: weekLabel, date, matches });
        toast.success('Hafta güncellendi.');
      } else {
        await createTotoWeek({ week_label: weekLabel, date, matches });
        toast.success('Hafta oluşturuldu.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hafta Adı</label>
          <input
            type="text"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            required
            placeholder="2026 Hafta 10"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
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
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-3 py-2 font-medium text-muted w-8">#</th>
              <th className="text-left px-3 py-2 font-medium text-muted">Ev Sahibi</th>
              <th className="text-left px-3 py-2 font-medium text-muted">Deplasman</th>
              <th className="text-center px-3 py-2 font-medium text-muted w-20">Tahmin</th>
              {isEdit && (
                <th className="text-center px-3 py-2 font-medium text-muted w-20">Sonuç</th>
              )}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 text-muted">{match.match_number}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={match.home_team}
                    onChange={(e) => updateMatch(index, 'home_team', e.target.value)}
                    required
                    className="w-full border border-border rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={match.away_team}
                    onChange={(e) => updateMatch(index, 'away_team', e.target.value)}
                    required
                    className="w-full border border-border rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    value={match.prediction}
                    onChange={(e) => updateMatch(index, 'prediction', e.target.value)}
                    className="border border-border rounded px-2 py-1 text-sm text-center"
                  >
                    <option value="1">1</option>
                    <option value="0">0</option>
                    <option value="2">2</option>
                  </select>
                </td>
                {isEdit && (
                  <td className="px-3 py-2 text-center">
                    <select
                      value={match.actual_result ?? ''}
                      onChange={(e) => updateMatch(index, 'actual_result', e.target.value || null)}
                      className="border border-border rounded px-2 py-1 text-sm text-center"
                    >
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="0">0</option>
                      <option value="2">2</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading
          ? (isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...')
          : (isEdit ? 'Haftayı Güncelle' : 'Haftayı Oluştur')
        }
      </button>
    </form>
  );
}
