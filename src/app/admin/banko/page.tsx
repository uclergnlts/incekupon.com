export const dynamic = 'force-dynamic';

import { getBankoByDate } from '@/lib/queries/banko';
import BankoForm from '@/components/admin/BankoForm';
import { ShieldCheck } from 'lucide-react';

export default async function AdminBankoPage() {
  const today = new Date().toISOString().split('T')[0];
  const todayBanko = await getBankoByDate(today);

  return (
    <div className="admin-shell max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-primary" />
        <h1 className="admin-title">Gunun Bankosu</h1>
      </div>

      {todayBanko ? (
        <div className="admin-panel-soft p-4">
          <p className="text-sm text-primary font-medium">
            Bugun icin banko mevcut: <strong>{todayBanko.home_team} - {todayBanko.away_team}</strong> ({todayBanko.prediction} @ {todayBanko.odds})
          </p>
          <p className="text-xs text-muted mt-1">Asagidaki formu kullanarak guncelleyebilir veya silebilirsiniz.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-yellow-800 font-medium">
            Bugun icin henuz banko eklenmedi. Asagidaki formu kullanarak ekleyin.
          </p>
        </div>
      )}

      <BankoForm banko={todayBanko} />
    </div>
  );
}
