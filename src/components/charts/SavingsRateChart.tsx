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
          <div className="w-14 h-14 rounded-2xl bg-grape-500/10 flex items-center justify-center">
            <PiggyBank className="w-7 h-7 text-grape-300" />
          </div>
          <p className="text-sm font-medium text-th-body">No savings data yet</p>
          <p className="text-xs text-th-muted text-center max-w-[200px]">Track income and expenses to see your savings rate trend</p>
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
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-th-muted mb-1">{label}</p>
                  <p className="text-lg font-bold text-grape-400 num">{(payload[0].value as number).toFixed(1)}%</p>
                  <p className="text-[10px] text-th-faint">Savings Rate</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="savingsRate" stroke="#06b6d4" fill="url(#savingsRateGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
