import { Skeleton } from '@/components/ui/Skeleton';

export default function SporTotoLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-8 w-52" />
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[40px_1fr_70px] items-center gap-3">
              <Skeleton className="h-5 w-6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-7 w-10 rounded-full justify-self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
