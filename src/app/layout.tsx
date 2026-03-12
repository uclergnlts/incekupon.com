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
    default: 'incekupon - Gunluk Bahis Kuponlari',
    template: '%s | incekupon',
  },
  description: 'Her gun guncel bahis kuponlari, gecmis kupon sonuclari, Spor Toto tahminleri ve aylik istatistikler.',
  keywords: ['bahis kuponlari', 'iddaa tahminleri', 'spor toto', 'banko maclar', 'kupon tavsiyeleri', 'incekupon'],
  authors: [{ name: 'incekupon' }],
  creator: 'incekupon',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://incekupon.com'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'incekupon',
    title: 'incekupon - Gunluk Bahis Kuponlari',
    description: 'Her gun guncel bahis kuponlari, gecmis kupon sonuclari ve Spor Toto tahminleri.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'incekupon - Gunluk Bahis Kuponlari',
    description: 'Her gun guncel bahis kuponlari, gecmis kupon sonuclari ve Spor Toto tahminleri.',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,#eef5ff_0%,#f8fafc_40%,#f8fafc_100%)]`}
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
