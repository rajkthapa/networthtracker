'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownUp } from 'lucide-react';

export function MonthlyNetCashFlowChart({ height = 300 }: { height?: number }) {
  const { monthlyData } = useApp();

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Monthly Net Cash Flow</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <ArrowDownUp className="w-7 h-7 text-[var(--text-accent)]" />
          </div>
          <p className="text-sm font-medium text-th-body">No cash flow data yet</p>
          <p className="text-xs text-th-muted text-center max-w-[220px]">Add income and expense transactions to see monthly net cash flow</p>
        </div>
      </div>
    );
  }

  const data = monthlyData.map(d => ({
    month: d.month,
    net: Math.round((d.income - d.expenses) * 100) / 100,
  }));

  const positiveMonths = data.filter(d => d.net >= 0).length;
  const avgNet = data.reduce((s, d) => s + d.net, 0) / data.length;
  const bestMonth = [...data].sort((a, b) => b.net - a.net)[0];
  const worstMonth = [...data].sort((a, b) => a.net - b.net)[0];

  return (
    <div className="chart-container">
      <h3 className="section-header mb-2">Monthly Net Cash Flow</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
        <div>
          <p className="stat-label">Avg/Month</p>
          <p className={`text-base font-bold num ${avgNet >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
            {formatCurrency(avgNet)}
          </p>
        </div>
        <div>
          <p className="stat-label">Positive Months</p>
          <p className="text-base font-bold text-th-heading num">{positiveMonths}/{data.length}</p>
        </div>
        <div>
          <p className="stat-label">Best</p>
          <p className="text-base font-bold text-[var(--text-positive)] num">{bestMonth.month}: {formatCurrency(bestMonth.net)}</p>
        </div>
        <div>
          <p className="stat-label">Worst</p>
          <p className="text-base font-bold text-[var(--text-negative)] num">{worstMonth.month}: {formatCurrency(worstMonth.net)}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid horizontal vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.6} />
          <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => formatCurrency(v, true)} />
          <ReferenceLine y={0} stroke="var(--chart-axis)" strokeOpacity={0.5} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const val = payload[0].value as number;
              return (
                <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-th-muted mb-1">{label}</p>
                  <p className={`text-lg font-bold num ${val >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                    {formatCurrency(val)}
                  </p>
                  <p className="text-[10px] text-th-faint">Net Cash Flow</p>
                </div>
              );
            }}
          />
          <Bar dataKey="net" radius={[4, 4, 0, 0]} name="Net Cash Flow">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.net >= 0 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
