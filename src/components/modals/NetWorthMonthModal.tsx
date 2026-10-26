'use client';

import { useMemo, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { monthLabel, singleMonth } from '@/lib/periods';
import { useDrilldown } from '@/lib/drilldown-context';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function NetWorthMonthModal({ month: initialMonth, onClose }: { month: string; onClose: () => void }) {
  const { accounts, netWorthHistory, getAccountBalanceForMonth, totalCryptoValue, getMonthTotals } = useApp();
  const { openTransactions } = useDrilldown();
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const historyMonths = useMemo(() => netWorthHistory.map(h => h.date.slice(0, 7)), [netWorthHistory]);
  const idx = historyMonths.indexOf(month);
  const prevMonth = idx > 0 ? historyMonths[idx - 1] : null;
  const nextMonth = idx >= 0 && idx < historyMonths.length - 1 ? historyMonths[idx + 1] : null;
  const point = idx >= 0 ? netWorthHistory[idx] : null;
  const prevPoint = idx > 0 ? netWorthHistory[idx - 1] : null;

  const isCurrent = month === currentMonth();

  const rows = useMemo(() => {
    const balanceAt = (accountId: string, m: string | null, live: number) => {
      if (!m) return null;
      const snap = getAccountBalanceForMonth(accountId, m);
      if (snap !== null) return snap;
      return m === currentMonth() ? live : null;
    };
    return accounts
      .map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        color: a.color,
        isDebt: a.isDebt,
        balance: balanceAt(a.id, month, a.balance),
        prev: balanceAt(a.id, prevMonth, a.balance),
      }))
      .filter(r => r.balance !== null || r.prev !== null)
      .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0));
  }, [accounts, month, prevMonth, getAccountBalanceForMonth]);

  const assetRows = rows.filter(r => !r.isDebt);
  const debtRows = rows.filter(r => r.isDebt);
  const itemizedAssets = assetRows.reduce((s, r) => s + (r.balance ?? 0), 0);
  const itemizedDebts = debtRows.reduce((s, r) => s + (r.balance ?? 0), 0);

  // Snapshots store totals that can include holdings not tracked per account (crypto, since-deleted accounts)
  const totalAssets = point?.totalAssets ?? itemizedAssets + (isCurrent ? totalCryptoValue : 0);
  const totalDebts = point?.totalDebts ?? itemizedDebts;
  const unitemized = totalAssets - itemizedAssets;
  const nw = totalAssets - totalDebts;
  const nwChange = prevPoint ? nw - prevPoint.netWorth : null;

  const cash = getMonthTotals(month);

  const renderRow = (r: typeof rows[number]) => {
    const change = r.balance !== null && r.prev !== null ? r.balance - r.prev : null;
    const good = change !== null && (r.isDebt ? change < 0 : change > 0);
    return (
      <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: r.color + '18' }}>{r.icon}</div>
        <p className="text-sm font-medium text-th-heading truncate flex-1 min-w-0">{r.name}</p>
        {change !== null && Math.abs(change) >= 0.01 && (
          <span className={`text-xs num ${good ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
            {change > 0 ? '+' : '-'}{formatCurrency(Math.abs(change))}
          </span>
        )}
        <p className={`text-sm font-semibold num w-28 text-right ${r.isDebt ? 'text-[var(--text-negative)]' : 'text-th-heading'}`}>
          {r.balance === null ? <span className="text-th-faint font-normal">—</span> : `${r.isDebt ? '-' : ''}${formatCurrency(r.balance)}`}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-3 p-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="text-xl font-bold text-th-heading">Net Worth</h2>
            <div className="flex items-center gap-1 mt-1">
              <button disabled={!prevMonth} onClick={() => prevMonth && setMonth(prevMonth)} className="p-1 rounded-lg hover:bg-[var(--bg-hover-strong)] disabled:opacity-30" aria-label="Previous month">
                <ChevronLeft className="w-4 h-4 text-th-muted" />
              </button>
              <p className="text-sm text-th-muted">{monthLabel(month, true)}</p>
              <button disabled={!nextMonth} onClick={() => nextMonth && setMonth(nextMonth)} className="p-1 rounded-lg hover:bg-[var(--bg-hover-strong)] disabled:opacity-30" aria-label="Next month">
                <ChevronRight className="w-4 h-4 text-th-muted" />
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card border-l-4 border-primary-500">
              <p className="stat-label">Net Worth</p>
              <p className="text-base sm:text-lg font-bold text-th-heading num">{formatCurrency(nw)}</p>
              {nwChange !== null && (
                <p className={`text-xs num flex items-center gap-0.5 ${nwChange >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                  {nwChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatCurrency(Math.abs(nwChange))} vs {monthLabel(prevMonth!)}
                </p>
              )}
            </div>
            <div className="stat-card border-l-4 border-success-500">
              <p className="stat-label">Assets</p>
              <p className="text-base sm:text-lg font-bold text-[var(--text-positive)] num">{formatCurrency(totalAssets)}</p>
            </div>
            <div className="stat-card border-l-4 border-danger-500">
              <p className="stat-label">Debts</p>
              <p className="text-base sm:text-lg font-bold text-[var(--text-negative)] num">{formatCurrency(totalDebts)}</p>
            </div>
          </div>

          {(cash.income > 0 || cash.expenses > 0) && (
            <button
              onClick={() => openTransactions({ range: singleMonth(month) })}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <Receipt className="w-4 h-4 text-th-muted" />
              <span className="text-sm text-th-body flex-1">Cash flow this month</span>
              <span className="text-xs num text-[var(--text-positive)]">+{formatCurrency(cash.income)}</span>
              <span className="text-xs num text-[var(--text-negative)]">-{formatCurrency(cash.expenses)}</span>
              <ChevronRight className="w-4 h-4 text-th-faint" />
            </button>
          )}

          {rows.length === 0 ? (
            <p className="text-sm text-th-muted text-center py-6">
              No per-account balances recorded for this month. Enter monthly balances on the Accounts page to see the breakdown.
            </p>
          ) : (
            <>
              <div>
                <p className="stat-label mb-1">Assets{prevMonth ? ` · change vs ${monthLabel(prevMonth)}` : ''}</p>
                {assetRows.map(renderRow)}
                {Math.abs(unitemized) >= 1 && (
                  <div className="flex items-center gap-3 p-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-[var(--bg-subtle)]">₿</div>
                    <p className="text-sm text-th-muted flex-1">Not itemized (crypto, removed accounts)</p>
                    <p className="text-sm font-semibold num w-28 text-right text-th-heading">{formatCurrency(unitemized)}</p>
                  </div>
                )}
              </div>
              {debtRows.length > 0 && (
                <div className="border-t border-[var(--border-color)] pt-3">
                  <p className="stat-label mb-1">Debts</p>
                  {debtRows.map(renderRow)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
