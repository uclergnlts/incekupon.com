import type { Match } from '@/types';
import { formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';

interface MatchRowProps {
  match: Match;
  showResult?: boolean;
}

export default function MatchRow({ match, showResult = true }: MatchRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted font-medium">{match.league}</p>
        <p className="text-sm font-semibold truncate">
          {match.home_team} - {match.away_team}
        </p>
        <p className="text-xs text-muted">{formatTime(match.match_time)}</p>
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <span className="bg-gray-100 text-foreground text-xs font-bold px-2 py-1 rounded">
          {match.prediction}
        </span>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
          {match.odds}
        </span>
        {showResult && match.result !== 'pending' && (
          <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(match.result)}`}>
            {getStatusLabel(match.result)}
          </span>
        )}
      </div>
    </div>
  );
}
