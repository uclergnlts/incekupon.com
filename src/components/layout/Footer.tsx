import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">incekupon &copy; {new Date().getFullYear()}</p>
          <p className="text-xs text-slate-500 mt-1">Bahis icerikleri bilgilendirme amaclidir.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">Anasayfa</Link>
          <Link href="/gecmis-kuponlar" className="hover:text-slate-700">Gecmis Kuponlar</Link>
          <Link href="/spor-toto" className="hover:text-slate-700">Spor Toto</Link>
          <Link href="/aylik-istatistik" className="hover:text-slate-700">Aylik Istatistik</Link>
        </div>
      </div>
    </footer>
  );
}
