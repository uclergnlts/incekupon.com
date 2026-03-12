import Link from 'next/link';
import { ChevronRight, ListChecks, PlusSquare, ShieldCheck, Trophy, Crown } from 'lucide-react';
import VipChannelForm from '@/components/admin/VipChannelForm';
import { getSiteSettings } from '@/lib/queries/site-settings';

const menuItems = [
  {
    title: 'Kuponlar',
    description: 'Tum kuponlari goruntule, duzenle ve sonuclari takip et.',
    href: '/admin/kuponlar',
    icon: ListChecks,
  },
  {
    title: 'Yeni Kupon',
    description: 'Gunluk kupon olustur ve API fixture secicisi ile mac ekle.',
    href: '/admin/kupon/yeni',
    icon: PlusSquare,
  },
  {
    title: 'Gunun Bankosu',
    description: 'One cikan banko maci yonet ve anasayfada vurgula.',
    href: '/admin/banko',
    icon: ShieldCheck,
  },
  {
    title: 'Spor Toto',
    description: 'Haftalik Spor Toto tahminlerini olustur ve guncelle.',
    href: '/admin/spor-toto',
    icon: Trophy,
  },
];

export default async function AdminDashboard() {
  const settings = await getSiteSettings();

  return (
    <div className="admin-shell space-y-6">
      <div className="admin-panel p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold mb-3">
          <Crown className="w-3.5 h-3.5" />
          Admin Kontrol Paneli
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Yonetim Menuleri</h1>
        <p className="text-sm text-white/75 mt-2 max-w-2xl">
          Panel girisinde sadece yonetim menuleri gosterilir. Asagidaki modullerden ilgili ekrana gecis yapabilirsiniz.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map(item => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="admin-panel p-4 sm:p-5 group transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 inline-flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <h2 className="mt-4 text-base font-bold text-slate-900">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </Link>
          );
        })}
      </section>

      <VipChannelForm initialUrl={settings.vip_telegram_url} updatedAt={settings.updated_at} />
    </div>
  );
}
