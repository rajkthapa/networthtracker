'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '@/lib/store';
import { PiggyBank } from 'lucide-react';

export function SavingsRateChart({ height = 250 }: { height?: number }) {
  const { monthlyData } = useApp();

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Savings Rate Trend</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-grape-50 flex items-center justify-center">
            <PiggyBank className="w-7 h-7 text-grape-300" />
          </div>
          <p className="text-sm font-medium text-surface-600">No savings data yet</p>
          <p className="text-xs text-surface-400 text-center max-w-[200px]">Track income and expenses to see your savings rate trend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Savings Rate Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={monthlyData}>
          <defs>
            <linearGradient id="savingsRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#be4bdb" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#be4bdb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-surface-500 mb-1">{label}</p>
                  <p className="text-lg font-bold text-grape-600 num">{(payload[0].value as number).toFixed(1)}%</p>
                  <p className="text-[10px] text-surface-400">Savings Rate</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="savingsRate" stroke="#be4bdb" fill="url(#savingsRateGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#be4bdb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
