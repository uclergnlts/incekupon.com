'use client';

import { updateMatchResult } from '@/lib/actions/coupon-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Match } from '@/types';

interface ResultToggleProps {
  match: Match;
}

export default function ResultToggle({ match }: ResultToggleProps) {
  async function handleResult(result: 'pending' | 'won' | 'lost') {
    try {
      await updateMatchResult(match.id, result);
      toast.success('Sonuç güncellendi.');
    } catch {
      toast.error('Hata oluştu.');
    }
  }

  const buttons: { value: 'pending' | 'won' | 'lost'; label: string; activeClass: string }[] = [
    { value: 'pending', label: 'Beklemede', activeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'won', label: 'Kazandı', activeClass: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'lost', label: 'Kaybetti', activeClass: 'bg-red-100 text-red-800 border-red-300' },
  ];

  return (
    <div className="flex gap-1">
      {buttons.map(btn => (
        <button
          key={btn.value}
          onClick={() => handleResult(btn.value)}
          className={cn(
            'px-2 py-1 text-xs font-medium rounded border transition-colors',
            match.result === btn.value
              ? btn.activeClass
              : 'bg-white text-muted border-border hover:bg-gray-50'
          )}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
