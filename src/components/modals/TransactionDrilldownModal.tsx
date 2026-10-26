'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, ExternalLink, Pencil, Receipt } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Transaction, MonthRange } from '@/lib/types';
import { inRange, rangeLabel, shiftMonth } from '@/lib/periods';
import { EditTransactionModal } from '@/components/modals/EditTransactionModal';
import type { TransactionDrilldown } from '@/lib/drilldown-context';

type TypeFilter = 'all' | 'income' | 'expense';

export function TransactionDrilldownModal({ filter, onClose }: { filter: TransactionDrilldown; onClose: () => void }) {
  const { transactions, getCategoryInfo } = useApp();
  const [range, setRange] = useState<MonthRange>(filter.range);
  const [type, setType] = useState<TypeFilter>(filter.type || 'all');
  const [category, setCategory] = useState<string | null>(filter.category || null);
  const [editing, setEditing] = useState<Transaction | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !editing) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  const periodTxns = useMemo(
    () => transactions.filter(t => inRange(t.date, range)),
    [transactions, range]
  );

  const totals = useMemo(() => {
    const scoped = category ? periodTxns.filter(t => t.category === category) : periodTxns;
    const income = scoped.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = scoped.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [periodTxns, category]);

  // Category chips reflect the type filter, not the category filter, so you can switch between them
  const breakdown = useMemo(() => {
    const typed = periodTxns.filter(t => type === 'all' || t.type === type);
    const grouped = new Map<string, { amount: number; count: number; type: 'income' | 'expense' }>();
    for (const t of typed) {
      const g = grouped.get(t.category) || { amount: 0, count: 0, type: t.type };
      g.amount += t.amount;
      g.count += 1;
      grouped.set(t.category, g);
    }
    return Array.from(grouped.entries())
      .map(([id, g]) => ({ id, ...g, ...getCategoryInfo(id) }))
      .sort((a, b) => (a.type === b.type ? b.amount - a.amount : a.type === 'income' ? -1 : 1));
  }, [periodTxns, type, getCategoryInfo]);

  const visible = useMemo(() => {
    return periodTxns
      .filter(t => type === 'all' || t.type === type)
      .filter(t => !category || t.category === category)
      .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);
  }, [periodTxns, type, category]);

  const visibleTotal = visible.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);

  const isSingleMonth = range.from === range.to;
  const step = (delta: number) => {
    const m = shiftMonth(range.from, delta);
    setRange({ from: m, to: m });
  };

  const catInfo = category ? getCategoryInfo(category) : null;
  const title = filter.title || (catInfo ? catInfo.name : type === 'income' ? 'Income' : type === 'expense' ? 'Expenses' : 'Transactions');

  const params = new URLSearchParams({ from: range.from, to: range.to });
  if (type !== 'all') params.set('type', type);
  if (category) params.set('category', category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-[var(--border-color)]">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-th-heading truncate">
              {catInfo && <span className="mr-2">{catInfo.icon}</span>}
              {title}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              {isSingleMonth && (
                <button onClick={() => step(-1)} className="p-1 rounded-lg hover:bg-[var(--bg-hover-strong)]" aria-label="Previous month">
                  <ChevronLeft className="w-4 h-4 text-th-muted" />
                </button>
              )}
              <p className="text-sm text-th-muted">{rangeLabel(range)}</p>
              {isSingleMonth && (
                <button onClick={() => step(1)} className="p-1 rounded-lg hover:bg-[var(--bg-hover-strong)]" aria-label="Next month">
                  <ChevronRight className="w-4 h-4 text-th-muted" />
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Totals */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setType(type === 'income' ? 'all' : 'income')} className={`stat-card border-l-4 border-success-500 text-left ${type === 'income' ? 'ring-2 ring-success-500/40' : ''}`}>
              <p className="stat-label">Income</p>
              <p className="text-base sm:text-lg font-bold text-[var(--text-positive)] num">{formatCurrency(totals.income)}</p>
            </button>
            <button onClick={() => setType(type === 'expense' ? 'all' : 'expense')} className={`stat-card border-l-4 border-danger-500 text-left ${type === 'expense' ? 'ring-2 ring-danger-500/40' : ''}`}>
              <p className="stat-label">Expenses</p>
              <p className="text-base sm:text-lg font-bold text-[var(--text-negative)] num">{formatCurrency(totals.expenses)}</p>
            </button>
            <div className="stat-card border-l-4 border-primary-500">
              <p className="stat-label">Net</p>
              <p className={`text-base sm:text-lg font-bold num ${totals.net >= 0 ? 'text-[var(--text-accent)]' : 'text-[var(--text-negative)]'}`}>{formatCurrency(totals.net)}</p>
            </div>
          </div>

          {/* Type filter */}
          <div className="flex bg-[var(--bg-subtle)] rounded-lg p-0.5 w-fit">
            {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); if (category && t !== 'all' && breakdown.find(b => b.id === category)?.type !== t) setCategory(null); }}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${type === t ? 'bg-th-card text-th-heading shadow-sm' : 'text-th-muted hover:text-th-body'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category breakdown */}
          {breakdown.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="stat-label">By category</p>
                {category && (
                  <button onClick={() => setCategory(null)} className="text-xs text-[var(--text-accent)] font-medium hover:opacity-80">Clear category</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {breakdown.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setCategory(category === b.id ? null : b.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      category === b.id ? 'border-transparent text-white' : 'border-[var(--border-color)] text-th-body hover:bg-[var(--bg-hover)]'
                    }`}
                    style={category === b.id ? { backgroundColor: b.color } : undefined}
                  >
                    <span>{b.icon}</span>
                    <span className="font-medium">{b.name}</span>
                    <span className={`num font-semibold ${category === b.id ? '' : b.type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                      {formatCurrency(b.amount)}
                    </span>
                    <span className="opacity-60">· {b.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="stat-label">{visible.length} transaction{visible.length === 1 ? '' : 's'}</p>
              {visible.length > 0 && (
                <p className={`text-xs font-semibold num ${visibleTotal >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                  {visibleTotal >= 0 ? '+' : '-'}{formatCurrency(Math.abs(visibleTotal))}
                </p>
              )}
            </div>
            {visible.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Receipt className="w-8 h-8 text-th-faint" />
                <p className="text-sm text-th-muted">No transactions for this selection</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {visible.map(txn => {
                  const c = getCategoryInfo(txn.category);
                  return (
                    <button
                      key={txn.id}
                      onClick={() => setEditing(txn)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: c.color + '18' }}>
                        {c.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-th-heading truncate">{txn.description}</p>
                        <p className="text-xs text-th-faint truncate">{txn.date} · {c.name}{txn.notes ? ` · ${txn.notes}` : ''}</p>
                      </div>
                      <p className={`text-sm font-bold num ${txn.type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <Pencil className="w-3.5 h-3.5 text-th-faint opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[var(--border-color)] flex justify-end">
          <Link href={`/transactions?${params.toString()}`} onClick={onClose} className="flex items-center gap-1.5 text-sm text-[var(--text-accent)] font-medium hover:opacity-80">
            Open in Transactions <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {editing && <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
