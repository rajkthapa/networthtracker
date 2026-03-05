'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export function NetWorthChart({ height = 300 }: { height?: number }) {
  const { netWorthHistory } = useApp();

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Net Worth Over Time</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={netWorthHistory}>
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#40c057" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#40c057" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="debtsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fa5252" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#fa5252" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
          <XAxis dataKey="date" stroke="#8b95ad" fontSize={12} tickLine={false} />
          <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip
            formatter={(value: any, name: any) => [formatCurrency(value), name === 'netWorth' ? 'Net Worth' : name === 'totalAssets' ? 'Assets' : 'Debts']}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="totalAssets" stroke="#40c057" fill="url(#assetsGrad)" strokeWidth={2} name="totalAssets" />
          <Area type="monotone" dataKey="totalDebts" stroke="#fa5252" fill="url(#debtsGrad)" strokeWidth={2} name="totalDebts" />
          <Area type="monotone" dataKey="netWorth" stroke="#4c6ef5" fill="url(#netWorthGrad)" strokeWidth={3} name="netWorth" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
