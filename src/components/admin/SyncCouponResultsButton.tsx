'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { syncCouponResultsFromApiFootball } from '@/lib/actions/coupon-actions';

interface SyncCouponResultsButtonProps {
  couponId: string;
}

export default function SyncCouponResultsButton({ couponId }: SyncCouponResultsButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      const result = await syncCouponResultsFromApiFootball(couponId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={isPending}
      className="admin-btn-secondary w-full sm:w-auto"
    >
      <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Senkronize Ediliyor...' : 'API-Football Sonuclari Cek'}
    </button>
  );
}
