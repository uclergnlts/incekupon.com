import type { Metadata } from 'next';
import MonthlyWinRateChart from '@/components/stats/MonthlyWinRateChart';
import { getMonthlyCouponStats } from '@/lib/queries/coupons';

export const metadata: Metadata = {
  title: 'Aylik Istatistik - incekupon',
  description: 'Ay ay kupon kazanma oranlarini ve performans ozetini goruntuleyin.',
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Aylik Istatistik</h1>
        <p className="text-sm text-muted">
          Son 12 ayin kupon performansi ve kazanma oranlari.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted">Toplam Kupon</p>
          <p className="text-2xl font-bold">{summary.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted">Kazanilan</p>
          <p className="text-2xl font-bold text-success">{summary.won}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted">Genel Basari Orani</p>
          <p className="text-2xl font-bold text-primary">%{overallRate}</p>
        </div>
      </div>

      <MonthlyWinRateChart stats={monthlyStats} />
    </div>
  );
}
