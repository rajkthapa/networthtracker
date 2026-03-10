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
          <div className="w-14 h-14 rounded-2xl bg-success-50 flex items-center justify-center">
            <ArrowLeftRight className="w-7 h-7 text-success-300" />
          </div>
          <p className="text-sm font-medium text-surface-600">No transaction data yet</p>
          <p className="text-xs text-surface-400 text-center max-w-[220px]">Add transactions to see your income vs expenses over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={monthlyData} barGap={4}>
          <CartesianGrid horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-surface-500 mb-1.5">{label}</p>
                  {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-surface-500 text-xs capitalize">{p.dataKey}</span>
                      <span className="font-semibold text-surface-800 num ml-auto">{formatCurrency(p.value)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar dataKey="income" fill="#40c057" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="expenses" fill="#fa5252" radius={[4, 4, 0, 0]} name="Expenses" />
          <Bar dataKey="savings" fill="#4c6ef5" radius={[4, 4, 0, 0]} name="Savings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
