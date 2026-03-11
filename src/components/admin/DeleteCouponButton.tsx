'use client';

import { deleteCoupon } from '@/lib/actions/coupon-actions';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteCouponButton({ couponId }: { couponId: string }) {
  async function handleDelete() {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;

    try {
      await deleteCoupon(couponId);
      toast.success('Kupon silindi.');
    } catch {
      toast.error('Kupon silinirken hata oluştu.');
    }
  }

  return (
    <button onClick={handleDelete} className="p-1.5 text-muted hover:text-danger">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
