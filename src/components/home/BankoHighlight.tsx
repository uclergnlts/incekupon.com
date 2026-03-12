import Link from 'next/link';
import { ShieldCheck, Crown } from 'lucide-react';
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
  notes?: string | null;
}

interface BankoHighlightProps {
  match: FeaturedMatch | null;
  vipChannelUrl?: string;
}

export default function BankoHighlight({ match, vipChannelUrl }: BankoHighlightProps) {
  if (!match) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6">
        <h2 className="text-lg font-bold mb-2">Gunun Bankosu</h2>
        <p className="text-sm text-slate-600">Bugun icin banko mac bulunamadi.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.7)]">
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-blue-100/60 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-100 text-primary px-2.5 py-1 rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gunun Bankosu
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-slate-900">
            {match.homeTeam} - {match.awayTeam}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {match.league} | {formatDate(match.couponDate)} | {formatTime(match.matchTime)}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs text-slate-500">Tahmin</p>
          <p className="text-3xl font-black text-primary leading-none">{match.prediction}</p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-primary">
          Oran: {match.odds}
        </span>
        {vipChannelUrl && (
          <Link
            href={vipChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Crown className="w-3.5 h-3.5" />
            VIP Kanalda Takip Et
          </Link>
        )}
      </div>

      {match.notes && (
        <p className="relative mt-3 text-xs text-slate-600 italic">{match.notes}</p>
      )}
    </section>
  );
}
