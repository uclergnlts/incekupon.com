import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import { getSiteSettings } from '@/lib/queries/site-settings';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'İncekupon - Günlük Bahis Kuponları',
    template: '%s | İncekupon',
  },
  description: 'Her gün güncel bahis kuponları, geçmiş kupon sonuçları, Spor Toto tahminleri ve aylık istatistikler.',
  keywords: ['bahis kuponları', 'iddaa tahminleri', 'spor toto', 'banko maçlar', 'kupon tavsiyeleri', 'incekupon'],
  authors: [{ name: 'incekupon' }],
  creator: 'incekupon',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://incekupon.com'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'İncekupon',
    title: 'İncekupon - Günlük Bahis Kuponları',
    description: 'Her gün güncel bahis kuponları, geçmiş kupon sonuçları ve Spor Toto tahminleri.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İncekupon - Günlük Bahis Kuponları',
    description: 'Her gün güncel bahis kuponları, geçmiş kupon sonuçları ve Spor Toto tahminleri.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50`}
      >
        <Header vipChannelUrl={settings.vip_telegram_url} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
