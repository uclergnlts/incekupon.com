import type { CSSProperties } from 'react';
import type { Coupon } from '@/types';
import CouponCard from './CouponCard';

interface CouponListProps {
  coupons: Coupon[];
  showResult?: boolean;
  emptyMessage?: string;
}

export default function CouponList({
  coupons,
  showResult = true,
  emptyMessage = 'Kupon bulunamadi.',
}: CouponListProps) {
  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p>{emptyMessage}</p>
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
