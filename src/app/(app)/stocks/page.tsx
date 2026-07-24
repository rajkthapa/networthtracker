'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { useToast } from '@/lib/toast-context';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { StockHolding } from '@/lib/types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCcw, LineChart, Plus, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { EditStockModal } from '@/components/modals/EditStockModal';

const STOCK_PALETTE = ['#4c6ef5', '#40c057', '#f59f00', '#e64980', '#7950f2', '#15aabf', '#fd7e14', '#20c997', '#be4bdb', '#fa5252'];

function colorForTicker(ticker: string): string {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  return STOCK_PALETTE[Math.abs(hash) % STOCK_PALETTE.length];
}

type SortKey = 'ticker' | 'price' | 'change24h' | 'shares' | 'value' | 'pnl' | 'pnlPercent';

export default function StocksPage() {
  const { stockHoldings, accounts, deleteStockHolding, refreshStockPrices, pricesLoading } = useApp();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState<StockHolding | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'ticker' ? 'asc' : 'desc');
    }
  };

  const accountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'Unknown account';

  const totalValue = stockHoldings.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const totalCost = stockHoldings.reduce((s, h) => s + h.shares * h.avgCostBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const pieData = stockHoldings.map(h => ({
    name: h.ticker,
    value: Math.round(h.shares * h.currentPrice * 100) / 100,
    color: colorForTicker(h.ticker),
  }));

  const performers = stockHoldings.map(h => ({
    ticker: h.ticker,
    pnlPercent: h.avgCostBasis > 0 ? ((h.currentPrice - h.avgCostBasis) / h.avgCostBasis) * 100 : 0,
  })).sort((a, b) => b.pnlPercent - a.pnlPercent);

  const bestPerformer = performers[0];
  const worstPerformer = performers[performers.length - 1];

  const positionsByValue = [...stockHoldings].sort((a, b) => (b.shares * b.currentPrice) - (a.shares * a.currentPrice));
  const topHolding = positionsByValue[0];
  const topConcentration = topHolding && totalValue > 0 ? ((topHolding.shares * topHolding.currentPrice) / totalValue) * 100 : 0;

  const enrichedHoldings = useMemo(() => stockHoldings.map(h => {
    const value = h.shares * h.currentPrice;
    const cost = h.shares * h.avgCostBasis;
    const pnl = value - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
    return { ...h, value, cost, pnl, pnlPercent };
  }), [stockHoldings]);

  const sortedHoldings = useMemo(() => {
    const arr = [...enrichedHoldings];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'ticker': cmp = a.ticker.localeCompare(b.ticker); break;
        case 'price': cmp = a.currentPrice - b.currentPrice; break;
        case 'change24h': cmp = a.priceChange24h - b.priceChange24h; break;
        case 'shares': cmp = a.shares - b.shares; break;
        case 'value': cmp = a.value - b.value; break;
        case 'pnl': cmp = a.pnl - b.pnl; break;
        case 'pnlPercent': cmp = a.pnlPercent - b.pnlPercent; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [enrichedHoldings, sortKey, sortDir]);

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Stock Portfolio</h1>
          <p className="text-sm text-th-muted mt-1">{stockHoldings.length} positions tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshStockPrices} disabled={pricesLoading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCcw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
            {pricesLoading ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'var(--hero-section-bg)', color: 'var(--hero-section-text)' }}>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="w-5 h-5" />
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
              <button onClick={() => setShowAddModal(true)} className="mt-2 text-sm text-[var(--text-accent)] hover:underline">Add your first stock</button>
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
                  <th className="text-left text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">
                    <button onClick={() => handleSort('ticker')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                      Stock <SortIcon active={sortKey === 'ticker'} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">
                    <button onClick={() => handleSort('price')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                      Price <SortIcon active={sortKey === 'price'} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2 hidden sm:table-cell">
                    <button onClick={() => handleSort('change24h')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                      24h <SortIcon active={sortKey === 'change24h'} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">
                    <button onClick={() => handleSort('shares')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                      Shares <SortIcon active={sortKey === 'shares'} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">
                    <button onClick={() => handleSort('value')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                      Value <SortIcon active={sortKey === 'value'} />
                    </button>
                  </th>
                  <th className="text-right text-xs font-semibold text-th-faint uppercase tracking-wider py-3 px-2">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => handleSort('pnlPercent')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                        % <SortIcon active={sortKey === 'pnlPercent'} />
                      </button>
                      <button onClick={() => handleSort('pnl')} className="inline-flex items-center gap-1 hover:text-th-heading transition-colors">
                        P&L <SortIcon active={sortKey === 'pnl'} />
                      </button>
                    </div>
                  </th>
                  <th className="py-3 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map(holding => {
                  const value = holding.value;
                  const cost = holding.cost;
                  const pnl = holding.pnl;
                  const pnlPercent = holding.pnlPercent;
                  const color = colorForTicker(holding.ticker);

                  return (
                    <tr key={holding.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-inset)] transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: color }}>
                            {holding.ticker.slice(0, 4)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-th-heading">{holding.name}</p>
                            <p className="text-xs text-th-faint">{holding.ticker} · {accountName(holding.accountId)}</p>
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
                        <p className="text-sm font-medium text-th-heading">{holding.shares} sh</p>
                        <p className="text-xs text-th-faint">Avg: {formatCurrency(holding.avgCostBasis)}</p>
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
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditingHolding(holding)}
                            className="p-1.5 rounded-lg text-th-faint hover:text-primary-500 hover:bg-primary-500/10"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { deleteStockHolding(holding.id); toast(`${holding.ticker} removed`); }}
                            className="p-1.5 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {stockHoldings.length > 0 && (
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
            {stockHoldings.length === 0 && (
              <div className="text-center py-12 text-th-faint">
                <p className="text-lg mb-2">No stock holdings yet</p>
                <button onClick={() => setShowAddModal(true)} className="text-sm text-[var(--text-accent)] hover:underline">Add your first position</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stockHoldings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card border-l-4 border-primary-500/50">
            <p className="stat-label">Top Position Concentration</p>
            <p className="text-lg font-bold text-th-heading num">{topHolding?.ticker} {topConcentration.toFixed(1)}%</p>
          </div>
          <div className="stat-card border-l-4 border-success-500/50">
            <p className="stat-label">Total Cost Basis</p>
            <p className="text-lg font-bold text-th-heading num">{formatCurrency(totalCost)}</p>
          </div>
          <div className="stat-card border-l-4 border-grape-500/50">
            <p className="stat-label">Best Performer</p>
            <p className="text-lg font-bold text-[var(--text-positive)] num">{bestPerformer?.ticker} {formatPercent(bestPerformer?.pnlPercent || 0)}</p>
          </div>
          <div className="stat-card border-l-4 border-danger-500/50">
            <p className="stat-label">Worst Performer</p>
            <p className="text-lg font-bold text-[var(--text-negative)] num">{worstPerformer?.ticker} {formatPercent(worstPerformer?.pnlPercent || 0)}</p>
          </div>
        </div>
      )}

      {showAddModal && <AddStockModal onClose={() => setShowAddModal(false)} />}
      {editingHolding && <EditStockModal holding={editingHolding} onClose={() => setEditingHolding(null)} />}
    </div>
  );
}
