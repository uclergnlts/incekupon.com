export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import MonthlyWinRateChart from '@/components/stats/MonthlyWinRateChart';
import { getMonthlyCouponStats } from '@/lib/queries/coupons';

export const metadata: Metadata = {
  title: 'Aylik Istatistik',
  description: 'Ay ay kupon kazanma oranlarini ve performans ozetini goruntuleyin.',
  openGraph: {
    title: 'Aylik Istatistik - incekupon',
    description: 'Aylik kupon performansi, kazanma oranlari ve trend analizi.',
    type: 'website',
  },
};

export default async function AylikIstatistikPage() {
  const monthlyStats = await getMonthlyCouponStats(12);

  const summary = monthlyStats.reduce(
    (acc, item) => {
      acc.total += item.total;
      acc.won += item.won;
      acc.lost += item.lost;
      return acc;
    },
    { total: 0, won: 0, lost: 0 },
  );

  const decided = summary.won + summary.lost;
  const overallRate = decided > 0 ? Math.round((summary.won / decided) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Aylik Istatistik</h1>
        <p className="text-sm text-slate-600 mt-2">Son 12 ayin kupon performansi ve kazanma trendi.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4">
          <p className="text-xs text-slate-500">Toplam Kupon</p>
          <p className="text-2xl font-extrabold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4">
          <p className="text-xs text-slate-500">Kazanilan</p>
          <p className="text-2xl font-extrabold text-green-600">{summary.won}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4">
          <p className="text-xs text-slate-500">Genel Basari Orani</p>
          <p className="text-2xl font-extrabold text-primary">%{overallRate}</p>
        </div>
      </div>

      <MonthlyWinRateChart stats={monthlyStats} />
    </div>
  );
}
