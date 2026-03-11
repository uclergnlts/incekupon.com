import type { Coupon } from '@/types';
import CouponCard from './CouponCard';

interface CouponListProps {
  coupons: Coupon[];
  showResult?: boolean;
  emptyMessage?: string;
}

export default function CouponList({ coupons, showResult = true, emptyMessage = 'Kupon bulunamadı.' }: CouponListProps) {
  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coupons.map(coupon => (
        <CouponCard key={coupon.id} coupon={coupon} showResult={showResult} />
      ))}
    </div>
  );
}
