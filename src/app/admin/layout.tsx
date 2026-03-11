import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLogout from '@/components/admin/AdminLogout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/giris');
  }

  return (
    <div>
      <div className="bg-primary text-white">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="font-medium hover:text-white/80">
              Dashboard
            </Link>
            <Link href="/admin/kupon/yeni" className="hover:text-white/80">
              Yeni Kupon
            </Link>
            <Link href="/admin/spor-toto" className="hover:text-white/80">
              Spor Toto
            </Link>
          </nav>
          <AdminLogout />
        </div>
      </div>
      {children}
    </div>
  );
}
