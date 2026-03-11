import type { Coupon } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import MatchRow from './MatchRow';
import { Calendar } from 'lucide-react';

interface CouponCardProps {
  coupon: Coupon;
  showResult?: boolean;
}

export default function CouponCard({ coupon, showResult = true }: CouponCardProps) {
  const sortedMatches = [...(coupon.matches ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted" />
          <span className="text-sm font-medium">{formatDate(coupon.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
            Toplam: {coupon.total_odds}
          </span>
          {showResult && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(coupon.status)}`}>
              {getStatusLabel(coupon.status)}
            </span>
          )}
        </div>
      </div>

      {/* Matches */}
      <div className="px-4">
        {sortedMatches.map(match => (
          <MatchRow key={match.id} match={match} showResult={showResult} />
        ))}
      </div>

      {/* Notes */}
      {coupon.notes && (
        <div className="px-4 py-2 bg-blue-50 border-t border-border">
          <p className="text-xs text-muted">{coupon.notes}</p>
        </div>
      )}
    </div>
  );
}
