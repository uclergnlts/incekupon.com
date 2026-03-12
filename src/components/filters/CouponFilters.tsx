'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw } from 'lucide-react';

export default function CouponFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentDate = searchParams.get('date') || '';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/gecmis-kuponlar?${params.toString()}`);
  }

  const hasFilter = currentStatus !== 'all' || !!currentDate;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <p className="text-sm font-semibold text-slate-700">Filtreler</p>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <select
          value={currentStatus}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="admin-input"
        >
          <option value="all">Tum Kuponlar</option>
          <option value="won">Kazananlar</option>
          <option value="lost">Kaybedenler</option>
          <option value="pending">Bekleyenler</option>
        </select>

        <input
          type="date"
          value={currentDate}
          onChange={(e) => updateFilter('date', e.target.value)}
          className="admin-input"
        />

        {hasFilter && (
          <button
            onClick={() => router.push('/gecmis-kuponlar')}
            className="admin-btn-secondary whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" /> Temizle
          </button>
        )}
      </div>
    </div>
  );
}
