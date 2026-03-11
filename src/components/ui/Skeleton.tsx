import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton-shimmer rounded-lg', className)} />
  );
}

export function CouponCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-border">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
        </div>
      </div>
      <div className="px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex gap-2 ml-3">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CouponListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CouponCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
