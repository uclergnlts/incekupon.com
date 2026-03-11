import { getCoupons, getCouponStats } from '@/lib/queries/coupons';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DeleteCouponButton from '@/components/admin/DeleteCouponButton';

export default async function AdminDashboard() {
  const [{ coupons }, stats] = await Promise.all([
    getCoupons({ limit: 20 }),
    getCouponStats(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link
          href="/admin/kupon/yeni"
          className="flex items-center gap-2 bg-primary text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Yeni Kupon
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
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
          <p className="text-xs text-muted">Oran</p>
        </div>
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted">Tarih</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Maç</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Oran</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Durum</th>
                <th className="text-right px-4 py-3 font-medium text-muted">İşlem</th>
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
          <div className="text-center py-8 text-muted">Henüz kupon eklenmedi.</div>
        )}
      </div>
    </div>
  );
}
