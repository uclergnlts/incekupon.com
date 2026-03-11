import { getCoupons } from '@/lib/queries/coupons';
import CouponList from '@/components/coupon/CouponList';
import CouponFilters from '@/components/filters/CouponFilters';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geçmiş Kuponlar - Bahiis',
  description: 'Tüm geçmiş bahis kuponları ve sonuçları.',
};

interface Props {
  searchParams: Promise<{ status?: string; date?: string; page?: string }>;
}

export default async function GecmisKuponlarPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 10;

  const { coupons, count } = await getCoupons({
    status: params.status,
    date: params.date,
    page,
    limit,
  });

  const totalPages = Math.ceil(count / limit);

  function buildPageUrl(p: number) {
    const urlParams = new URLSearchParams();
    if (params.status) urlParams.set('status', params.status);
    if (params.date) urlParams.set('date', params.date);
    if (p > 1) urlParams.set('page', String(p));
    const qs = urlParams.toString();
    return `/gecmis-kuponlar${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Geçmiş Kuponlar</h1>

      <CouponFilters />

      <CouponList coupons={coupons} emptyMessage="Bu kriterlere uygun kupon bulunamadı." />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" /> Önceki
            </Link>
          )}
          <span className="text-sm text-muted px-3">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-gray-50"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
