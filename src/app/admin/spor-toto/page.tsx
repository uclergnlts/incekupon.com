import { getTotoWeeks } from '@/lib/queries/spor-toto';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';

export default async function AdminSporTotoPage() {
  const weeks = await getTotoWeeks();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Spor Toto Yönetimi</h1>
        <Link
          href="/admin/spor-toto/yeni"
          className="flex items-center gap-2 bg-primary text-white font-medium rounded-lg px-4 py-2 text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Yeni Hafta
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted">Hafta</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Tarih</th>
              <th className="text-center px-4 py-3 font-medium text-muted">Durum</th>
              <th className="text-right px-4 py-3 font-medium text-muted">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map(week => (
              <tr key={week.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium">{week.week_label}</td>
                <td className="px-4 py-3 text-muted">{formatDate(week.date)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    week.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {week.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/spor-toto/${week.id}`}
                    className="p-1.5 text-muted hover:text-primary inline-block"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {weeks.length === 0 && (
          <div className="text-center py-8 text-muted">Henüz hafta eklenmedi.</div>
        )}
      </div>
    </div>
  );
}
