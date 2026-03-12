import type { CouponStats } from '@/types';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface StatsBarProps {
  stats: CouponStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted">Toplam Kupon</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="text-2xl font-bold text-success">{stats.won}</p>
          <p className="text-xs text-muted">Kazanan</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <XCircle className="w-5 h-5 text-danger" />
        </div>
        <div>
          <p className="text-2xl font-bold text-danger">{stats.lost}</p>
          <p className="text-xs text-muted">Kaybeden</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">%{stats.winRate}</p>
          <p className="text-xs text-muted">Kazanma Oranı</p>
        </div>
      </div>
    </div>
  );
}
