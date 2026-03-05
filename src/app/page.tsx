'use client';

import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent, getChangeBgColor } from '@/lib/utils';
import { NetWorthChart } from '@/components/charts/NetWorthChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { SavingsRateChart } from '@/components/charts/SavingsRateChart';

function MonthSelector() {
  const { selectedMonth, setSelectedMonth, availableMonths } = useApp();
  return (
    <div className="relative">
      <select
        value={selectedMonth}
        onChange={e => setSelectedMonth(e.target.value)}
        className="appearance-none bg-white/80 border border-surface-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-surface-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      >
        {availableMonths.map(m => {
          const [y, mo] = m.split('-');
          const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return <option key={m} value={m}>{label}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
    </div>
  );
}

function StatCard({
  title, value, change, changeLabel, icon: Icon, gradient, iconBg,
}: {
  title: string; value: string; change?: number; changeLabel?: string;
  icon: React.ElementType; gradient: string; iconBg: string;
}) {
  return (
    <div className="stat-card group">
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`tag ${getChangeBgColor(change)}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {formatPercent(change)}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-surface-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
      {changeLabel && <p className="text-xs text-surface-400 mt-1">{changeLabel}</p>}
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
    { label: 'Income', current: monthIncome, previous: prevMonthIncome, color: 'text-success-600' },
    { label: 'Expenses', current: monthExpenses, previous: prevMonthExpenses, color: 'text-danger-600' },
    { label: 'Savings', current: monthSavings, previous: prevMonthSavings, color: 'text-primary-600' },
    { label: 'Savings Rate', current: monthSavingsRate, previous: prevMonthSavingsRate, color: 'text-grape-600', isPercent: true },
  ];

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Month-over-Month Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left text-xs font-semibold text-surface-400 uppercase tracking-wider py-3 px-2">Metric</th>
              <th className="text-right text-xs font-semibold text-surface-400 uppercase tracking-wider py-3 px-2">{prevLabel}</th>
              <th className="text-right text-xs font-semibold text-surface-400 uppercase tracking-wider py-3 px-2">{currLabel}</th>
              <th className="text-right text-xs font-semibold text-surface-400 uppercase tracking-wider py-3 px-2">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const diff = row.current - row.previous;
              const pctChange = row.previous > 0 ? (diff / row.previous) * 100 : 0;
              const isGood = row.label === 'Expenses' ? diff < 0 : diff > 0;
              return (
                <tr key={row.label} className="border-b border-surface-50">
                  <td className="py-3 px-2 text-sm font-medium text-surface-700">{row.label}</td>
                  <td className="py-3 px-2 text-sm text-right text-surface-500">
                    {row.isPercent ? `${row.previous.toFixed(1)}%` : formatCurrency(row.previous)}
                  </td>
                  <td className={`py-3 px-2 text-sm text-right font-semibold ${row.color}`}>
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
    </div>
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
        <a href="/transactions" className="text-sm text-primary-500 font-medium hover:text-primary-600">View all</a>
      </div>
      <div className="space-y-2">
        {monthTxns.length === 0 && <p className="text-sm text-surface-400 py-4 text-center">No transactions this month</p>}
        {monthTxns.map((txn) => (
          <div key={txn.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              txn.type === 'income' ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
            }`}>
              {txn.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">{txn.description}</p>
              <p className="text-xs text-surface-400">{txn.date}</p>
            </div>
            <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
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

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">Accounts Overview</h3>
        <a href="/accounts" className="text-sm text-primary-500 font-medium hover:text-primary-600">View all</a>
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Assets</p>
        {assets.map(acc => (
          <div key={acc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: acc.color + '18' }}>
              {acc.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">{acc.name}</p>
              <p className="text-xs text-surface-400">{acc.institution}</p>
            </div>
            <p className="text-sm font-semibold text-surface-800">{formatCurrency(acc.balance)}</p>
          </div>
        ))}
        <div className="border-t border-surface-100 pt-3 mt-3">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Debts</p>
          {debts.map(acc => (
            <div key={acc.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: acc.color + '18' }}>
                {acc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 truncate">{acc.name}</p>
                <p className="text-xs text-danger-400">{acc.interestRate}% APR</p>
              </div>
              <p className="text-sm font-semibold text-danger-600">-{formatCurrency(acc.balance)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DividendTracker() {
  const { totalDividends, monthlyAvgDividend, dividendMonths } = useApp();

  return (
    <div className="chart-container bg-gradient-to-br from-success-50 to-teal-50">
      <h3 className="section-header mb-3">Dividend Income</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-surface-500">Total Dividends ({dividendMonths} quarters)</p>
          <p className="text-2xl font-bold text-success-600">{formatCurrency(totalDividends)}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-surface-500">Quarterly Avg</p>
            <p className="text-lg font-bold text-surface-800">{formatCurrency(monthlyAvgDividend)}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500">Projected Annual</p>
            <p className="text-lg font-bold text-surface-800">{formatCurrency(monthlyAvgDividend * 4)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/60">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse-soft" />
          <p className="text-xs text-surface-600">Dividends are reinvested automatically</p>
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
        <p className="text-sm text-surface-500 mt-1">Welcome to WealthPulse!</p>
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-grape-500 to-accent-500 p-8 text-white text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-3">Start Tracking Your Wealth</h2>
          <p className="text-white/70 text-sm mb-6">Add your first account, transaction, or investment to see your financial dashboard come to life.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/accounts" className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 font-semibold text-sm transition-colors">Add Account</a>
            <a href="/transactions" className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 font-semibold text-sm transition-colors">Add Transaction</a>
            <a href="/crypto" className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 font-semibold text-sm transition-colors">Add Crypto</a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Accounts', desc: 'Track checking, savings, 401k, IRA, and more', href: '/accounts' },
          { title: 'Transactions', desc: 'Log income and expenses with categories', href: '/transactions' },
          { title: 'Investments', desc: 'Monitor stocks and crypto with live prices', href: '/crypto' },
        ].map(item => (
          <a key={item.title} href={item.href} className="stat-card hover:shadow-lg transition-all group cursor-pointer">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-grape-400" />
            <p className="text-lg font-bold text-surface-800 mb-1">{item.title}</p>
            <p className="text-xs text-surface-500">{item.desc}</p>
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
    selectedMonth, accounts, transactions, availableMonths,
  } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-surface-500 text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Show empty state for new users
  if (accounts.length === 0 && transactions.length === 0) {
    return <EmptyDashboard />;
  }

  const [y, m] = selectedMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with month selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Financial snapshot for {monthLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {availableMonths.length > 0 && <MonthSelector />}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          change={3.4}
          changeLabel="vs last month"
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-primary-500 to-grape-500"
          iconBg="bg-primary-100 text-primary-600"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthIncome)}
          change={incomeChange}
          changeLabel="vs previous month"
          icon={DollarSign}
          gradient="bg-gradient-to-r from-success-500 to-teal-500"
          iconBg="bg-success-100 text-success-600"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthExpenses)}
          change={expenseChange}
          changeLabel="vs previous month"
          icon={CreditCard}
          gradient="bg-gradient-to-r from-danger-500 to-accent-500"
          iconBg="bg-danger-100 text-danger-600"
        />
        <StatCard
          title="Savings Rate"
          value={`${monthSavingsRate.toFixed(1)}%`}
          change={monthSavingsRate - 70} // relative to 70% target
          changeLabel="target: 70%"
          icon={PiggyBank}
          gradient="bg-gradient-to-r from-grape-500 to-accent-500"
          iconBg="bg-grape-100 text-grape-600"
        />
      </div>

      {/* Assets / Debts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success-400 to-teal-400" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-success-100 text-success-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Total Assets</p>
              <p className="text-xl font-bold text-success-600">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-danger-400 to-accent-400" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-danger-100 text-danger-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-surface-500">Total Debts</p>
              <p className="text-xl font-bold text-danger-600">{formatCurrency(totalDebts)}</p>
            </div>
          </div>
        </div>
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
