'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { upsertBanko, deleteBanko } from '@/lib/actions/banko-actions';
import FixturePicker from './FixturePicker';
import type { FixtureForPicker } from '@/lib/actions/fixture-actions';
import type { DailyBanko } from '@/types';
import { Trash2 } from 'lucide-react';

interface BankoFormProps {
  banko?: DailyBanko | null;
}

export default function BankoForm({ banko }: BankoFormProps) {
  const router = useRouter();

  const [date, setDate] = useState(banko?.date ?? new Date().toISOString().split('T')[0]);
  const [league, setLeague] = useState(banko?.league ?? '');
  const [homeTeam, setHomeTeam] = useState(banko?.home_team ?? '');
  const [awayTeam, setAwayTeam] = useState(banko?.away_team ?? '');
  const [matchTime, setMatchTime] = useState(banko?.match_time?.slice(0, 16) ?? '');
  const [prediction, setPrediction] = useState(banko?.prediction ?? '');
  const [odds, setOdds] = useState(banko?.odds ?? 1.5);
  const [notes, setNotes] = useState(banko?.notes ?? '');
  const [loading, setLoading] = useState(false);

  function handleFixtureSelect(fixture: FixtureForPicker) {
    const t = new Date(fixture.date);
    const localIso = new Date(t.getTime() - t.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setLeague(fixture.leagueKey);
    setHomeTeam(fixture.homeName);
    setAwayTeam(fixture.awayName);
    setMatchTime(localIso);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await upsertBanko({
        date,
        league,
        home_team: homeTeam,
        away_team: awayTeam,
        match_time: matchTime,
        prediction,
        odds: Number(odds),
        notes,
      });

      if (!result.ok) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success('Gunun bankosu kaydedildi.');
      router.refresh();
      setLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata olustu.';
      toast.error(message);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Gunun bankosunu silmek istediginize emin misiniz?')) return;
    setLoading(true);

    try {
      const result = await deleteBanko(date);
      if (!result.ok) {
        toast.error(result.message);
        setLoading(false);
        return;
      }
      toast.success('Banko silindi.');
      setLeague('');
      setHomeTeam('');
      setAwayTeam('');
      setMatchTime('');
      setPrediction('');
      setOdds(1.5);
      setNotes('');
      router.refresh();
      setLoading(false);
    } catch {
      toast.error('Silme islemi basarisiz.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Tarih</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Fixture Picker */}
      <FixturePicker date={date} onSelect={handleFixtureSelect} />

      <div>
        <label className="block text-sm font-medium mb-1">Lig</label>
        <input
          type="text"
          value={league}
          onChange={e => setLeague(e.target.value)}
          required
          placeholder="Super Lig"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ev Sahibi</label>
          <input
            type="text"
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            required
            placeholder="Galatasaray"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deplasman</label>
          <input
            type="text"
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            required
            placeholder="Fenerbahce"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Saat</label>
          <input
            type="datetime-local"
            value={matchTime}
            onChange={e => setMatchTime(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tahmin</label>
          <input
            type="text"
            value={prediction}
            onChange={e => setPrediction(e.target.value)}
            required
            placeholder="MS 1"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Oran</label>
          <input
            type="number"
            step="0.01"
            min="1"
            value={odds}
            onChange={e => setOdds(parseFloat(e.target.value) || 1)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Not (opsiyonel)</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Banko notu..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white font-medium rounded-lg px-4 py-3 text-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Kaydediliyor...' : 'Bankoyu Kaydet'}
        </button>
        {banko && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium border border-danger text-danger rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        )}
      </div>
    </form>
  );
}
