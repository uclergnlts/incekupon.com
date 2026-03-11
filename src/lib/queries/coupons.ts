import { createClient } from '@/lib/supabase/server';
import type { Coupon, CouponStats } from '@/types';

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
  const winRate = total > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  return { total, won, lost, pending, winRate };
}
