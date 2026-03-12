import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CouponList from '@/components/coupon/CouponList';
import BankoHighlight, { type FeaturedMatch } from '@/components/home/BankoHighlight';
import { getRecentCoupons, getTodayCoupons } from '@/lib/queries/coupons';
import type { Coupon } from '@/types';

export const metadata: Metadata = {
  title: 'incekupon - Gunluk Bahis Kuponlari ve Tahminler',
  description: 'Her gun guncel bahis kuponlari, banko mac tavsiyeleri, gecmis kupon sonuclari ve Spor Toto tahminleri.',
  openGraph: {
    title: 'incekupon - Gunluk Bahis Kuponlari',
    description: 'Her gun guncel bahis kuponlari, banko mac tavsiyeleri ve gecmis kupon sonuclari.',
    type: 'website',
  },
};

function pickFeaturedMatch(coupons: Coupon[]): FeaturedMatch | null {
  const candidates = coupons.flatMap(coupon =>
    (coupon.matches ?? []).map(match => ({
      couponDate: coupon.date,
      totalOdds: coupon.total_odds,
      league: match.league,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      matchTime: match.match_time,
      prediction: match.prediction,
      odds: match.odds,
    })),
  );

  if (candidates.length === 0) return null;

  return [...candidates].sort((a, b) => a.odds - b.odds)[0];
}

export default async function HomePage() {
  const [todayCoupons, recentCoupons] = await Promise.all([
    getTodayCoupons(),
    getRecentCoupons(5),
  ]);

  const featuredMatch = pickFeaturedMatch(todayCoupons);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <BankoHighlight match={featuredMatch} />

      <section>
        <h2 className="text-lg font-bold mb-4">Gunun Kuponlari</h2>
        <CouponList
          coupons={todayCoupons}
          showResult={false}
          emptyMessage="Bugun icin henuz kupon eklenmedi."
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Son Kuponlar</h2>
          <Link
            href="/gecmis-kuponlar"
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
          >
            Tumunu gor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <CouponList
          coupons={recentCoupons}
          emptyMessage="Henuz gecmis kupon bulunmuyor."
        />
      </section>
    </div>
  );
}
