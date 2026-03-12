'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { updateVipTelegramUrl } from '@/lib/actions/site-settings-actions';
import { Crown, Link as LinkIcon } from 'lucide-react';

interface VipChannelFormProps {
  initialUrl: string;
  updatedAt?: string;
}

export default function VipChannelForm({ initialUrl, updatedAt }: VipChannelFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const result = await updateVipTelegramUrl(url);
    if (!result.ok) {
      toast.error(result.message);
      setSaving(false);
      return;
    }

    toast.success(result.message);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 inline-flex items-center justify-center">
          <Crown className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">VIP Kanal Ayari</h3>
          <p className="text-xs text-muted">Header ve butonlarda gosterilecek Telegram linki.</p>
        </div>
      </div>

      <div>
        <label className="admin-label">Telegram Linki</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={url}
              onChange={event => setUrl(event.target.value)}
              placeholder="https://t.me/kanaladi"
              className="admin-input pl-9"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn-primary whitespace-nowrap"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {updatedAt && (
        <p className="text-[11px] text-muted">
          Son guncelleme: {new Date(updatedAt).toLocaleString('tr-TR')}
        </p>
      )}
    </form>
  );
}
