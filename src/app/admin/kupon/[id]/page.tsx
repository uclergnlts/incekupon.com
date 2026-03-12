import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { formatTime, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { getCouponById } from '@/lib/queries/coupons';
import CouponForm from '@/components/admin/CouponForm';
import ResultToggle from '@/components/admin/ResultToggle';
import SyncCouponResultsButton from '@/components/admin/SyncCouponResultsButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  const sortedMatches = [...(coupon.matches ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="admin-shell max-w-3xl space-y-8">
      {/* Coupon Info Summary */}
      <div className="admin-panel p-4 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-xs text-muted">Tarih</p>
          <p className="text-sm font-semibold">{formatDate(coupon.date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Toplam Oran</p>
          <p className="text-sm font-bold text-primary">{coupon.total_odds}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Durum</p>
          <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(coupon.status)}`}>
            {getStatusLabel(coupon.status)}
          </span>
        </div>
        {coupon.played_coupon_url && (
          <div>
            <p className="text-xs text-muted">Kupon Linki</p>
            <a
              href={coupon.played_coupon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark"
            >
              <ExternalLink className="w-4 h-4" />
              Linki Ac
            </a>
          </div>
        )}
      </div>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="admin-title">Mac Sonuclari</h1>
          <SyncCouponResultsButton couponId={coupon.id} />
        </div>

        <div className="admin-table-wrap">
          {sortedMatches.map(match => (
            <div
              key={match.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">
                  {match.league} - {formatTime(match.match_time)}
                </p>
                <p className="text-sm font-semibold">
                  {match.home_team} - {match.away_team}
                </p>
                <p className="text-xs text-primary font-medium">
                  {match.prediction} @ {match.odds}
                </p>
              </div>
              <ResultToggle match={match} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Kuponu Duzenle</h2>
        <CouponForm coupon={coupon} />
      </section>
    </div>
  );
}
