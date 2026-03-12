import { getBankoByDate } from '@/lib/queries/banko';
import BankoForm from '@/components/admin/BankoForm';
import { ShieldCheck } from 'lucide-react';

export default async function AdminBankoPage() {
  const today = new Date().toISOString().split('T')[0];
  const todayBanko = await getBankoByDate(today);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Gunun Bankosu</h1>
      </div>

      {todayBanko ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-primary font-medium">
            Bugun icin banko mevcut: <strong>{todayBanko.home_team} - {todayBanko.away_team}</strong> ({todayBanko.prediction} @ {todayBanko.odds})
          </p>
          <p className="text-xs text-muted mt-1">Asagidaki formu kullanarak guncelleyebilir veya silebilirsiniz.</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 font-medium">
            Bugun icin henuz banko eklenmedi. Asagidaki formu kullanarak ekleyin.
          </p>
        </div>
      )}

      <BankoForm banko={todayBanko} />
    </div>
  );
}
