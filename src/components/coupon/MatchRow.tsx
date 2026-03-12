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
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">{match.league}</p>
        <p className="text-sm font-semibold truncate text-slate-900">
          {match.home_team} - {match.away_team}
        </p>
        <p className="text-xs text-slate-500">{formatTime(match.match_time)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded-full">
          {match.prediction}
        </span>
        <span className="bg-blue-100 text-primary text-xs font-bold px-2 py-1 rounded-full">
          {match.odds}
        </span>
        {showResult && match.result !== 'pending' && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(match.result)}`}>
            {getStatusLabel(match.result)}
          </span>
        )}
      </div>
    </div>
  );
}
