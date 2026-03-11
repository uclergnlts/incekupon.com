export type CouponStatus = 'pending' | 'won' | 'lost';

export interface Coupon {
  id: string;
  date: string;
  status: CouponStatus;
  total_odds: number;
  notes: string | null;
  created_at: string;
  matches?: Match[];
}

export interface Match {
  id: string;
  coupon_id: string;
  league: string;
  home_team: string;
  away_team: string;
  match_time: string;
  prediction: string;
  odds: number;
  result: CouponStatus;
  sort_order: number;
  created_at: string;
}

export interface SportTotoWeek {
  id: string;
  week_label: string;
  date: string;
  status: 'pending' | 'completed';
  created_at: string;
  spor_toto_matches?: SportTotoMatch[];
}

export interface SportTotoMatch {
  id: string;
  week_id: string;
  match_number: number;
  home_team: string;
  away_team: string;
  prediction: '1' | '0' | '2';
  actual_result: '1' | '0' | '2' | null;
  created_at: string;
}

export interface CouponStats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  winRate: number;
}
