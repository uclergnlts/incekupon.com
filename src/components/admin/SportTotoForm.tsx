'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTotoWeek, updateTotoWeek } from '@/lib/actions/spor-toto-actions';
import { normalizePrediction, splitPrediction } from '@/lib/spor-toto-prediction';
import type { SportTotoWeek, TotoOutcome, TotoPrediction } from '@/types';

const WEEK_MATCH_COUNT = 15;
const PREDICTION_OPTIONS: TotoOutcome[] = ['1', '0', '2'];

interface TotoMatchForm {
  match_number: number;
  home_team: string;
  away_team: string;
  prediction: TotoPrediction;
  actual_result: TotoOutcome | null;
}

interface SportTotoFormProps {
  week?: SportTotoWeek;
}

function buildInitialMatches(week?: SportTotoWeek): TotoMatchForm[] {
  const byNumber = new Map<number, TotoMatchForm>();

  for (const match of week?.spor_toto_matches ?? []) {
    byNumber.set(match.match_number, {
      match_number: match.match_number,
      home_team: match.home_team,
      away_team: match.away_team,
      prediction: normalizePrediction(match.prediction),
      actual_result: match.actual_result,
    });
  }

  return Array.from({ length: WEEK_MATCH_COUNT }, (_, index) => {
    const number = index + 1;
    return (
      byNumber.get(number) ?? {
        match_number: number,
        home_team: '',
        away_team: '',
        prediction: '1',
        actual_result: null,
      }
    );
  });
}

export default function SportTotoForm({ week }: SportTotoFormProps) {
  const isEdit = !!week;
  const router = useRouter();

  const [weekLabel, setWeekLabel] = useState(week?.week_label ?? '');
  const [date, setDate] = useState(week?.date ?? new Date().toISOString().split('T')[0]);
  const [matches, setMatches] = useState<TotoMatchForm[]>(() => buildInitialMatches(week));
  const [loading, setLoading] = useState(false);

  function updateMatch(index: number, field: keyof TotoMatchForm, value: string | number | null) {
    const updated = [...matches];
    updated[index] = { ...updated[index], [field]: value };
    setMatches(updated);
  }

  function togglePrediction(index: number, option: TotoOutcome) {
    const current = matches[index];
    const selected = splitPrediction(current.prediction);
    const hasOption = selected.includes(option);

    if (hasOption && selected.length === 1) return;

    const next = hasOption
      ? selected.filter(item => item !== option)
      : [...selected, option];

    updateMatch(index, 'prediction', normalizePrediction(next));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const result = await updateTotoWeek(week.id, {
          week_label: weekLabel,
          date,
          matches,
        });

        if (!result.ok) {
          toast.error(result.message);
          setLoading(false);
          return;
        }

        toast.success('Hafta guncellendi.');
        router.refresh();
        setLoading(false);
        return;
      }

      const result = await createTotoWeek({
        week_label: weekLabel,
        date,
        matches,
      });

      if (!result.ok) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success('Hafta olusturuldu.');
      router.push('/admin/spor-toto');
      router.refresh();
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
          <label className="block text-sm font-medium mb-1">Hafta Adi</label>
          <input
            type="text"
            value={weekLabel}
            onChange={event => setWeekLabel(event.target.value)}
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
            onChange={event => setDate(event.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="text-sm text-muted">
        Haftalik mac sayisi: <span className="font-semibold text-foreground">{WEEK_MATCH_COUNT}</span>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-3 py-2 font-medium text-muted w-8">#</th>
              <th className="text-left px-3 py-2 font-medium text-muted">Ev Sahibi</th>
              <th className="text-left px-3 py-2 font-medium text-muted">Deplasman</th>
              <th className="text-center px-3 py-2 font-medium text-muted w-48">Tahmin (Coklu)</th>
              {isEdit && (
                <th className="text-center px-3 py-2 font-medium text-muted w-20">Sonuc</th>
              )}
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => {
              const selected = splitPrediction(match.prediction);

              return (
                <tr key={match.match_number} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-muted">{match.match_number}</td>

                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={match.home_team}
                      onChange={event => updateMatch(index, 'home_team', event.target.value)}
                      required
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={match.away_team}
                      onChange={event => updateMatch(index, 'away_team', event.target.value)}
                      required
                      className="w-full border border-border rounded px-2 py-1 text-sm"
                    />
                  </td>

                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex rounded-lg border border-border overflow-hidden">
                      {PREDICTION_OPTIONS.map(option => {
                        const isActive = selected.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => togglePrediction(index, option)}
                            className={`px-3 py-1.5 text-sm font-semibold border-r last:border-r-0 border-border transition-colors ${
                              isActive
                                ? 'bg-primary text-white'
                                : 'bg-white text-foreground hover:bg-gray-50'
                            }`}
                            aria-pressed={isActive}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {isEdit && (
                    <td className="px-3 py-2 text-center">
                      <select
                        value={match.actual_result ?? ''}
                        onChange={event => updateMatch(index, 'actual_result', event.target.value || null)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-medium rounded-lg px-4 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading
          ? (isEdit ? 'Guncelleniyor...' : 'Olusturuluyor...')
          : (isEdit ? 'Haftayi Guncelle' : 'Haftayi Olustur')}
      </button>
    </form>
  );
}
