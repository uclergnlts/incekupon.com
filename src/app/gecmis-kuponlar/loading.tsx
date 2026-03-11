import { CouponListSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function GecmisKuponlarLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <CouponListSkeleton count={3} />
    </div>
  );
}
