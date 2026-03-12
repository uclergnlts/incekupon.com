import type { Coupon } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import MatchRow from './MatchRow';
import { Calendar, ExternalLink } from 'lucide-react';
import CouponShareButton from './CouponShareButton';

interface CouponCardProps {
  coupon: Coupon;
  showResult?: boolean;
}

export default function CouponCard({ coupon, showResult = true }: CouponCardProps) {
  const sortedMatches = [...(coupon.matches ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_10px_35px_-30px_rgba(15,23,42,0.55)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">{formatDate(coupon.date)}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CouponShareButton coupon={coupon} />
          <span className="text-xs font-bold text-primary bg-blue-100 px-2.5 py-1 rounded-full">
            Toplam: {coupon.total_odds}
          </span>
          {showResult && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(coupon.status)}`}>
              {getStatusLabel(coupon.status)}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-1">
        {sortedMatches.map(match => (
          <MatchRow key={match.id} match={match} showResult={showResult} />
        ))}
      </div>

      {coupon.played_coupon_url && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/80">
          <a
            href={coupon.played_coupon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Oynadigimiz kupon linki
          </a>
        </div>
      )}

      {coupon.notes && (
        <div className="px-4 py-3 bg-blue-50/70 border-t border-slate-200">
          <p className="text-xs text-slate-600">{coupon.notes}</p>
        </div>
      )}
    </article>
  );
}
