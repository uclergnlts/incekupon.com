'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Crown, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Anasayfa' },
  { href: '/gecmis-kuponlar', label: 'Gecmis Kuponlar' },
  { href: '/spor-toto', label: 'Spor Toto' },
  { href: '/aylik-istatistik', label: 'Aylik Istatistik' },
];

interface HeaderProps {
  vipChannelUrl: string;
}

export default function Header({ vipChannelUrl }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
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
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
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
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:brightness-105"
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
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
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
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-sm font-semibold text-white"
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
