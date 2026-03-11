'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Ticket, Crown } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Anasayfa' },
  { href: '/gecmis-kuponlar', label: 'Geçmiş Kuponlar' },
  { href: '/spor-toto', label: 'Spor Toto' },
];

const TELEGRAM_URL = 'https://t.me/YOUR_CHANNEL'; // TODO: Telegram kanal linkini buraya ekle

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Ticket className="w-6 h-6" />
          <span>ince<span className="text-foreground">kupon</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Crown className="w-4 h-4" />
            VIP Grup
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-white">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-blue-50"
            onClick={() => setMenuOpen(false)}
          >
            <Crown className="w-4 h-4" />
            VIP Grup
          </a>
        </nav>
      )}
    </header>
  );
}
