'use client';

import { useRouter, useSearchParams } from 'next/navigation';

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

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <select
        value={currentStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="all">Tüm Kuponlar</option>
        <option value="won">Kazananlar</option>
        <option value="lost">Kaybedenler</option>
        <option value="pending">Bekleyenler</option>
      </select>

      <input
        type="date"
        value={currentDate}
        onChange={(e) => updateFilter('date', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      />

      {(currentStatus !== 'all' || currentDate) && (
        <button
          onClick={() => router.push('/gecmis-kuponlar')}
          className="text-sm text-primary hover:text-primary-dark"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );
}
