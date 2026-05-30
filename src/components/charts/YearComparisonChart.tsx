'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

type ViewMode = 'monthly' | 'quarterly' | 'yearly';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4'];

export function YearComparisonChart({ height = 380 }: { height?: number }) {
  const { transactions } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [metric, setMetric] = useState<'income' | 'expenses' | 'net'>('net');

  const years = useMemo(() => {
    const yrs = new Set<number>();
    transactions.forEach(t => yrs.add(parseInt(t.date.slice(0, 4))));
    return Array.from(yrs).sort();
  }, [transactions]);

  const yearlyAgg = useMemo(() => {
    const agg: Record<number, { monthly: { income: number; expenses: number }[] }> = {};
    years.forEach(y => {
      agg[y] = { monthly: Array.from({ length: 12 }, () => ({ income: 0, expenses: 0 })) };
    });
    transactions.forEach(t => {
      const y = parseInt(t.date.slice(0, 4));
      const m = parseInt(t.date.slice(5, 7)) - 1;
      if (!agg[y]) return;
      if (t.type === 'income') agg[y].monthly[m].income += t.amount;
      else agg[y].monthly[m].expenses += t.amount;
    });
    return agg;
  }, [transactions, years]);

  const currentYear = years[years.length - 1];
  const previousYear = years.length >= 2 ? years[years.length - 2] : null;

  const data = useMemo(() => {
    if (!currentYear) return [];

    const getValue = (d: { income: number; expenses: number }) => {
      if (metric === 'income') return Math.round(d.income * 100) / 100;
      if (metric === 'expenses') return Math.round(d.expenses * 100) / 100;
      return Math.round((d.income - d.expenses) * 100) / 100;
    };

    if (viewMode === 'monthly') {
      return MONTH_NAMES.map((name, i) => {
        const cur = yearlyAgg[currentYear]?.monthly[i] || { income: 0, expenses: 0 };
        const prev = previousYear ? (yearlyAgg[previousYear]?.monthly[i] || { income: 0, expenses: 0 }) : null;
        const row: any = { name, [currentYear]: getValue(cur) };
        if (prev) row[previousYear!] = getValue(prev);
        return row;
      });
    }

    if (viewMode === 'quarterly') {
      return QUARTER_NAMES.map((name, qi) => {
        const curMonths = yearlyAgg[currentYear]?.monthly.slice(qi * 3, qi * 3 + 3) || [];
        const curSum = curMonths.reduce((a, b) => ({ income: a.income + b.income, expenses: a.expenses + b.expenses }), { income: 0, expenses: 0 });
        const row: any = { name, [currentYear]: getValue(curSum) };
        if (previousYear) {
          const prevMonths = yearlyAgg[previousYear]?.monthly.slice(qi * 3, qi * 3 + 3) || [];
          const prevSum = prevMonths.reduce((a, b) => ({ income: a.income + b.income, expenses: a.expenses + b.expenses }), { income: 0, expenses: 0 });
          row[previousYear] = getValue(prevSum);
        }
        return row;
      });
    }

    // yearly
    return years.map(y => {
      const all = yearlyAgg[y]?.monthly || [];
      const sum = all.reduce((a, b) => ({ income: a.income + b.income, expenses: a.expenses + b.expenses }), { income: 0, expenses: 0 });
      return { name: String(y), value: getValue(sum) };
    });
  }, [currentYear, previousYear, yearlyAgg, viewMode, metric, years]);

  if (years.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-4">Year-over-Year Comparison</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-grape-500/10 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 text-[var(--text-accent-secondary)]" />
          </div>
          <p className="text-sm font-medium text-th-body">No data to compare</p>
          <p className="text-xs text-th-muted text-center max-w-[220px]">Add transactions across multiple months to see year-over-year trends</p>
        </div>
      </div>
    );
  }

  // Summary stats
  const curTotal = yearlyAgg[currentYear]?.monthly.reduce(
    (a, b) => ({ income: a.income + b.income, expenses: a.expenses + b.expenses }),
    { income: 0, expenses: 0 }
  ) || { income: 0, expenses: 0 };
  const prevTotal = previousYear
    ? yearlyAgg[previousYear]?.monthly.reduce(
        (a, b) => ({ income: a.income + b.income, expenses: a.expenses + b.expenses }),
        { income: 0, expenses: 0 }
      )
    : null;

  const getMetricValue = (d: { income: number; expenses: number }) =>
    metric === 'income' ? d.income : metric === 'expenses' ? d.expenses : d.income - d.expenses;

  const curValue = getMetricValue(curTotal);
  const prevValue = prevTotal ? getMetricValue(prevTotal) : 0;
  const yoyChange = prevValue !== 0 ? ((curValue - prevValue) / Math.abs(prevValue)) * 100 : 0;

  const isYearly = viewMode === 'yearly';

  return (
    <div className="chart-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h3 className="section-header">Year-over-Year Comparison</h3>
        <div className="flex gap-2">
          <div className="flex bg-[var(--bg-subtle)] rounded-lg p-0.5">
            {(['monthly', 'quarterly', 'yearly'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-th-card text-th-heading shadow-sm'
                    : 'text-th-muted hover:text-th-body'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex bg-[var(--bg-subtle)] rounded-lg p-0.5">
            {(['income', 'expenses', 'net'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${
                  metric === m
                    ? 'bg-th-card text-th-heading shadow-sm'
                    : 'text-th-muted hover:text-th-body'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year summary */}
      <div className="flex gap-6 mb-4">
        <div>
          <p className="stat-label">{currentYear} {metric}</p>
          <p className={`text-lg font-bold num ${
            metric === 'income' ? 'text-[var(--text-positive)]' :
            metric === 'expenses' ? 'text-[var(--text-negative)]' :
            curValue >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'
          }`}>
            {formatCurrency(curValue)}
          </p>
        </div>
        {previousYear && (
          <>
            <div>
              <p className="stat-label">{previousYear} {metric}</p>
              <p className="text-lg font-bold text-th-muted num">{formatCurrency(prevValue)}</p>
            </div>
            <div>
              <p className="stat-label">YoY Change</p>
              <p className={`text-lg font-bold num ${yoyChange >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                {yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}%
              </p>
            </div>
          </>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid horizontal vertical={false} stroke="var(--chart-grid)" strokeOpacity={0.6} />
          <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => formatCurrency(v, true)} />
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
                      <span className="text-th-muted text-xs">{p.name || p.dataKey}</span>
                      <span className="font-semibold text-th-heading num ml-auto">{formatCurrency(p.value as number)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          {isYearly ? (
            <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} name={`${metric}`} />
          ) : (
            <>
              {previousYear && (
                <Bar dataKey={String(previousYear)} fill="#6b7280" radius={[4, 4, 0, 0]} name={String(previousYear)} opacity={0.5} />
              )}
              <Bar dataKey={String(currentYear)} fill="#14b8a6" radius={[4, 4, 0, 0]} name={String(currentYear)} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
