'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export function CumulativeChart({ height = 340 }: { height?: number }) {
  const { monthlyData } = useApp();
  const [showNet, setShowNet] = useState(true);

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Cumulative Income vs Expenses</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-[var(--text-accent)]" />
          </div>
          <p className="text-sm font-medium text-th-body">No transaction data yet</p>
          <p className="text-xs text-th-muted text-center max-w-[220px]">Add transactions to see cumulative totals</p>
        </div>
      </div>
    );
  }

  let cumIncome = 0;
  let cumExpenses = 0;
  const data = monthlyData.map(d => {
    cumIncome += d.income;
    cumExpenses += d.expenses;
    return {
      month: d.month,
      income: Math.round(cumIncome * 100) / 100,
      expenses: Math.round(cumExpenses * 100) / 100,
      net: Math.round((cumIncome - cumExpenses) * 100) / 100,
    };
  });

  const totalIncome = data[data.length - 1].income;
  const totalExpenses = data[data.length - 1].expenses;
  const totalNet = data[data.length - 1].net;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-header">Cumulative Income vs Expenses</h3>
        <button
          onClick={() => setShowNet(!showNet)}
          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
            showNet
              ? 'bg-[var(--bg-positive-subtle)] text-[var(--text-positive)]'
              : 'bg-[var(--bg-subtle)] text-th-muted'
          }`}
        >
          {showNet ? 'Net On' : 'Net Off'}
        </button>
      </div>
      <div className="flex gap-6 mb-4">
        <div>
          <p className="stat-label">Total Income</p>
          <p className="text-lg font-bold text-[var(--text-positive)] num">{formatCurrency(totalIncome)}</p>
        </div>
        <div>
          <p className="stat-label">Total Expenses</p>
          <p className="text-lg font-bold text-[var(--text-negative)] num">{formatCurrency(totalExpenses)}</p>
        </div>
        <div>
          <p className="stat-label">Net</p>
          <p className={`text-lg font-bold num ${totalNet >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cumIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cumExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cumNetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => formatCurrency(v, true)} />
          <Tooltip
            cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: 'none', opacity: 0.3 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-th-muted mb-1.5">{label}</p>
                  {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke }} />
                      <span className="text-th-muted text-xs capitalize">{p.dataKey === 'net' ? 'Net' : p.dataKey}</span>
                      <span className="font-semibold text-th-heading num ml-auto">{formatCurrency(p.value as number)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#cumIncomeGrad)" strokeWidth={2} name="Income" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#cumExpenseGrad)" strokeWidth={2} name="Expenses" />
          {showNet && (
            <Area type="monotone" dataKey="net" stroke="#14b8a6" fill="url(#cumNetGrad)" strokeWidth={2.5} name="Net" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
