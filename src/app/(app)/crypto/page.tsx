'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCcw, Bitcoin, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AddCryptoModal } from '@/components/modals/AddCryptoModal';

const CRYPTO_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff', ADA: '#0033ad', LINK: '#2a5ada', DOT: '#e6007a',
};

const CRYPTO_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', SOL: '◎', ADA: '₳', LINK: '⬡', DOT: '●',
};

export default function CryptoPage() {
  const { cryptoHoldings, deleteCryptoHolding, refreshCryptoPrices, pricesLoading } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalValue = cryptoHoldings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalCost = cryptoHoldings.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const pieData = cryptoHoldings.map(h => ({
    name: h.symbol,
    value: Math.round(h.quantity * h.currentPrice * 100) / 100,
    color: CRYPTO_COLORS[h.symbol] || '#868e96',
  }));

  const performers = cryptoHoldings.map(h => ({
    symbol: h.symbol,
    pnlPercent: h.avgBuyPrice > 0 ? ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0,
  })).sort((a, b) => b.pnlPercent - a.pnlPercent);

  const bestPerformer = performers[0];
  const worstPerformer = performers[performers.length - 1];

  const btcHolding = cryptoHoldings.find(h => h.symbol === 'BTC');
  const btcValue = btcHolding ? btcHolding.quantity * btcHolding.currentPrice : 0;
  const btcDominance = totalValue > 0 ? (btcValue / totalValue) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Crypto Portfolio</h1>
          <p className="text-sm text-th-muted mt-1">{cryptoHoldings.length} assets tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshCryptoPrices} disabled={pricesLoading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCcw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
            {pricesLoading ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Coin
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'var(--hero-section-bg)', color: 'var(--hero-section-text)' }}>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-warning-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5" />
            <p className="text-white/80 text-sm font-medium">Total Portfolio Value</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-3 num">{formatCurrency(totalValue)}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${totalPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {totalPnL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-semibold text-sm">{formatCurrency(totalPnL)} ({formatPercent(totalPnLPercent)})</span>
            </div>
            <span className="text-white/50 text-sm">All Time P&L</span>
          </div>
          <div className="flex gap-4 mt-3 text-sm text-white/70">
            <span>Cost basis: {formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation */}
        <div className="chart-container">
          <h3 className="section-header mb-4">Allocation</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="font-medium text-th-body">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-th-muted">{formatCurrency(d.value)}</span>
                      <span className="text-th-faint">({totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-th-faint">
              <p>No holdings yet</p>
              <button onClick={() => setShowAddModal(true)} className="mt-2 text-sm text-[var(--text-accent)] hover:underline">Add your first coin</button>
            </div>
          )}
        </div>

        {/* Holdings Table */}
        <div className="lg:col-span-2 chart-container">
          <h3 className="section-header mb-4">Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">Asset</th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">Price</th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2 hidden sm:table-cell">24h</th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">Holdings</th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">Value</th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">P&L</th>
                  <th className="py-3 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {cryptoHoldings.map(holding => {
                  const value = holding.quantity * holding.currentPrice;
                  const cost = holding.quantity * holding.avgBuyPrice;
                  const pnl = value - cost;
                  const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
                  const color = CRYPTO_COLORS[holding.symbol] || '#868e96';

                  return (
                    <tr key={holding.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-inset)] transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: color }}>
                            {CRYPTO_ICONS[holding.symbol] || holding.symbol[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-th-heading">{holding.name}</p>
                            <p className="text-xs text-th-faint">{holding.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <p className="text-sm font-semibold text-th-heading">{formatCurrency(holding.currentPrice)}</p>
                      </td>
                      <td className="py-4 px-2 text-right hidden sm:table-cell">
                        <div className={`inline-flex items-center gap-1 tag ${holding.priceChange24h >= 0 ? 'tag-success' : 'tag-danger'}`}>
                          {holding.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(holding.priceChange24h).toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <p className="text-sm font-medium text-th-heading">{holding.quantity} {holding.symbol}</p>
                        <p className="text-xs text-th-faint">Avg: {formatCurrency(holding.avgBuyPrice)}</p>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <p className="text-sm font-bold text-th-heading">{formatCurrency(value)}</p>
                        <p className="text-xs text-th-faint">Cost: {formatCurrency(cost)}</p>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <p className={`text-sm font-bold ${pnl >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </p>
                        <p className={`text-xs ${pnl >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                          {formatPercent(pnlPercent)}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <button
                          onClick={() => deleteCryptoHolding(holding.id)}
                          className="p-1.5 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {cryptoHoldings.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--border-strong)]">
                    <td colSpan={4} className="py-3 px-2 text-sm font-bold text-th-heading">Total</td>
                    <td className="py-3 px-2 text-right text-sm font-bold text-th-heading">{formatCurrency(totalValue)}</td>
                    <td className={`py-3 px-2 text-right text-sm font-bold ${totalPnL >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                      {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
            {cryptoHoldings.length === 0 && (
              <div className="text-center py-12 text-th-faint">
                <p className="text-lg mb-2">No crypto holdings yet</p>
                <button onClick={() => setShowAddModal(true)} className="text-sm text-[var(--text-accent)] hover:underline">Add your first position</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {cryptoHoldings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card border-l-4 border-warning-500/50">
            <p className="stat-label">Bitcoin Dominance</p>
            <p className="text-lg font-bold text-th-heading num">{btcDominance.toFixed(1)}%</p>
          </div>
          <div className="stat-card border-l-4 border-success-500/50">
            <p className="stat-label">Total Cost Basis</p>
            <p className="text-lg font-bold text-th-heading num">{formatCurrency(totalCost)}</p>
          </div>
          <div className="stat-card border-l-4 border-grape-500/50">
            <p className="stat-label">Best Performer</p>
            <p className="text-lg font-bold text-[var(--text-positive)] num">{bestPerformer?.symbol} {formatPercent(bestPerformer?.pnlPercent || 0)}</p>
          </div>
          <div className="stat-card border-l-4 border-danger-500/50">
            <p className="stat-label">Worst Performer</p>
            <p className="text-lg font-bold text-[var(--text-negative)] num">{worstPerformer?.symbol} {formatPercent(worstPerformer?.pnlPercent || 0)}</p>
          </div>
        </div>
      )}

      {showAddModal && <AddCryptoModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
