'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, MessageCircle, Send, Share2, X } from 'lucide-react';
import type { Coupon } from '@/types';
import { toast } from 'sonner';

interface CouponShareButtonProps {
  coupon: Coupon;
}

function buildCouponShareText(coupon: Coupon): string {
  const sortedMatches = [...(coupon.matches ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 4)
    .map(match => `${match.home_team}-${match.away_team}: ${match.prediction} (${match.odds})`);

  const matchSummary = sortedMatches.length > 0
    ? `Maclar: ${sortedMatches.join(' | ')}`
    : 'Mac detaylari yakinda eklenecek.';

  const proofLine = coupon.played_coupon_url
    ? `Bu kuponu oynadigimiz link: ${coupon.played_coupon_url}`
    : 'Bu kuponu oynadigimiz link: admin tarafindan eklenmemis';

  return `Incekupon kuponu (Toplam oran: ${coupon.total_odds}) ${matchSummary} ${proofLine}`;
}

export default function CouponShareButton({ coupon }: CouponShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shareText = useMemo(() => buildCouponShareText(coupon), [coupon]);
  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') return '';

    const params = new URLSearchParams({ date: coupon.date });
    return `${window.location.origin}/gecmis-kuponlar?${params.toString()}`;
  }, [coupon.date]);
  const payload = `${shareText} ${shareLink}`.trim();

  useEffect(() => {
    function closeMenuOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', closeMenuOnOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', closeMenuOnOutsideClick);
    };
  }, [menuOpen]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Kupon metni kopyalandi');
      setMenuOpen(false);
    } catch {
      toast.error('Kopyalama basarisiz oldu');
    }
  }

  function openShareWindow(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    setMenuOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(prev => !prev)}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-muted hover:bg-gray-100 hover:text-foreground transition-colors"
      >
        {menuOpen ? <X className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        Paylas
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border bg-white p-1.5 shadow-lg">
          <button
            type="button"
            className="w-full text-left flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium hover:bg-gray-50"
            onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(payload)}`)}
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-600" />
            WhatsApp
          </button>
          <button
            type="button"
            className="w-full text-left flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium hover:bg-gray-50"
            onClick={() => openShareWindow(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`)}
          >
            <Send className="w-3.5 h-3.5 text-blue-500" />
            Telegram
          </button>
          <button
            type="button"
            className="w-full text-left flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium hover:bg-gray-50"
            onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(payload)}`)}
          >
            <span className="w-3.5 h-3.5 inline-flex items-center justify-center text-[11px] font-bold text-sky-500">X</span>
            Twitter / X
          </button>
          <button
            type="button"
            className="w-full text-left flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium hover:bg-gray-50"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5 text-primary" />
            Kopyala
          </button>
        </div>
      )}
    </div>
  );
}
