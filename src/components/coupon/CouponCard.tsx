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
    <article className="group overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">{formatDate(coupon.date)}</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <CouponShareButton coupon={coupon} />
          <span className="text-xs font-black text-white bg-slate-800 px-3 py-1.5 rounded-md shadow-sm border border-slate-700">
            Toplam: {coupon.total_odds}
          </span>
          {showResult && (
            <span className={`text-xs font-black px-3 py-1.5 rounded-md shadow-sm border ${getStatusColor(coupon.status)}`}>
              {getStatusLabel(coupon.status)}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-2">
        {sortedMatches.map(match => (
          <MatchRow key={match.id} match={match} showResult={showResult} />
        ))}
      </div>

      {coupon.played_coupon_url && (
        <div className="px-5 py-3.5 border-t border-slate-300 bg-slate-50">
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
        <div className="px-5 py-3.5 bg-[#fefce8] border-t border-[#fef08a] border-opacity-60">
          <p className="text-sm font-medium text-slate-700">{coupon.notes}</p>
        </div>
      )}
    </article>
  );
}
