import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr });
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM HH:mm', { locale: tr });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm');
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'won': return 'Kazandı';
    case 'lost': return 'Kaybetti';
    case 'pending': return 'Beklemede';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'won': return 'bg-emerald-600 text-white border-emerald-700';
    case 'lost': return 'bg-red-600 text-white border-red-700';
    case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
