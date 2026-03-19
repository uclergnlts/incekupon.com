import { createClient } from '@/lib/supabase/server';
import { ensureAutomaticCouponResultSync } from '@/lib/coupon-result-sync';
import type { Coupon, CouponStats, MonthlyCouponStat } from '@/types';

export async function getTodayCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('coupons')
    .select('*, matches(*)')
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Coupon[]) ?? [];
}

export async function getCoupons(filters?: {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}): Promise<{ coupons: Coupon[]; count: number }> {
  await ensureAutomaticCouponResultSync();

  const supabase = await createClient();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('coupons')
    .select('*, matches(*)', { count: 'exact' })
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.date) {
    query = query.eq('date', filters.date);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { coupons: (data as Coupon[]) ?? [], count: count ?? 0 };
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  await ensureAutomaticCouponResultSync();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coupons')
    .select('*, matches(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Coupon;
}

export async function getRecentCoupons(limit: number = 5): Promise<Coupon[]> {
  await ensureAutomaticCouponResultSync();

  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('coupons')
    .select('*, matches(*)')
    .lt('date', today)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Coupon[]) ?? [];
}

export async function getCouponStats(): Promise<CouponStats> {
  await ensureAutomaticCouponResultSync();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('coupons')
    .select('status');

  if (error) throw error;

  const coupons = data ?? [];
  const total = coupons.length;
  const won = coupons.filter(c => c.status === 'won').length;
  const lost = coupons.filter(c => c.status === 'lost').length;
  const pending = coupons.filter(c => c.status === 'pending').length;
  const decided = won + lost;
  const winRate = decided > 0 ? Math.round((won / decided) * 100) : 0;

  return { total, won, lost, pending, winRate };
}

export async function getMonthlyCouponStats(monthCount: number = 6): Promise<MonthlyCouponStat[]> {
  await ensureAutomaticCouponResultSync();

  const supabase = await createClient();
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1);

  const { data, error } = await supabase
    .from('coupons')
    .select('date, status')
    .gte('date', firstMonth.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (error) throw error;

  const monthFormatter = new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    year: 'numeric',
  });

  const monthMap = new Map<string, MonthlyCouponStat>();

  for (let index = 0; index < monthCount; index += 1) {
    const monthDate = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

    monthMap.set(monthKey, {
      monthKey,
      monthLabel: monthFormatter.format(monthDate),
      total: 0,
      won: 0,
      lost: 0,
      pending: 0,
      winRate: 0,
    });
  }

  for (const coupon of data ?? []) {
    const monthKey = coupon.date.slice(0, 7);
    const monthBucket = monthMap.get(monthKey);
    if (!monthBucket) continue;

    monthBucket.total += 1;
    if (coupon.status === 'won') monthBucket.won += 1;
    if (coupon.status === 'lost') monthBucket.lost += 1;
    if (coupon.status === 'pending') monthBucket.pending += 1;
  }

  for (const monthBucket of monthMap.values()) {
    const decided = monthBucket.won + monthBucket.lost;
    monthBucket.winRate = decided > 0 ? Math.round((monthBucket.won / decided) * 100) : 0;
  }

  return Array.from(monthMap.values());
}
