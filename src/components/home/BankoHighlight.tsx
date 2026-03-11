import { ShieldCheck } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

export interface FeaturedMatch {
  couponDate: string;
  totalOdds: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  prediction: string;
  odds: number;
}

interface BankoHighlightProps {
  match: FeaturedMatch | null;
}

export default function BankoHighlight({ match }: BankoHighlightProps) {
  if (!match) {
    return (
      <section className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold mb-2">Gunun Bankosu</h2>
        <p className="text-sm text-muted">Bugun icin banko mac bulunamadi.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-50 text-primary px-2 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gunun Bankosu
          </div>
          <h2 className="text-xl font-bold leading-tight">
            {match.homeTeam} - {match.awayTeam}
          </h2>
          <p className="text-sm text-muted mt-1">
            {match.league} - {formatDate(match.couponDate)} - {formatTime(match.matchTime)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted">Tahmin</p>
          <p className="text-2xl font-black text-primary">{match.prediction}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
          Tek mac orani: {match.odds}
        </span>
        <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-muted">
          Kupon toplam: {match.totalOdds}
        </span>
      </div>
    </section>
  );
}
