'use client';

import { DollarSign, PiggyBank, CreditCard, ArrowUpRight, ArrowDownRight, ChevronDown, Receipt } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { SavingsRateChart } from '@/components/charts/SavingsRateChart';
import { Delta } from '@/components/ui/Delta';

function MonthSelector() {
  const { selectedMonth, setSelectedMonth, availableMonths } = useApp();
  if (availableMonths.length === 0) return null;
  return (
    <div className="relative">
      <select
        value={selectedMonth}
        onChange={e => setSelectedMonth(e.target.value)}
        className="appearance-none bg-th-card border border-[var(--border-strong)] rounded-xl px-4 py-2 pr-8 text-sm font-medium text-th-heading cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      >
        {availableMonths.map(m => {
          const [y, mo] = m.split('-');
          const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return <option key={m} value={m}>{label}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-th-faint pointer-events-none" />
    </div>
  );
}

function MonthComparison() {
  const { monthIncome, monthExpenses, monthSavings, monthSavingsRate,
    prevMonthIncome, prevMonthExpenses, prevMonthSavings, prevMonthSavingsRate,
    selectedMonth } = useApp();

  const [y, m] = selectedMonth.split('-').map(Number);
  const prevLabel = new Date(m === 1 ? y - 1 : y, m === 1 ? 11 : m - 2).toLocaleDateString('en-US', { month: 'short' });
  const currLabel = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short' });

  const rows = [
    { label: 'Income', current: monthIncome, previous: prevMonthIncome, color: 'text-[var(--text-positive)]' },
    { label: 'Expenses', current: monthExpenses, previous: prevMonthExpenses, color: 'text-[var(--text-negative)]' },
    { label: 'Savings', current: monthSavings, previous: prevMonthSavings, color: 'text-[var(--text-accent)]' },
    { label: 'Savings Rate', current: monthSavingsRate, previous: prevMonthSavingsRate, color: 'text-[var(--text-accent-secondary)]', isPercent: true },
  ];

  if (monthIncome === 0 && prevMonthIncome === 0) return null;

  return (
    <details className="chart-container group" open>
      <summary className="flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <h3 className="section-header">Month-over-Month</h3>
        <ChevronDown className="w-4 h-4 text-th-faint group-open:rotate-180 transition-transform duration-200" />
      </summary>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left stat-label py-3 px-2">Metric</th>
              <th className="text-right stat-label py-3 px-2">{prevLabel}</th>
              <th className="text-right stat-label py-3 px-2">{currLabel}</th>
              <th className="text-right stat-label py-3 px-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const diff = row.current - row.previous;
              const pctChange = row.previous > 0 ? (diff / row.previous) * 100 : 0;
              const isGood = row.label === 'Expenses' ? diff < 0 : diff > 0;
              return (
                <tr key={row.label} className="border-b border-[var(--border-color)]">
                  <td className="py-3 px-2 text-sm font-medium text-th-heading">{row.label}</td>
                  <td className="py-3 px-2 text-sm text-right text-th-muted num">
                    {row.isPercent ? `${row.previous.toFixed(1)}%` : formatCurrency(row.previous)}
                  </td>
                  <td className={`py-3 px-2 text-sm text-right font-semibold num ${row.color}`}>
                    {row.isPercent ? `${row.current.toFixed(1)}%` : formatCurrency(row.current)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {row.previous > 0 && (
                      <span className={`tag ${isGood ? 'tag-success' : 'tag-danger'}`}>
                        {isGood ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {row.isPercent ? `${Math.abs(diff).toFixed(1)}pp` : formatPercent(pctChange)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function RecentTransactions() {
  const { transactions, selectedMonth } = useApp();
  const monthTxns = transactions
    .filter(t => t.date.startsWith(selectedMonth))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">Recent Transactions</h3>
        <a href="/transactions" className="text-sm text-[var(--text-accent)] font-medium hover:text-primary-300">View all</a>
      </div>
      <div className="space-y-1">
        {monthTxns.length === 0 && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center">
              <Receipt className="w-7 h-7 text-th-faint" />
            </div>
            <p className="text-sm font-medium text-th-body">No transactions yet</p>
            <p className="text-xs text-th-faint text-center max-w-[200px]">Add your first transaction to start tracking cash flow</p>
          </div>
        )}
        {monthTxns.map((txn) => (
          <div key={txn.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              txn.type === 'income' ? 'bg-[var(--bg-positive-subtle)] text-[var(--text-positive)]' : 'bg-[var(--bg-negative-subtle)] text-[var(--text-negative)]'
            }`}>
              {txn.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-th-heading truncate">{txn.description}</p>
              <p className="text-xs text-th-faint">{txn.date}</p>
            </div>
            <p className={`text-sm font-semibold num ${txn.type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountsSummary() {
  const { accounts } = useApp();
  const assets = accounts.filter(a => !a.isDebt).sort((a, b) => b.balance - a.balance).slice(0, 6);
  const debts = accounts.filter(a => a.isDebt).sort((a, b) => b.balance - a.balance).slice(0, 4);

  if (accounts.length === 0) return null;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">Accounts</h3>
        <a href="/accounts" className="text-sm text-[var(--text-accent)] font-medium hover:text-primary-300">View all</a>
      </div>
      <div className="space-y-2">
        <p className="stat-label">Assets</p>
        {assets.map(acc => (
          <div key={acc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: acc.color + '12' }}>
              {acc.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-th-heading truncate">{acc.name}</p>
              <p className="text-xs text-th-faint truncate">{acc.institution || ''}</p>
            </div>
            <p className="text-sm font-semibold text-th-heading num">{formatCurrency(acc.balance)}</p>
          </div>
        ))}
        {debts.length > 0 && (
          <>
            <div className="border-t border-[var(--border-color)] pt-2 mt-2">
              <p className="stat-label mb-2">Debts</p>
              {debts.map(acc => (
                <div key={acc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: acc.color + '12' }}>
                    {acc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-th-heading truncate">{acc.name}</p>
                    {acc.interestRate !== undefined && <p className="text-xs text-[var(--text-negative)]">{acc.interestRate}% APR</p>}
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-negative)] num">-{formatCurrency(acc.balance)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DividendTracker() {
  const { totalDividends, monthlyAvgDividend, dividendMonths } = useApp();
  if (totalDividends === 0) return null;

  return (
    <div className="chart-container">
      <h3 className="section-header mb-3">Dividend Income</h3>
      <div className="space-y-3">
        <div>
          <p className="stat-label">Total Dividends ({dividendMonths} quarters)</p>
          <p className="text-2xl font-bold text-[var(--text-positive)] num">{formatCurrency(totalDividends)}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="stat-label">Quarterly Avg</p>
            <p className="text-lg font-bold text-th-heading num">{formatCurrency(monthlyAvgDividend)}</p>
          </div>
          <div>
            <p className="stat-label">Projected Annual</p>
            <p className="text-lg font-bold text-th-heading num">{formatCurrency(monthlyAvgDividend * 4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="text-sm text-th-muted mt-1">Welcome to WealthPulse!</p>
      </div>
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center" style={{ background: 'var(--hero-bg)' }}>
        <div className="relative max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-3 tracking-tight text-th-heading">Start Tracking Your Wealth</h2>
          <p className="text-th-muted text-sm mb-8 leading-relaxed">Add your first account, transaction, or investment to see your financial dashboard come to life.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/accounts" className="btn-primary text-sm">Add Account</a>
            <a href="/crypto" className="btn-secondary text-sm">Add Crypto</a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Accounts', desc: 'Track checking, savings, 401k, IRA, brokerage, and more', href: '/accounts', icon: '🏦' },
          { title: 'Transactions', desc: 'Log income and expenses with smart categories', href: '/transactions', icon: '💳' },
          { title: 'Investments', desc: 'Monitor stocks and crypto with live price updates', href: '/crypto', icon: '📈' },
        ].map((item, i) => (
          <a
            key={item.title}
            href={item.href}
            className="stat-card hover:shadow-lg transition-all group cursor-pointer animate-slide-up"
            style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-2xl" />
            <span className="text-2xl mb-3 block">{item.icon}</span>
            <p className="text-base font-bold text-th-heading mb-1">{item.title}</p>
            <p className="text-xs text-th-muted leading-relaxed">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    loading, totalAssets, totalDebts, netWorth,
    monthIncome, monthExpenses, monthSavingsRate,
    incomeChange, expenseChange,
    selectedMonth, accounts, transactions,
    netWorthHistory,
  } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-th-muted text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0 && transactions.length === 0) {
    return <EmptyDashboard />;
  }

  const [y, m] = selectedMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Net worth change
  const hasNWHistory = netWorthHistory.length >= 2;
  const nwChange = hasNWHistory
    ? netWorthHistory[netWorthHistory.length - 1].netWorth - netWorthHistory[netWorthHistory.length - 2].netWorth
    : 0;
  const nwChangePercent = hasNWHistory && netWorthHistory[netWorthHistory.length - 2].netWorth > 0
    ? (nwChange / netWorthHistory[netWorthHistory.length - 2].netWorth) * 100
    : 0;

  const stats = [
    { title: 'Monthly Income', value: formatCurrency(monthIncome), change: incomeChange, icon: DollarSign, iconBg: 'bg-[var(--bg-positive-subtle)] text-[var(--text-accent)]' },
    { title: 'Monthly Expenses', value: formatCurrency(monthExpenses), change: expenseChange, icon: CreditCard, iconBg: 'bg-[var(--bg-negative-subtle)] text-[var(--text-negative)]' },
    { title: 'Savings Rate', value: `${monthSavingsRate.toFixed(1)}%`, change: undefined, icon: PiggyBank, iconBg: 'bg-grape-500/10 text-[var(--text-accent-secondary)]' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="text-sm text-th-muted mt-1">{monthLabel}</p>
        </div>
        <MonthSelector />
      </div>

      {/* Net Worth Hero — inspired by clean fintech cards */}
      <div className="rounded-3xl p-8 md:p-10 relative overflow-hidden" style={{ background: 'var(--hero-bg)' }}>
        <div className="flex flex-col items-center text-center mb-6">
          <p className="text-th-muted text-sm font-medium mb-3 tracking-wide uppercase">Net Worth</p>
          <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-th-heading num tracking-tighter leading-none">
            {formatCurrency(netWorth)}
          </p>
          {hasNWHistory && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-[var(--bg-positive-subtle)] text-[var(--text-accent)] px-4 py-1.5 rounded-full text-sm font-semibold">
              {nwChangePercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {nwChangePercent >= 0 ? '+' : ''}{nwChangePercent.toFixed(2)}%
            </div>
          )}
        </div>
        <div className="flex justify-center gap-8 md:gap-12">
          <div className="text-center">
            <p className="text-th-faint text-xs font-medium uppercase tracking-wider mb-1">Assets</p>
            <p className="text-xl md:text-2xl font-bold text-th-heading num">{formatCurrency(totalAssets)}</p>
          </div>
          <div className="w-px bg-[var(--border-color)] self-stretch" />
          <div className="text-center">
            <p className="text-th-faint text-xs font-medium uppercase tracking-wider mb-1">Debts</p>
            <p className="text-xl md:text-2xl font-bold text-th-heading num">{formatCurrency(totalDebts)}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.change !== undefined && <Delta value={stat.change} />}
              </div>
              <p className="stat-label mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-th-heading num">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Month Comparison */}
      <MonthComparison />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetWorthChart />
        <IncomeExpenseChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart type="expense" />
        <CategoryPieChart type="income" />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <DividendTracker />
          <AccountsSummary />
        </div>
      </div>

      <SavingsRateChart />
    </div>
  );
}
