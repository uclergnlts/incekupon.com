import { CouponListSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <section className="space-y-4">
        <Skeleton className="h-7 w-44" />
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-80 max-w-full" />
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <CouponListSkeleton count={2} />
      </section>

      <section className="space-y-4">
        <Skeleton className="h-7 w-36" />
        <CouponListSkeleton count={2} />
      </section>
    </div>
  );
}
