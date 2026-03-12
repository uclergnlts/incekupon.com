import Link from 'next/link';
import { Edit, ExternalLink, Plus } from 'lucide-react';
import DeleteCouponButton from '@/components/admin/DeleteCouponButton';
import { getCoupons, getCouponStats } from '@/lib/queries/coupons';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default async function AdminKuponlarPage() {
  const [{ coupons }, stats] = await Promise.all([
    getCoupons({ limit: 30 }),
    getCouponStats(),
  ]);

  return (
    <div className="admin-shell space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="admin-title">Kupon Yonetimi</h1>
          <p className="admin-subtitle">Tum kuponlari goruntuleyin, duzenleyin veya silin.</p>
        </div>
        <Link href="/admin/kupon/yeni" className="admin-btn-primary">
          <Plus className="w-4 h-4" /> Yeni Kupon
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-panel p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted">Toplam</p>
        </div>
        <div className="admin-panel p-3 text-center">
          <p className="text-2xl font-bold text-success">{stats.won}</p>
          <p className="text-xs text-muted">Kazanan</p>
        </div>
        <div className="admin-panel p-3 text-center">
          <p className="text-2xl font-bold text-danger">{stats.lost}</p>
          <p className="text-xs text-muted">Kaybeden</p>
        </div>
        <div className="admin-panel p-3 text-center">
          <p className="text-2xl font-bold text-primary">%{stats.winRate}</p>
          <p className="text-xs text-muted">Basari</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
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
                        className="p-2 rounded-lg text-muted hover:bg-slate-100 hover:text-primary"
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
