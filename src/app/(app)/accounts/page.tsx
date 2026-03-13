'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Building2, Edit3, Check, X, ChevronDown, ChevronRight, RefreshCcw, Calendar } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent, ACCOUNT_TYPES, LIQUID_ACCOUNT_TYPES } from '@/lib/utils';
import type { Account, AccountSnapshot } from '@/lib/types';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useSubscription } from '@/lib/subscription-context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const INVESTMENT_TYPES = ['401k', 'ira', 'roth_ira', 'brokerage', 'hsa'];

export default function AccountsPage() {
  const { accounts, totalAssets, totalDebts, netWorth, deleteAccount, updateAccount, getStocksByAccount, deleteStockHolding, refreshStockPrices, pricesLoading, accountSnapshots, upsertAccountSnapshot, getAccountBalanceForMonth, snapshotMonths } = useApp();
  const { isPro } = useSubscription();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<{ accountId: string; accountName: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const assets = accounts.filter(a => !a.isDebt).sort((a, b) => b.balance - a.balance);
  const liquidAssets = assets.filter(a => LIQUID_ACCOUNT_TYPES.includes(a.type));
  const illiquidAssets = assets.filter(a => !LIQUID_ACCOUNT_TYPES.includes(a.type));
  const totalLiquid = liquidAssets.reduce((s, a) => s + a.balance, 0);
  const totalIlliquid = illiquidAssets.reduce((s, a) => s + a.balance, 0);
  const debts = accounts.filter(a => a.isDebt).sort((a, b) => b.balance - a.balance);

  const assetsByType = assets.reduce((acc, a) => {
    const type = ACCOUNT_TYPES.find(t => t.id === a.type);
    const name = type?.name || a.type;
    acc[name] = (acc[name] || 0) + a.balance;
    return acc;
  }, {} as Record<string, number>);

  const assetPieData = Object.entries(assetsByType).map(([name, value]) => {
    const type = ACCOUNT_TYPES.find(t => t.name === name);
    return { name, value, color: type?.color || '#868e96' };
  }).sort((a, b) => b.value - a.value);

  const startEdit = (id: string, balance: number) => {
    setEditingId(id);
    setEditBalance(balance.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editBalance);
    if (!isNaN(val)) updateAccount(id, { balance: val });
    setEditingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isInvestmentAccount = (type: string) => INVESTMENT_TYPES.includes(type);

  const debtToAssetRatio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;
  const totalInterestPerYear = debts.reduce((s, d) => s + (d.balance * (d.interestRate || 0) / 100), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Accounts & Assets</h1>
          <p className="text-sm text-th-muted mt-1">{assets.length} assets, {debts.length} debts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshStockPrices} disabled={pricesLoading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium text-th-body hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50">
            <RefreshCcw className={`w-4 h-4 ${pricesLoading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </button>
          <button onClick={() => {
            if (!isPro && accounts.length >= 3) {
              setShowUpgradeModal(true);
            } else {
              setShowAddModal(true);
            }
          }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Account
            {!isPro && <span className="text-xs opacity-70">({accounts.length}/3)</span>}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-success-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-positive-subtle)] text-[var(--text-positive)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Total Assets</p>
              <p className="text-lg font-bold text-[var(--text-positive)] num">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-danger-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-negative-subtle)] text-[var(--text-negative)] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Total Debts</p>
              <p className="text-lg font-bold text-[var(--text-negative)] num">{formatCurrency(totalDebts)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-primary-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500/15 text-[var(--text-accent)] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Net Worth</p>
              <p className="text-lg font-bold text-[var(--text-accent)] num">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-warning-500/50">
          <div>
            <p className="stat-label">Debt-to-Asset Ratio</p>
            <p className="text-lg font-bold text-th-heading num">{debtToAssetRatio.toFixed(1)}%</p>
            <p className="text-[10px] text-th-faint mt-0.5 num">Annual interest: {formatCurrency(totalInterestPerYear)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="section-header mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={assetPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={3} strokeWidth={0}>
                {assetPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {assetPieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-th-body">{d.name}</span>
                <span className="text-th-faint">({((d.value / totalAssets) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3 className="section-header mb-4">Debt Breakdown</h3>
          {debts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={debts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v, true)} fontSize={12} stroke="var(--chart-axis)" />
                <YAxis type="category" dataKey="name" fontSize={11} stroke="var(--chart-axis)" width={120} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="balance" radius={[0, 6, 6, 0]}>
                  {debts.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-th-faint">
              <p>No debts - great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Assets List */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--text-positive)]" />
            Assets ({assets.length})
          </h3>
          <p className="text-sm font-semibold text-[var(--text-positive)]">Total: {formatCurrency(totalAssets)}</p>
        </div>

        {/* Liquid / Illiquid summary */}
        {assets.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-[var(--bg-teal-subtle)] border border-[var(--border-teal)]">
              <p className="text-[10px] font-semibold text-[var(--text-teal-label)] uppercase tracking-wider mb-0.5">Liquid</p>
              <p className="text-lg font-bold text-[var(--text-teal)] num">{formatCurrency(totalLiquid)}</p>
              <p className="text-[10px] text-[var(--text-teal-label)]">{liquidAssets.length} account{liquidAssets.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-amber-subtle)] border border-[var(--border-amber)]">
              <p className="text-[10px] font-semibold text-[var(--text-amber-label)] uppercase tracking-wider mb-0.5">Illiquid</p>
              <p className="text-lg font-bold text-[var(--text-amber)] num">{formatCurrency(totalIlliquid)}</p>
              <p className="text-[10px] text-[var(--text-amber-label)]">{illiquidAssets.length} account{illiquidAssets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {liquidAssets.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[var(--text-teal-label)] uppercase tracking-wider mb-3">Liquid Assets</p>
            <div className="space-y-3">
              {liquidAssets.map(acc => {
                const isInvestment = isInvestmentAccount(acc.type);
                const stocks = isInvestment ? getStocksByAccount(acc.id) : [];
                const isExpanded = expandedAccounts.has(acc.id);
                const stocksValue = stocks.reduce((s, st) => s + st.shares * st.currentPrice, 0);
                const stocksCost = stocks.reduce((s, st) => s + st.shares * st.avgCostBasis, 0);
                const stocksPnL = stocksValue - stocksCost;

                return (
                  <div key={acc.id} className="rounded-2xl border border-[var(--border-color)] hover:border-[var(--border-stronger)] transition-all overflow-hidden">
                    <div className="flex items-center gap-3 p-4 group">
                      {isInvestment ? (
                        <button onClick={() => toggleExpand(acc.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-strong)] transition-colors text-th-faint">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '18' }}>
                        {acc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-th-heading truncate">{acc.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-th-faint">{acc.institution || ACCOUNT_TYPES.find(t => t.id === acc.type)?.name || acc.type}</p>
                          {isInvestment && stocks.length > 0 && (
                            <span className="text-[10px] text-th-faint bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-full">{stocks.length} positions</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === acc.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="input-field w-28 py-1 text-sm" autoFocus />
                            <button onClick={() => saveEdit(acc.id)} className="p-1.5 rounded-lg text-success-400 hover:bg-success-500/10"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-th-faint hover:bg-[var(--bg-hover)]"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-th-heading num">{formatCurrency(acc.balance)}</p>
                            <button onClick={() => startEdit(acc.id, acc.balance)} className="p-1.5 rounded-lg text-th-faint hover:text-primary-500 hover:bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>

                    {isInvestment && isExpanded && (
                      <div className="border-t border-[var(--border-color)] bg-[var(--bg-inset)] px-4 pb-4">
                        <div className="flex items-center justify-between py-3">
                          <p className="text-xs font-semibold text-th-muted uppercase tracking-wider">Stock Positions</p>
                          <div className="flex items-center gap-3">
                            {stocks.length > 0 && (
                              <span className={`text-xs font-semibold ${stocksPnL >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                                P&L: {stocksPnL >= 0 ? '+' : ''}{formatCurrency(stocksPnL)}
                              </span>
                            )}
                            <button onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })} className="flex items-center gap-1 text-xs text-[var(--text-accent)] hover:text-[var(--text-accent)] font-medium">
                              <Plus className="w-3.5 h-3.5" /> Add Position
                            </button>
                          </div>
                        </div>
                        {stocks.length > 0 ? (
                          <div className="space-y-2">
                            {stocks.map(stock => {
                              const value = stock.shares * stock.currentPrice;
                              const cost = stock.shares * stock.avgCostBasis;
                              const pnl = value - cost;
                              const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
                              return (
                                <div key={stock.id} className="flex items-center gap-3 p-3 rounded-xl bg-th-card border border-[var(--border-color)] group/stock">
                                  <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[var(--text-accent)]">{stock.ticker}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-th-heading truncate">{stock.name}</p>
                                    <p className="text-[10px] text-th-faint">{stock.shares} shares @ {formatCurrency(stock.avgCostBasis)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-th-heading">{formatCurrency(value)}</p>
                                    <p className={`text-[10px] font-semibold ${pnl >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                                    </p>
                                  </div>
                                  <button onClick={() => deleteStockHolding(stock.id)} className="p-1 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover/stock:opacity-100 transition-all">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                            <div className="flex items-center justify-between pt-2 px-1 text-xs text-th-muted border-t border-[var(--border-color)]">
                              <span>Total ({stocks.length} positions)</span>
                              <span className="font-semibold text-th-heading">{formatCurrency(stocksValue)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-th-faint text-xs">
                            <p>No positions yet.</p>
                            <button onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })} className="mt-1 text-[var(--text-accent)] hover:underline">Add your first stock position</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {illiquidAssets.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[var(--text-amber-label)] uppercase tracking-wider mb-3">Illiquid Assets</p>
            <div className="space-y-3">
              {illiquidAssets.map(acc => {
                const isInvestment = isInvestmentAccount(acc.type);
                const stocks = isInvestment ? getStocksByAccount(acc.id) : [];
                const isExpanded = expandedAccounts.has(acc.id);
                const stocksValue = stocks.reduce((s, st) => s + st.shares * st.currentPrice, 0);
                const stocksCost = stocks.reduce((s, st) => s + st.shares * st.avgCostBasis, 0);
                const stocksPnL = stocksValue - stocksCost;

                return (
                  <div key={acc.id} className="rounded-2xl border border-[var(--border-color)] hover:border-[var(--border-stronger)] transition-all overflow-hidden">
                    <div className="flex items-center gap-3 p-4 group">
                      {isInvestment ? (
                        <button onClick={() => toggleExpand(acc.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-strong)] transition-colors text-th-faint">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '18' }}>
                        {acc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-th-heading truncate">{acc.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-th-faint">{acc.institution || ACCOUNT_TYPES.find(t => t.id === acc.type)?.name || acc.type}</p>
                          {isInvestment && stocks.length > 0 && (
                            <span className="text-[10px] text-th-faint bg-[var(--bg-hover)] px-1.5 py-0.5 rounded-full">{stocks.length} positions</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === acc.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="input-field w-28 py-1 text-sm" autoFocus />
                            <button onClick={() => saveEdit(acc.id)} className="p-1.5 rounded-lg text-success-400 hover:bg-success-500/10"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-th-faint hover:bg-[var(--bg-hover)]"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-th-heading num">{formatCurrency(acc.balance)}</p>
                            <button onClick={() => startEdit(acc.id, acc.balance)} className="p-1.5 rounded-lg text-th-faint hover:text-primary-500 hover:bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>

                    {isInvestment && isExpanded && (
                      <div className="border-t border-[var(--border-color)] bg-[var(--bg-inset)] px-4 pb-4">
                        <div className="flex items-center justify-between py-3">
                          <p className="text-xs font-semibold text-th-muted uppercase tracking-wider">Stock Positions</p>
                          <div className="flex items-center gap-3">
                            {stocks.length > 0 && (
                              <span className={`text-xs font-semibold ${stocksPnL >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                                P&L: {stocksPnL >= 0 ? '+' : ''}{formatCurrency(stocksPnL)}
                              </span>
                            )}
                            <button onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })} className="flex items-center gap-1 text-xs text-[var(--text-accent)] hover:text-[var(--text-accent)] font-medium">
                              <Plus className="w-3.5 h-3.5" /> Add Position
                            </button>
                          </div>
                        </div>
                        {stocks.length > 0 ? (
                          <div className="space-y-2">
                            {stocks.map(stock => {
                              const value = stock.shares * stock.currentPrice;
                              const cost = stock.shares * stock.avgCostBasis;
                              const pnl = value - cost;
                              const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
                              return (
                                <div key={stock.id} className="flex items-center gap-3 p-3 rounded-xl bg-th-card border border-[var(--border-color)] group/stock">
                                  <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[var(--text-accent)]">{stock.ticker}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-th-heading truncate">{stock.name}</p>
                                    <p className="text-[10px] text-th-faint">{stock.shares} shares @ {formatCurrency(stock.avgCostBasis)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-th-heading">{formatCurrency(value)}</p>
                                    <p className={`text-[10px] font-semibold ${pnl >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                                    </p>
                                  </div>
                                  <button onClick={() => deleteStockHolding(stock.id)} className="p-1 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover/stock:opacity-100 transition-all">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                            <div className="flex items-center justify-between pt-2 px-1 text-xs text-th-muted border-t border-[var(--border-color)]">
                              <span>Total ({stocks.length} positions)</span>
                              <span className="font-semibold text-th-heading">{formatCurrency(stocksValue)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-th-faint text-xs">
                            <p>No positions yet.</p>
                            <button onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })} className="mt-1 text-[var(--text-accent)] hover:underline">Add your first stock position</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Debts List */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-danger-400" />
            Debts & Liabilities ({debts.length})
          </h3>
          <p className="text-sm font-semibold text-[var(--text-negative)]">Total: {formatCurrency(totalDebts)}</p>
        </div>
        {debts.length === 0 ? (
          <p className="text-center text-th-faint py-8">No debts recorded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debts.map(acc => (
              <div key={acc.id} className="flex items-center gap-3 p-4 rounded-2xl border border-danger-500/20 hover:border-danger-500/30 hover:shadow-[var(--shadow-card)] transition-all group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '18' }}>
                  {acc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-th-heading truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-th-faint">{acc.institution}</p>
                    {acc.interestRate !== undefined && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-th-faint" />
                        <span className="text-xs font-medium text-[var(--text-negative)]">{acc.interestRate}% APR</span>
                        <span className="w-1 h-1 rounded-full bg-th-faint" />
                        <span className="text-[10px] text-th-faint">{formatCurrency(acc.balance * acc.interestRate / 100)}/yr interest</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === acc.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="input-field w-28 py-1 text-sm" autoFocus />
                      <button onClick={() => saveEdit(acc.id)} className="p-1.5 rounded-lg text-success-400 hover:bg-success-500/10"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-th-faint hover:bg-[var(--bg-hover)]"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-[var(--text-negative)]">{formatCurrency(acc.balance)}</p>
                      <button onClick={() => startEdit(acc.id, acc.balance)} className="p-1.5 rounded-lg text-th-faint hover:text-primary-500 hover:bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Balance Tracker */}
      <MonthlyBalanceTracker
        accounts={accounts}
        accountSnapshots={accountSnapshots}
        snapshotMonths={snapshotMonths}
        getAccountBalanceForMonth={getAccountBalanceForMonth}
        upsertAccountSnapshot={upsertAccountSnapshot}
      />

      {showAddModal && <AddAccountModal onClose={() => setShowAddModal(false)} />}
      {showStockModal && <AddStockModal onClose={() => setShowStockModal(null)} accountId={showStockModal.accountId} accountName={showStockModal.accountName} />}
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature="Unlimited accounts" />
    </div>
  );
}

function MonthlyBalanceTracker({ accounts, accountSnapshots, snapshotMonths, getAccountBalanceForMonth, upsertAccountSnapshot }: {
  accounts: Account[];
  accountSnapshots: AccountSnapshot[];
  snapshotMonths: string[];
  getAccountBalanceForMonth: (accountId: string, month: string) => number | null;
  upsertAccountSnapshot: (accountId: string, month: string, balance: number) => Promise<void>;
}) {
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedSnapMonth, setSelectedSnapMonth] = useState(() => {
    if (snapshotMonths.length > 0) return snapshotMonths[0];
    return currentMonthStr;
  });
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingMonth, setAddingMonth] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [copyingBalances, setCopyingBalances] = useState(false);

  // All available months (snapshot months + current month always available)
  const allMonths = useMemo(() => {
    const set = new Set(snapshotMonths);
    set.add(currentMonthStr);
    return Array.from(set).sort().reverse();
  }, [snapshotMonths, currentMonthStr]);

  const nonDebtAccounts = accounts.filter(a => !a.isDebt);

  const startEdit = (accountId: string, currentBalance: number | null) => {
    setEditingCell(accountId);
    setEditValue(currentBalance !== null ? currentBalance.toString() : '');
  };

  const saveEdit = async (accountId: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      await upsertAccountSnapshot(accountId, selectedSnapMonth, val);
    }
    setEditingCell(null);
  };

  const handleAddMonth = () => {
    if (newMonth && !allMonths.includes(newMonth)) {
      setSelectedSnapMonth(newMonth);
      setAddingMonth(false);
      setNewMonth('');
    }
  };

  // Copy balances from previous month or current account balances into this month
  const handleCopyBalances = async (source: 'previous' | 'current') => {
    setCopyingBalances(true);
    const sortedMs = [...allMonths].sort();
    const curIdx = sortedMs.indexOf(selectedSnapMonth);
    const prevM = curIdx > 0 ? sortedMs[curIdx - 1] : null;

    for (const acc of nonDebtAccounts) {
      const existingBal = getAccountBalanceForMonth(acc.id, selectedSnapMonth);
      if (existingBal !== null) continue;

      let balanceToCopy: number | null = null;
      if (source === 'previous' && prevM) {
        balanceToCopy = getAccountBalanceForMonth(acc.id, prevM);
      } else if (source === 'current') {
        balanceToCopy = acc.balance;
      }

      if (balanceToCopy !== null) {
        await upsertAccountSnapshot(acc.id, selectedSnapMonth, balanceToCopy);
      }
    }
    setCopyingBalances(false);
  };

  // Calculate totals per month for comparison
  const monthTotal = nonDebtAccounts.reduce((sum, acc) => {
    const bal = getAccountBalanceForMonth(acc.id, selectedSnapMonth);
    return sum + (bal ?? 0);
  }, 0);

  // Check if any accounts are missing data for this month
  const missingCount = nonDebtAccounts.filter(acc => getAccountBalanceForMonth(acc.id, selectedSnapMonth) === null).length;

  // Find previous month for comparison
  const sortedMonths = [...allMonths].sort();
  const currentIdx = sortedMonths.indexOf(selectedSnapMonth);
  const prevMonth = currentIdx > 0 ? sortedMonths[currentIdx - 1] : null;
  const prevTotal = prevMonth ? nonDebtAccounts.reduce((sum, acc) => {
    const bal = getAccountBalanceForMonth(acc.id, prevMonth);
    return sum + (bal ?? 0);
  }, 0) : null;

  if (accounts.length === 0) return null;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--text-accent)]" />
          Monthly Balance Tracking
        </h3>
        <div className="flex items-center gap-2">
          {!addingMonth ? (
            <>
              <select
                value={selectedSnapMonth}
                onChange={e => setSelectedSnapMonth(e.target.value)}
                className="appearance-none bg-th-card border border-[var(--border-strong)] rounded-xl px-3 py-2 pr-8 text-sm font-medium text-th-heading cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {allMonths.map(m => {
                  const [y, mo] = m.split('-');
                  const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  return <option key={m} value={m}>{label}</option>;
                })}
              </select>
              <button
                onClick={() => { setAddingMonth(true); setNewMonth(''); }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--border-strong)] text-sm font-medium text-th-body hover:bg-[var(--bg-hover)] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Month
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={newMonth}
                onChange={e => setNewMonth(e.target.value)}
                className="input-field py-1.5 text-sm"
                autoFocus
              />
              <button onClick={handleAddMonth} disabled={!newMonth} className="p-1.5 rounded-lg text-[var(--text-positive)] hover:bg-[var(--bg-positive-subtle)] disabled:opacity-50"><Check className="w-4 h-4" /></button>
              <button onClick={() => setAddingMonth(false)} className="p-1.5 rounded-lg text-th-faint hover:bg-[var(--bg-hover)]"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Quick-fill buttons when accounts are missing data */}
      {missingCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <p className="text-xs text-th-muted mr-2">{missingCount} account{missingCount !== 1 ? 's' : ''} missing data:</p>
          <button
            onClick={() => handleCopyBalances('current')}
            disabled={copyingBalances}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-accent-subtle)] text-[var(--text-accent)] border border-primary-500/20 hover:bg-primary-500/20 transition-all disabled:opacity-50"
          >
            {copyingBalances ? 'Copying...' : 'Use current balances'}
          </button>
          {prevMonth && (
            <button
              onClick={() => handleCopyBalances('previous')}
              disabled={copyingBalances}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-hover)] text-th-body border border-[var(--border-color)] hover:bg-[var(--bg-hover-strong)] transition-all disabled:opacity-50"
            >
              Copy from prev month
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-[var(--bg-subtle)]">
        <div>
          <p className="text-[10px] text-th-faint uppercase font-semibold">Total (Non-Debt)</p>
          <p className="text-lg font-bold text-th-heading num">{formatCurrency(monthTotal)}</p>
        </div>
        {prevTotal !== null && prevTotal > 0 && (
          <div>
            <p className="text-[10px] text-th-faint uppercase font-semibold">Change</p>
            <p className={`text-sm font-bold num ${monthTotal - prevTotal >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
              {monthTotal - prevTotal >= 0 ? '+' : ''}{formatCurrency(monthTotal - prevTotal)}
              <span className="text-xs ml-1">({((monthTotal - prevTotal) / prevTotal * 100).toFixed(1)}%)</span>
            </p>
          </div>
        )}
      </div>

      {/* Account table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left stat-label py-3 px-2">Account</th>
              <th className="text-right stat-label py-3 px-2">Balance</th>
              {prevMonth && <th className="text-right stat-label py-3 px-2">Change</th>}
              <th className="text-right stat-label py-3 px-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {nonDebtAccounts.map(acc => {
              const bal = getAccountBalanceForMonth(acc.id, selectedSnapMonth);
              const prevBal = prevMonth ? getAccountBalanceForMonth(acc.id, prevMonth) : null;
              const change = bal !== null && prevBal !== null ? bal - prevBal : null;

              return (
                <tr key={acc.id} className="border-b border-[var(--border-color)] group">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{acc.icon}</span>
                      <span className="text-sm font-medium text-th-heading">{acc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {editingCell === acc.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(acc.id); if (e.key === 'Escape') setEditingCell(null); }}
                          className="input-field w-32 py-1 text-sm text-right"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(acc.id)} className="p-1 rounded text-[var(--text-positive)] hover:bg-[var(--bg-positive-subtle)]"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingCell(null)} className="p-1 rounded text-th-faint hover:bg-[var(--bg-hover)]"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(acc.id, bal)}
                        className={`text-sm font-semibold num cursor-pointer hover:underline ${bal !== null ? 'text-th-heading' : 'text-th-faint italic'}`}
                      >
                        {bal !== null ? formatCurrency(bal) : 'Add balance'}
                      </button>
                    )}
                  </td>
                  {prevMonth && (
                    <td className="py-3 px-2 text-right">
                      {change !== null ? (
                        <span className={`text-xs font-semibold num ${change >= 0 ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                          {change >= 0 ? '+' : ''}{formatCurrency(change)}
                        </span>
                      ) : (
                        <span className="text-xs text-th-faint">—</span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-2 text-right">
                    {editingCell !== acc.id && (
                      <button
                        onClick={() => startEdit(acc.id, bal)}
                        className="p-1.5 rounded-lg text-th-faint hover:text-[var(--text-accent)] hover:bg-[var(--bg-accent-subtle)] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
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
