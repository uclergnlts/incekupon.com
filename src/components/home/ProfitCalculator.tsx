'use client';

import { useMemo, useState } from 'react';

interface ProfitCalculatorProps {
  initialOdds: number;
}

export default function ProfitCalculator({ initialOdds }: ProfitCalculatorProps) {
  const [stake, setStake] = useState(100);
  const [odds, setOdds] = useState(initialOdds > 0 ? initialOdds : 1.5);

  const { gross, net } = useMemo(() => {
    const grossAmount = stake * odds;
    return {
      gross: grossAmount,
      net: grossAmount - stake,
    };
  }, [stake, odds]);

  return (
    <section className="bg-white rounded-xl border border-border p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Kazanc Hesaplayici</h2>
        <p className="text-sm text-muted">100 TL yatirsam ne kazanirim sorusunun hizli cevabi.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted font-medium">Yatirim (TL)</span>
          <input
            type="number"
            min={1}
            step={10}
            value={stake}
            onChange={event => setStake(Number(event.target.value) || 0)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-muted font-medium">Toplam Oran</span>
          <input
            type="number"
            min={1.01}
            step={0.01}
            value={odds}
            onChange={event => setOdds(Number(event.target.value) || 1.01)}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-xs text-muted">Toplam Odeme</p>
          <p className="text-xl font-bold text-primary">{gross.toFixed(2)} TL</p>
        </div>
        <div className="rounded-lg bg-green-50 px-4 py-3">
          <p className="text-xs text-muted">Net Kar</p>
          <p className="text-xl font-bold text-success">{net.toFixed(2)} TL</p>
        </div>
      </div>
    </section>
  );
}
