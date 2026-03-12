import { getCoupons, getCouponStats, getMonthlyCouponStats } from '@/lib/queries/coupons';
import { getBankoByDate } from '@/lib/queries/banko';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Edit, ExternalLink, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import DeleteCouponButton from '@/components/admin/DeleteCouponButton';

export default async function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [{ coupons }, stats, monthlyStats, todayBanko] = await Promise.all([
    getCoupons({ limit: 20 }),
    getCouponStats(),
    getMonthlyCouponStats(3),
    getBankoByDate(today),
  ]);

  const currentMonth = monthlyStats[monthlyStats.length - 1];
  const prevMonth = monthlyStats[monthlyStats.length - 2];
  const trend = currentMonth && prevMonth
    ? currentMonth.winRate - prevMonth.winRate
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/banko"
            className="flex items-center gap-2 border border-primary text-primary font-medium rounded-lg px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Banko
          </Link>
          <Link
            href="/admin/kupon/yeni"
            className="flex items-center gap-2 bg-primary text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Yeni Kupon
          </Link>
        </div>
      </div>

      {/* Today's Banko Status */}
      <Link
        href="/admin/banko"
        className={`block rounded-xl border p-4 transition-colors ${
          todayBanko
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className={`w-5 h-5 ${todayBanko ? 'text-primary' : 'text-yellow-600'}`} />
          {todayBanko ? (
            <div>
              <p className="text-sm font-medium text-primary">
                Gunun Bankosu: {todayBanko.home_team} - {todayBanko.away_team}
              </p>
              <p className="text-xs text-muted">
                {todayBanko.league} | {todayBanko.prediction} @ {todayBanko.odds}
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-yellow-800">
              Bugun icin banko eklenmedi — tiklayarak ekleyin
            </p>
          )}
        </div>
      </Link>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted">Toplam</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-success">{stats.won}</p>
          <p className="text-xs text-muted">Kazanan</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-danger">{stats.lost}</p>
          <p className="text-xs text-muted">Kaybeden</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-primary">%{stats.winRate}</p>
          <p className="text-xs text-muted">Basari Orani</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-danger" />
            )}
            <p className={`text-2xl font-bold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          </div>
          <p className="text-xs text-muted">Aylik Trend</p>
        </div>
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted">Tarih</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Mac</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Oran</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Durum</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Link</th>
                <th className="text-right px-4 py-3 font-medium text-muted">Islem</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">{formatDate(coupon.date)}</td>
                  <td className="px-4 py-3 text-center">{coupon.matches?.length ?? 0}</td>
                  <td className="px-4 py-3 text-center font-medium">{coupon.total_odds}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(coupon.status)}`}>
                      {getStatusLabel(coupon.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {coupon.played_coupon_url ? (
                      <a
                        href={coupon.played_coupon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark"
                        title={coupon.played_coupon_url}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/kupon/${coupon.id}`}
                        className="p-1.5 text-muted hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteCouponButton couponId={coupon.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="text-center py-8 text-muted">Henuz kupon eklenmedi.</div>
        )}
      </div>
    </div>
  );
}
