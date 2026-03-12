import { getTotoWeeks } from '@/lib/queries/spor-toto';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Edit } from 'lucide-react';

export default async function AdminSporTotoPage() {
  const weeks = await getTotoWeeks();

  return (
    <div className="admin-shell space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="admin-title">Spor Toto Yonetimi</h1>
        <Link
          href="/admin/spor-toto/yeni"
          className="admin-btn-primary"
        >
          <Plus className="w-4 h-4" /> Yeni Hafta
        </Link>
      </div>

      <div className="admin-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted">Hafta</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Tarih</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Durum</th>
                <th className="text-right px-4 py-3 font-medium text-muted">Islem</th>
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
                      {week.status === 'completed' ? 'Tamamlandi' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/spor-toto/${week.id}`}
                      className="p-2 rounded-lg text-muted hover:bg-slate-100 hover:text-primary inline-block"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {weeks.length === 0 && (
          <div className="text-center py-8 text-muted">Henuz hafta eklenmedi.</div>
        )}
      </div>
    </div>
  );
}
