'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type SiteSettingsActionResult = { ok: true; message: string } | { ok: false; message: string };

function normalizeUrl(input: string): { ok: true; url: string } | { ok: false; message: string } {
  const raw = input.trim();
  if (!raw) return { ok: false, message: 'VIP kanal linki bos olamaz.' };

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'Lutfen gecerli bir URL girin.' };
    }

    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, message: 'Lutfen gecerli bir URL girin.' };
  }
}

export async function updateVipTelegramUrl(vipTelegramUrl: string): Promise<SiteSettingsActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };
  }

  const normalized = normalizeUrl(vipTelegramUrl);
  if (!normalized.ok) return normalized;

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        id: true,
        vip_telegram_url: normalized.url,
      },
      { onConflict: 'id' },
    );

  if (error) {
    if (error.message?.toLowerCase().includes('site_settings')) {
      return {
        ok: false,
        message: 'Veritabani hazir degil. once supabase-site-settings.sql dosyasini calistirin.',
      };
    }

    return { ok: false, message: error.message };
  }

  revalidatePath('/');
  revalidatePath('/gecmis-kuponlar');
  revalidatePath('/aylik-istatistik');
  revalidatePath('/spor-toto');
  revalidatePath('/admin');

  return { ok: true, message: 'VIP kanal linki guncellendi.' };
}
