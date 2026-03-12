import type { Match } from '@/types';
import { formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';

interface MatchRowProps {
  match: Match;
  showResult?: boolean;
}

export default function MatchRow({ match, showResult = true }: MatchRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{match.league}</p>
        <p className="text-sm font-bold truncate text-slate-900 mt-0.5">
          {match.home_team} - {match.away_team}
        </p>
        <p className="text-xs text-slate-500">{formatTime(match.match_time)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
          {match.prediction}
        </span>
        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
          {match.odds}
        </span>
        {showResult && match.result !== 'pending' && (
          <span className={`text-xs font-black px-2.5 py-1 rounded-md shadow-sm border ${getStatusColor(match.result)}`}>
            {getStatusLabel(match.result)}
          </span>
        )}
      </div>
    </div>
  );
}
