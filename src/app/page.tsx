import { getTodayCoupons, getRecentCoupons } from '@/lib/queries/coupons';
import CouponList from '@/components/coupon/CouponList';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const [todayCoupons, recentCoupons] = await Promise.all([
    getTodayCoupons(),
    getRecentCoupons(5),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Günün Kuponları */}
      <section>
        <h2 className="text-lg font-bold mb-4">Günün Kuponları</h2>
        <CouponList
          coupons={todayCoupons}
          showResult={false}
          emptyMessage="Bugün için henüz kupon eklenmedi."
        />
      </section>

      {/* Son Kuponlar */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Son Kuponlar</h2>
          <Link
            href="/gecmis-kuponlar"
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
          >
            Tümünü gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <CouponList
          coupons={recentCoupons}
          emptyMessage="Henüz geçmiş kupon bulunmuyor."
        />
      </section>
    </div>
  );
}
