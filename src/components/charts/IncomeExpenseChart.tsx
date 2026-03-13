'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeftRight } from 'lucide-react';

export function IncomeExpenseChart({ height = 300 }: { height?: number }) {
  const { monthlyData } = useApp();

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Income vs Expenses</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-success-500/10 flex items-center justify-center">
            <ArrowLeftRight className="w-7 h-7 text-[var(--text-positive)]" />
          </div>
          <p className="text-sm font-medium text-th-body">No transaction data yet</p>
          <p className="text-xs text-th-muted text-center max-w-[220px]">Add transactions to see your income vs expenses over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={monthlyData} barGap={4}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-th-muted mb-1.5">{label}</p>
                  {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-th-muted text-xs capitalize">{p.dataKey}</span>
                      <span className="font-semibold text-th-heading num ml-auto">{formatCurrency(p.value)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
          <Bar dataKey="savings" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Savings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
