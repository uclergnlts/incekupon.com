export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LineChart } from 'lucide-react';
import CouponList from '@/components/coupon/CouponList';
import BankoHighlight, { type FeaturedMatch } from '@/components/home/BankoHighlight';
import { getRecentCoupons, getTodayCoupons } from '@/lib/queries/coupons';
import { getTodayBanko } from '@/lib/queries/banko';
import { getSiteSettings } from '@/lib/queries/site-settings';
import type { Coupon, DailyBanko } from '@/types';

export const metadata: Metadata = {
  title: 'İncekupon - Günlük Bahis Kuponları ve Tahminler',
  description: 'Her gün güncel bahis kuponları, banko maç tavsiyeleri, geçmiş kupon sonuçları ve Spor Toto tahminleri.',
  openGraph: {
    title: 'İncekupon - Günlük Bahis Kuponları',
    description: 'Her gün güncel bahis kuponları, banko maç tavsiyeleri ve geçmiş kupon sonuçları.',
    type: 'website',
  },
};

function bankoToFeaturedMatch(banko: DailyBanko): FeaturedMatch {
  return {
    couponDate: banko.date,
    totalOdds: banko.odds,
    league: banko.league,
    homeTeam: banko.home_team,
    awayTeam: banko.away_team,
    matchTime: banko.match_time,
    prediction: banko.prediction,
    odds: banko.odds,
    notes: banko.notes,
  };
}

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
  const [todayCoupons, recentCoupons, todayBanko, settings] = await Promise.all([
    getTodayCoupons(),
    getRecentCoupons(5),
    getTodayBanko(),
    getSiteSettings(),
  ]);

  const featuredMatch = todayBanko
    ? bankoToFeaturedMatch(todayBanko)
    : pickFeaturedMatch(todayCoupons);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <BankoHighlight match={featuredMatch} vipChannelUrl={settings.vip_telegram_url} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Günün Kuponları</h2>
          <Link href="/aylik-istatistik" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            Performans <LineChart className="w-4 h-4" />
          </Link>
        </div>
        <CouponList
          coupons={todayCoupons}
          showResult={false}
          emptyMessage="Bugün için henüz kupon eklenmedi."
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Son Kuponlar</h2>
          <Link
            href="/gecmis-kuponlar"
            className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
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
