import type { MonthlyCouponStat } from '@/types';

interface MonthlyWinRateChartProps {
  stats: MonthlyCouponStat[];
}

export default function MonthlyWinRateChart({ stats }: MonthlyWinRateChartProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Aylik Kazanma Orani</h2>
        <span className="text-xs text-muted">Son {stats.length} ay</span>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-3 items-end h-64">
        {stats.map(item => {
          const barHeight = Math.max(item.winRate, 5);

          return (
            <div key={item.monthKey} className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-semibold text-muted">{item.winRate}%</div>
              <div className="w-full max-w-10 h-44 rounded-lg bg-gray-100 relative overflow-hidden">
                <div
                  className="absolute bottom-0 inset-x-0 rounded-lg bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-500"
                  style={{ height: `${barHeight}%` }}
                />
              </div>
              <div className="text-[10px] text-muted text-center leading-tight">{item.monthLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
