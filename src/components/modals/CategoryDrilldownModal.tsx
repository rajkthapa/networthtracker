'use client';

import { useMemo, useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { MonthRange, Transaction } from '@/lib/types';
import { inRange, monthLabel, rangeLabel, clickedIndex } from '@/lib/periods';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';

interface Props {
  category: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  /** Period the user was looking at when they opened this; its transactions are listed by default. */
  range?: MonthRange;
  onClose: () => void;
}

export function CategoryDrilldownModal({ category, name, icon, color, type, range, onClose }: Props) {
  const { getCategoryHistory, transactions } = useApp();
  const history = getCategoryHistory(category);
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !editing) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  const stats = useMemo(() => {
    const amounts = history.map(h => h.amount).filter(a => a > 0);
    const total = amounts.reduce((s, a) => s + a, 0);
    const avg = amounts.length > 0 ? total / amounts.length : 0;
    const max = amounts.length > 0 ? Math.max(...amounts) : 0;
    const min = amounts.length > 0 ? Math.min(...amounts) : 0;
    const maxMonth = history.find(h => h.amount === max);
    const minMonth = history.find(h => h.amount === min && h.amount > 0);

    // Trend: compare last 3 months avg vs prior 3 months avg
    const recent = history.slice(-3);
    const prior = history.slice(-6, -3);
    const recentAvg = recent.length > 0 ? recent.reduce((s, h) => s + h.amount, 0) / recent.length : 0;
    const priorAvg = prior.length > 0 ? prior.reduce((s, h) => s + h.amount, 0) / prior.length : 0;
    const trendPercent = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

    return { total, avg, max, min, maxMonth, minMonth, trendPercent, monthCount: amounts.length };
  }, [history]);

  // Clicked bar month → that month; otherwise the period the user came from; otherwise all time
  const listRange: MonthRange | null = selected ? { from: selected, to: selected } : range || null;
  const listTxns = useMemo(() => {
    return transactions
      .filter(t => t.category === category && (!listRange || inRange(t.date, listRange)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, category, listRange?.from, listRange?.to]); // eslint-disable-line react-hooks/exhaustive-deps
  const listTotal = listTxns.reduce((s, t) => s + t.amount, 0);
  const sign = type === 'income' ? '+' : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: color + '18' }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-th-heading">{name}</h2>
              <p className="text-xs text-th-faint capitalize">{type} category</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="stat-card border-l-4" style={{ borderColor: color }}>
              <p className="stat-label">Total All Time</p>
              <p className="text-lg font-bold text-th-heading num">{formatCurrency(stats.total)}</p>
            </div>
            <div className="stat-card border-l-4 border-primary-500">
              <p className="stat-label">Avg / Active Month</p>
              <p className="text-lg font-bold text-[var(--text-accent)] num">{formatCurrency(stats.avg)}</p>
            </div>
            <div className={`stat-card border-l-4 ${type === 'income' ? 'border-success-500' : 'border-danger-500'}`}>
              <p className="stat-label">Highest</p>
              <p className={`text-lg font-bold num ${type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>{formatCurrency(stats.max)}</p>
              {stats.maxMonth && <p className="text-[10px] text-th-faint mt-0.5">{stats.maxMonth.label}</p>}
            </div>
            <div className={`stat-card border-l-4 ${type === 'income' ? 'border-danger-500' : 'border-success-500'}`}>
              <p className="stat-label">Lowest</p>
              <p className={`text-lg font-bold num ${type === 'income' ? 'text-[var(--text-negative)]' : 'text-[var(--text-positive)]'}`}>{formatCurrency(stats.min)}</p>
              {stats.minMonth && <p className="text-[10px] text-th-faint mt-0.5">{stats.minMonth.label}</p>}
            </div>
          </div>

          {/* Trend Indicator */}
          {stats.monthCount >= 4 && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              stats.trendPercent > 5
                ? type === 'expense' ? 'bg-[var(--bg-negative-subtle)] text-[var(--text-negative)]' : 'bg-[var(--bg-positive-subtle)] text-[var(--text-positive)]'
                : stats.trendPercent < -5
                  ? type === 'expense' ? 'bg-[var(--bg-positive-subtle)] text-[var(--text-positive)]' : 'bg-[var(--bg-negative-subtle)] text-[var(--text-negative)]'
                  : 'bg-[var(--bg-subtle)] text-th-body'
            }`}>
              {stats.trendPercent > 5 ? (
                <TrendingUp className="w-4 h-4" />
              ) : stats.trendPercent < -5 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              {Math.abs(stats.trendPercent) > 5
                ? `${stats.trendPercent > 0 ? 'Up' : 'Down'} ${Math.abs(stats.trendPercent).toFixed(0)}% vs prior 3 months`
                : 'Stable compared to prior 3 months'}
            </div>
          )}

          {/* Bar Chart */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="section-header">{type === 'income' ? 'Monthly Income' : 'Monthly Spending'}</h3>
              <span className="text-[11px] text-th-faint">Click a bar to see that month</span>
            </div>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={history}
                  barSize={history.length > 12 ? undefined : 32}
                  style={{ cursor: 'pointer' }}
                  onClick={(state: any) => {
                    const i = clickedIndex(state);
                    if (i === null || !history[i]) return;
                    setSelected(prev => (prev === history[i].month ? null : history[i].month));
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-hover)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                          <p className="text-xs text-th-muted mb-0.5">{d.label}</p>
                          <p className="text-sm font-bold text-th-heading num">{formatCurrency(d.amount)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {history.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.amount > 0 ? color : 'rgba(255,255,255,0.04)'}
                        fillOpacity={entry.amount <= 0 ? 0.3 : !selected || selected === entry.month ? 0.9 : 0.35}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-th-faint text-sm">No data yet</div>
            )}
          </div>

          {/* Transactions for the clicked month / incoming period */}
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="section-header">
                {listRange ? rangeLabel(listRange) : 'All transactions'}
              </h3>
              <div className="flex items-center gap-3">
                {listTxns.length > 0 && (
                  <span className={`text-sm font-bold num ${type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                    {sign}{formatCurrency(listTotal)} · {listTxns.length}
                  </span>
                )}
                {selected && (
                  <button onClick={() => setSelected(null)} className="text-xs text-[var(--text-accent)] font-medium hover:opacity-80">
                    {range ? 'Back to period' : 'Show all'}
                  </button>
                )}
              </div>
            </div>
            {listTxns.length === 0 ? (
              <p className="text-sm text-th-faint text-center py-6">No {name} transactions in {selected ? monthLabel(selected, true) : 'this period'}</p>
            ) : (
              <div className="space-y-2">
                {listTxns.map(txn => (
                  <button
                    key={txn.id}
                    onClick={() => setEditing(txn)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-th-heading truncate">{txn.description}</p>
                      <p className="text-xs text-th-faint">{txn.date}{txn.notes ? ` · ${txn.notes}` : ''}</p>
                    </div>
                    <p className={`text-sm font-bold num ml-3 ${type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                      {sign}{formatCurrency(txn.amount)}
                    </p>
                    <Pencil className="w-3.5 h-3.5 ml-2 text-th-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {editing && <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
