'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export function NetWorthChart({ height = 300 }: { height?: number }) {
  const { netWorthHistory } = useApp();

  if (netWorthHistory.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Net Worth Over Time</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary-300" />
          </div>
          <p className="text-sm font-medium text-surface-600">No history yet</p>
          <p className="text-xs text-surface-400 text-center max-w-[220px]">Your net worth will be tracked over time as you add accounts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Net Worth Over Time</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={netWorthHistory}>
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4c6ef5" stopOpacity={0.15} />
              <stop offset="50%" stopColor="#4c6ef5" stopOpacity={0.05} />
              <stop offset="100%" stopColor="#4c6ef5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="assetsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40c057" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#40c057" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="debtsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fa5252" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#fa5252" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip
            cursor={{ stroke: '#4c6ef5', strokeWidth: 1, strokeDasharray: 'none', opacity: 0.3 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-surface-500 mb-1.5">{label}</p>
                  {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                      <span className="text-surface-500 text-xs">{p.dataKey === 'netWorth' ? 'Net Worth' : p.dataKey === 'totalAssets' ? 'Assets' : 'Debts'}</span>
                      <span className="font-semibold text-surface-800 num ml-auto">{formatCurrency(p.value)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="totalAssets" stroke="#40c057" fill="url(#assetsGrad)" strokeWidth={2} name="Assets" />
          <Area type="monotone" dataKey="totalDebts" stroke="#fa5252" fill="url(#debtsGrad)" strokeWidth={2} name="Debts" />
          <Area type="monotone" dataKey="netWorth" stroke="#4c6ef5" fill="url(#netWorthGrad)" strokeWidth={2.5} name="Net Worth" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
