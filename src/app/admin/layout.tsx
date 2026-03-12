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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/admin"
              className="rounded-full border border-border bg-white px-3 py-1.5 font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/kupon/yeni"
              className="rounded-full border border-border bg-white px-3 py-1.5 font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              Yeni Kupon
            </Link>
            <Link
              href="/admin/spor-toto"
              className="rounded-full border border-border bg-white px-3 py-1.5 font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              Spor Toto
            </Link>
            <Link
              href="/admin/banko"
              className="rounded-full border border-border bg-white px-3 py-1.5 font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
            >
              Banko
            </Link>
          </nav>
          <AdminLogout />
        </div>
      </header>
      {children}
    </div>
  );
}
