import type { CSSProperties } from 'react';
import type { Coupon } from '@/types';
import { Search } from 'lucide-react';
import CouponCard from './CouponCard';

interface CouponListProps {
  coupons: Coupon[];
  showResult?: boolean;
  emptyMessage?: string;
}

export default function CouponList({
  coupons,
  showResult = true,
  emptyMessage = 'Kupon bulunamadı.',
}: CouponListProps) {
  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 px-4 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-700">{emptyMessage}</p>
        <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs">
          Şu an maç analizleri devam ediyor. Lütfen daha sonra tekrar kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coupons.map((coupon, index) => (
        <div
          key={coupon.id}
          className="card-enter"
          style={{ '--stagger': `${index * 70}ms` } as CSSProperties}
        >
          <CouponCard coupon={coupon} showResult={showResult} />
        </div>
      ))}
    </div>
  );
}
