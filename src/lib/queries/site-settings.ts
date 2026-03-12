import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types';

const DEFAULT_VIP_URL = process.env.NEXT_PUBLIC_VIP_TELEGRAM_URL ?? 'https://t.me/YOUR_CHANNEL';

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', true)
    .single();

  if (error || !data) {
    return {
      id: true,
      vip_telegram_url: DEFAULT_VIP_URL,
      updated_at: '',
    };
  }

  return data as SiteSettings;
}
