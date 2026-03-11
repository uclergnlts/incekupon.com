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
    case 'won': return 'bg-green-100 text-green-800';
    case 'lost': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
