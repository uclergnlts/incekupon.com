import { getCouponById } from '@/lib/queries/coupons';
import { notFound } from 'next/navigation';
import CouponForm from '@/components/admin/CouponForm';
import ResultToggle from '@/components/admin/ResultToggle';
import { formatTime } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) notFound();

  const sortedMatches = [...(coupon.matches ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Sonuç Girişi */}
      <section>
        <h1 className="text-2xl font-bold mb-6">Maç Sonuçları</h1>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {sortedMatches.map(match => (
            <div key={match.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">{match.league} - {formatTime(match.match_time)}</p>
                <p className="text-sm font-semibold">
                  {match.home_team} - {match.away_team}
                </p>
                <p className="text-xs text-primary font-medium">{match.prediction} @ {match.odds}</p>
              </div>
              <ResultToggle match={match} />
            </div>
          ))}
        </div>
      </section>

      {/* Kupon Düzenleme */}
      <section>
        <h2 className="text-lg font-bold mb-4">Kuponu Düzenle</h2>
        <CouponForm coupon={coupon} />
      </section>
    </div>
  );
}
