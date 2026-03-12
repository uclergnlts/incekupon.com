'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteCoupon } from '@/lib/actions/coupon-actions';

export default function DeleteCouponButton({ couponId }: { couponId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Bu kuponu silmek istediginize emin misiniz?')) return;

    try {
      const result = await deleteCoupon(couponId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success('Kupon silindi.');
      router.refresh();
    } catch {
      toast.error('Kupon silinirken hata olustu.');
    }
  }

  return (
    <button onClick={handleDelete} className="p-1.5 text-muted hover:text-danger">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
