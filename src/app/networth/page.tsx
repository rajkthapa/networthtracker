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
        <p className="text-sm text-surface-500 mt-1">Track your wealth building journey</p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-grape-600 to-accent-600 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium mb-2">Current Net Worth</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{formatCurrency(netWorth)}</h2>
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
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success-400 to-success-500" />
          <p className="text-xs text-surface-500">Assets</p>
          <p className="text-lg font-bold text-success-600">{formatCurrency(totalAssets)}</p>
        </div>
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-danger-400 to-danger-500" />
          <p className="text-xs text-surface-500">Debts</p>
          <p className="text-lg font-bold text-danger-600">{formatCurrency(totalDebts)}</p>
        </div>
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-500" />
          <p className="text-xs text-surface-500">Debt-to-Asset Ratio</p>
          <p className="text-lg font-bold text-primary-600">{totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="stat-card">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-grape-400 to-grape-500" />
          <p className="text-xs text-surface-500">Avg Monthly Growth</p>
          <p className="text-lg font-bold text-grape-600">{netWorthHistory.length > 1 ? formatCurrency(totalChange / (netWorthHistory.length - 1)) : '$0'}</p>
        </div>
      </div>

      {/* Net Worth History Chart */}
      <div className="chart-container">
        <h3 className="section-header mb-4">Net Worth History</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={netWorthHistory}>
            <defs>
              <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#40c057" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#40c057" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="debtFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fa5252" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#fa5252" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
            <XAxis dataKey="date" stroke="#8b95ad" fontSize={12} tickLine={false} />
            <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name === 'netWorth' ? 'Net Worth' : name === 'totalAssets' ? 'Assets' : 'Debts']} />
            <Legend />
            <Area type="monotone" dataKey="totalAssets" stroke="#40c057" fill="url(#assetFill)" strokeWidth={2} name="totalAssets" />
            <Area type="monotone" dataKey="totalDebts" stroke="#fa5252" fill="url(#debtFill)" strokeWidth={2} name="totalDebts" />
            <Area type="monotone" dataKey="netWorth" stroke="#4c6ef5" fill="url(#nwFill)" strokeWidth={3} name="netWorth" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Growth + Asset Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="section-header mb-4">Monthly Net Worth Change</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
              <XAxis dataKey="date" stroke="#8b95ad" fontSize={11} tickLine={false} />
              <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Bar dataKey="change" radius={[6, 6, 0, 0]}>
                {yoyData.map((entry, i) => (
                  <Cell key={i} fill={entry.change >= 0 ? '#40c057' : '#fa5252'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="section-header mb-4">Asset Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assetBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v, true)} fontSize={12} stroke="#8b95ad" />
              <YAxis type="category" dataKey="name" fontSize={10} stroke="#8b95ad" width={140} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
            <XAxis dataKey="month" stroke="#8b95ad" fontSize={11} tickLine={false} />
            <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name]} />
            <Legend />
            <Bar dataKey="income" fill="#40c057" radius={[6, 6, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#fa5252" radius={[6, 6, 0, 0]} name="Expenses" />
            <Bar dataKey="savings" fill="#4c6ef5" radius={[6, 6, 0, 0]} name="Savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones */}
      <div className="chart-container bg-gradient-to-br from-primary-50 to-grape-50">
        <h3 className="section-header mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          Net Worth Milestones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[100000, 250000, 500000, 1000000].map(milestone => {
            const progress = Math.min((netWorth / milestone) * 100, 100);
            const achieved = netWorth >= milestone;
            return (
              <div key={milestone} className={`p-4 rounded-2xl ${achieved ? 'bg-success-100 border-2 border-success-300' : 'bg-white/60 border border-surface-100'}`}>
                <p className="text-xs text-surface-500 mb-1">{achieved ? 'Achieved!' : 'Target'}</p>
                <p className={`text-lg font-bold ${achieved ? 'text-success-600' : 'text-surface-700'}`}>{formatCurrency(milestone, true)}</p>
                <div className="w-full h-2 bg-surface-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${achieved ? 'bg-success-500' : 'bg-primary-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-surface-400 mt-1">{progress.toFixed(1)}% {achieved ? '' : `(${formatCurrency(milestone - netWorth, true)} to go)`}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
