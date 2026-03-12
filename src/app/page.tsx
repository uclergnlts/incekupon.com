import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Crown, History, LineChart } from 'lucide-react';
import CouponList from '@/components/coupon/CouponList';
import BankoHighlight, { type FeaturedMatch } from '@/components/home/BankoHighlight';
import { getRecentCoupons, getTodayCoupons } from '@/lib/queries/coupons';
import { getTodayBanko } from '@/lib/queries/banko';
import { getSiteSettings } from '@/lib/queries/site-settings';
import type { Coupon, DailyBanko } from '@/types';

export const metadata: Metadata = {
  title: 'incekupon - Gunluk Bahis Kuponlari ve Tahminler',
  description: 'Her gun guncel bahis kuponlari, banko mac tavsiyeleri, gecmis kupon sonuclari ve Spor Toto tahminleri.',
  openGraph: {
    title: 'incekupon - Gunluk Bahis Kuponlari',
    description: 'Her gun guncel bahis kuponlari, banko mac tavsiyeleri ve gecmis kupon sonuclari.',
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
      <section className="relative overflow-hidden rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm">
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border border-slate-200">
              Gunluk kupon merkezi
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              Gunun kuponlari, banko maclar ve gecmis performans tek ekranda.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-4 font-medium leading-relaxed">
              Kuponlari anlik takip et, gecmis sonuclari incele ve Spor Toto performansini tek bir deneyimde gor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/gecmis-kuponlar" className="admin-btn-secondary">
              <History className="w-4 h-4" /> Gecmis Kuponlar
            </Link>
            <Link
              href={settings.vip_telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-600 transition-all hover:-translate-y-0.5 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              <Crown className="w-4 h-4" /> VIP Kanal
            </Link>
          </div>
        </div>
      </section>

      <BankoHighlight match={featuredMatch} vipChannelUrl={settings.vip_telegram_url} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Gunun Kuponlari</h2>
          <Link href="/aylik-istatistik" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            Performans <LineChart className="w-4 h-4" />
          </Link>
        </div>
        <CouponList
          coupons={todayCoupons}
          showResult={false}
          emptyMessage="Bugun icin henuz kupon eklenmedi."
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Son Kuponlar</h2>
          <Link
            href="/gecmis-kuponlar"
            className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
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
