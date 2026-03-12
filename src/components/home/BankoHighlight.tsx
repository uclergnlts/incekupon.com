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
      <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black mb-2 text-slate-800">Gunun Bankosu</h2>
        <p className="text-sm font-medium text-slate-600">Bugun icin banko mac bulunamadi.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-300 bg-white p-5 sm:p-6 shadow-md transition-all hover:shadow-lg">
      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md mb-3 border border-emerald-200 shadow-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Gunun Bankosu
          </div>
          <h2 className="text-xl sm:text-2xl font-black leading-tight text-slate-900">
            {match.homeTeam} - {match.awayTeam}
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1.5 flex items-center gap-2">
            <span>{match.league}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{formatDate(match.couponDate)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{formatTime(match.matchTime)}</span>
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tahmin</p>
          <p className="text-4xl font-black text-slate-900 leading-none">{match.prediction}</p>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-2.5 pt-5 border-t border-slate-100">
        <span className="text-xs font-black px-3 py-1.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
          Oran: {match.odds}
        </span>
        {vipChannelUrl && (
          <Link
            href={vipChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-600 transition-all hover:-translate-y-0.5 px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <Crown className="w-4 h-4" />
            VIP'de Takip Et
          </Link>
        )}
      </div>

      {match.notes && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-sm font-medium text-slate-700">{match.notes}</p>
        </div>
      )}
    </section>
  );
}
