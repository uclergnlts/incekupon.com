'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Crown, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Anasayfa' },
  { href: '/gecmis-kuponlar', label: 'Geçmiş Kuponlar' },
  { href: '/spor-toto', label: 'Spor Toto' },
  { href: '/aylik-istatistik', label: 'Aylık İstatistik' },
];

interface HeaderProps {
  vipChannelUrl: string;
}

export default function Header({ vipChannelUrl }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg text-slate-900">
          <Image
            src="/logo-mark.svg"
            alt="incekupon logo"
            width={30}
            height={30}
            className="rounded-md"
            priority
          />
          <span>
            ince<span className="text-primary">kupon</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={vipChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Crown className="w-4 h-4" />
            VIP Kanal
          </a>
        </nav>

        <button
          className="lg:hidden p-2 rounded-lg border border-slate-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur p-3 space-y-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2.5 text-sm font-bold ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={vipChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <Crown className="w-4 h-4" />
            VIP Kanal
          </a>
        </nav>
      )}
    </header>
  );
}
