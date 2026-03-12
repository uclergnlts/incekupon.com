import { getCoupons } from '@/lib/queries/coupons';
import CouponList from '@/components/coupon/CouponList';
import CouponFilters from '@/components/filters/CouponFilters';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gecmis Kuponlar',
  description: 'Tum gecmis bahis kuponlari, sonuclari ve kazanma oranlari.',
  openGraph: {
    title: 'Gecmis Kuponlar - incekupon',
    description: 'Tum gecmis bahis kuponlari ve sonuclari.',
    type: 'website',
  },
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Arsiv</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Gecmis Kuponlar</h1>
        <p className="text-sm text-slate-600 mt-2">Filtreleyerek tum gecmis kupon performansini detayli inceleyin.</p>
      </section>

      <CouponFilters />

      <CouponList coupons={coupons} emptyMessage="Bu kriterlere uygun kupon bulunamadi." />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="admin-btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" /> Onceki
            </Link>
          )}
          <span className="text-sm text-slate-600 px-3 py-2">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="admin-btn-secondary"
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
