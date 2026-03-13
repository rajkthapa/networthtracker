'use client';

import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { ArrowUpRight, Calendar, Target } from 'lucide-react';

export default function NetWorthPage() {
  const { netWorthHistory, totalAssets, totalDebts, netWorth, accounts, monthlyData } = useApp();

  // Safety: ensure we have at least 2 data points
  const hasHistory = netWorthHistory.length >= 2;
  const currentNW = netWorthHistory[netWorthHistory.length - 1] || { netWorth: 0, totalAssets: 0, totalDebts: 0 };
  const prevNW = netWorthHistory[netWorthHistory.length - 2] || currentNW;
  const startNW = netWorthHistory[0] || currentNW;

  const monthlyChange = currentNW.netWorth - prevNW.netWorth;
  const monthlyChangePercent = prevNW.netWorth > 0 ? (monthlyChange / prevNW.netWorth) * 100 : 0;
  const totalChange = currentNW.netWorth - startNW.netWorth;
  const totalChangePercent = startNW.netWorth > 0 ? (totalChange / startNW.netWorth) * 100 : 0;

  // Month-over-month growth
  const yoyData = netWorthHistory.slice(1).map((snap, i) => {
    const prev = netWorthHistory[i];
    const change = snap.netWorth - prev.netWorth;
    return {
      date: snap.date,
      change,
      growth: prev.netWorth > 0 ? (change / prev.netWorth) * 100 : 0,
    };
  });

  // Asset breakdown for chart
  const assetBreakdown = accounts.filter(a => !a.isDebt).map(a => ({
    name: a.name.length > 20 ? a.name.slice(0, 20) + '...' : a.name,
    value: a.balance,
    color: a.color,
  })).sort((a, b) => b.value - a.value);



  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Net Worth</h1>
        <p className="text-sm text-th-muted mt-1">Track your wealth building journey</p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-grape-900 p-8 text-white">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium mb-2">Current Net Worth</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 num">{formatCurrency(netWorth)}</h2>
          <div className="flex flex-wrap gap-4">
            {hasHistory && (
              <>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <ArrowUpRight className="w-4 h-4 text-success-300" />
                  <span className="text-sm font-semibold">{formatCurrency(monthlyChange)} this month</span>
                  <span className="text-xs text-white/60">({formatPercent(monthlyChangePercent)})</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Calendar className="w-4 h-4 text-warning-300" />
                  <span className="text-sm font-semibold">{formatCurrency(totalChange)} total growth</span>
                  <span className="text-xs text-white/60">({formatPercent(totalChangePercent)})</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-success-500/50">
          <p className="stat-label">Assets</p>
          <p className="text-lg font-bold text-success-400 num">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="stat-card border-l-4 border-danger-500/50">
          <p className="stat-label">Debts</p>
          <p className="text-lg font-bold text-danger-400 num">{formatCurrency(totalDebts)}</p>
        </div>
        <div className="stat-card border-l-4 border-primary-500/50">
          <p className="stat-label">Debt-to-Asset Ratio</p>
          <p className="text-lg font-bold text-primary-400 num">{totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="stat-card border-l-4 border-grape-500/50">
          <p className="stat-label">Avg Monthly Growth</p>
          <p className="text-lg font-bold text-grape-400 num">{netWorthHistory.length > 1 ? formatCurrency(totalChange / (netWorthHistory.length - 1)) : '$0'}</p>
        </div>
      </div>

      {/* Net Worth History Chart */}
      <div className="chart-container">
        <h3 className="section-header mb-4">Net Worth History</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={netWorthHistory}>
            <defs>
              <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="debtFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name === 'netWorth' ? 'Net Worth' : name === 'totalAssets' ? 'Assets' : 'Debts']} />
            <Legend />
            <Area type="monotone" dataKey="totalAssets" stroke="#10b981" fill="url(#assetFill)" strokeWidth={2} name="totalAssets" />
            <Area type="monotone" dataKey="totalDebts" stroke="#ef4444" fill="url(#debtFill)" strokeWidth={2} name="totalDebts" />
            <Area type="monotone" dataKey="netWorth" stroke="#14b8a6" fill="url(#nwFill)" strokeWidth={3} name="netWorth" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Growth + Asset Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="section-header mb-4">Monthly Net Worth Change</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="change" radius={[6, 6, 0, 0]}>
                {yoyData.map((entry, i) => (
                  <Cell key={i} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-header mb-4">Asset Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v, true)} fontSize={12} stroke="var(--chart-axis)" />
              <YAxis type="category" dataKey="name" fontSize={10} stroke="var(--chart-axis)" width={140} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {assetBreakdown.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expense + Savings trend from actual transactions */}
      <div className="chart-container">
        <h3 className="section-header mb-4">Income vs Expenses (from Transactions)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name]} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="Expenses" />
            <Bar dataKey="savings" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones */}
      <div className="chart-container">
        <h3 className="section-header mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          Net Worth Milestones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[100000, 250000, 500000, 1000000].map(milestone => {
            const progress = Math.min((netWorth / milestone) * 100, 100);
            const achieved = netWorth >= milestone;
            return (
              <div key={milestone} className={`p-4 rounded-2xl ${achieved ? 'bg-success-500/15 border-2 border-success-500/30' : 'bg-th-card/80 border border-[var(--border-color)]'}`}>
                <p className="text-xs text-th-muted mb-1">{achieved ? 'Achieved!' : 'Target'}</p>
                <p className={`text-lg font-bold ${achieved ? 'text-success-400' : 'text-th-heading'}`}>{formatCurrency(milestone, true)}</p>
                <div className="w-full h-2 bg-[var(--bg-hover-strong)] rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${achieved ? 'bg-success-500' : 'bg-primary-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-th-faint mt-1">{progress.toFixed(1)}% {achieved ? '' : `(${formatCurrency(milestone - netWorth, true)} to go)`}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
