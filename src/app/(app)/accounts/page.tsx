'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Building2, Edit3, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency, formatPercent, ACCOUNT_TYPES } from '@/lib/utils';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useSubscription } from '@/lib/subscription-context';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const INVESTMENT_TYPES = ['401k', 'ira', 'roth_ira', 'brokerage', 'hsa'];

export default function AccountsPage() {
  const { accounts, totalAssets, totalDebts, netWorth, deleteAccount, updateAccount, getStocksByAccount, deleteStockHolding } = useApp();
  const { isPro } = useSubscription();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<{ accountId: string; accountName: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const assets = accounts.filter(a => !a.isDebt).sort((a, b) => b.balance - a.balance);
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
          <p className="text-sm text-surface-500 mt-1">{assets.length} assets, {debts.length} debts</p>
        </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-success-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-success-100 text-success-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Total Assets</p>
              <p className="text-lg font-bold text-success-600 num">{formatCurrency(totalAssets)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-danger-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-danger-100 text-danger-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Total Debts</p>
              <p className="text-lg font-bold text-danger-600 num">{formatCurrency(totalDebts)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="stat-label">Net Worth</p>
              <p className="text-lg font-bold text-primary-600 num">{formatCurrency(netWorth)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-warning-500">
          <div>
            <p className="stat-label">Debt-to-Asset Ratio</p>
            <p className="text-lg font-bold text-surface-800 num">{debtToAssetRatio.toFixed(1)}%</p>
            <p className="text-[10px] text-surface-400 mt-0.5 num">Annual interest: {formatCurrency(totalInterestPerYear)}</p>
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
                <span className="text-surface-600">{d.name}</span>
                <span className="text-surface-400">({((d.value / totalAssets) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3 className="section-header mb-4">Debt Breakdown</h3>
          {debts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={debts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" vertical={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v, true)} fontSize={12} stroke="#8b95ad" />
                <YAxis type="category" dataKey="name" fontSize={11} stroke="#8b95ad" width={120} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Bar dataKey="balance" radius={[0, 6, 6, 0]}>
                  {debts.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-surface-400">
              <p>No debts - great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Assets List */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success-500" />
            Assets ({assets.length})
          </h3>
          <p className="text-sm font-semibold text-success-600">Total: {formatCurrency(totalAssets)}</p>
        </div>
        <div className="space-y-3">
          {assets.map(acc => {
            const isInvestment = isInvestmentAccount(acc.type);
            const stocks = isInvestment ? getStocksByAccount(acc.id) : [];
            const isExpanded = expandedAccounts.has(acc.id);
            const stocksValue = stocks.reduce((s, st) => s + st.shares * st.currentPrice, 0);
            const stocksCost = stocks.reduce((s, st) => s + st.shares * st.avgCostBasis, 0);
            const stocksPnL = stocksValue - stocksCost;

            return (
              <div key={acc.id} className="rounded-2xl border border-surface-100 hover:border-surface-200 transition-all overflow-hidden">
                <div className="flex items-center gap-3 p-4 group">
                  {isInvestment ? (
                    <button onClick={() => toggleExpand(acc.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors text-surface-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-6" />
                  )}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '18' }}>
                    {acc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 truncate">{acc.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-surface-400">{acc.institution || ACCOUNT_TYPES.find(t => t.id === acc.type)?.name || acc.type}</p>
                      {isInvestment && stocks.length > 0 && (
                        <span className="text-[10px] text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded-full">{stocks.length} positions</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === acc.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="input-field w-28 py-1 text-sm" autoFocus />
                        <button onClick={() => saveEdit(acc.id)} className="p-1.5 rounded-lg text-success-500 hover:bg-success-50"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-50"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-surface-800 num">{formatCurrency(acc.balance)}</p>
                        <button onClick={() => startEdit(acc.id, acc.balance)} className="p-1.5 rounded-lg text-surface-300 hover:text-primary-500 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg text-surface-300 hover:text-danger-500 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Positions (expanded) */}
                {isInvestment && isExpanded && (
                  <div className="border-t border-surface-100 bg-surface-50/50 px-4 pb-4">
                    <div className="flex items-center justify-between py-3">
                      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Stock Positions</p>
                      <div className="flex items-center gap-3">
                        {stocks.length > 0 && (
                          <span className={`text-xs font-semibold ${stocksPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            P&L: {stocksPnL >= 0 ? '+' : ''}{formatCurrency(stocksPnL)}
                          </span>
                        )}
                        <button
                          onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })}
                          className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Position
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
                            <div key={stock.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-surface-100 group/stock">
                              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-600">{stock.ticker}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-surface-700 truncate">{stock.name}</p>
                                <p className="text-[10px] text-surface-400">{stock.shares} shares @ {formatCurrency(stock.avgCostBasis)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-surface-800">{formatCurrency(value)}</p>
                                <p className={`text-[10px] font-semibold ${pnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(pnlPercent)})
                                </p>
                              </div>
                              <button
                                onClick={() => deleteStockHolding(stock.id)}
                                className="p-1 rounded-lg text-surface-300 hover:text-danger-500 hover:bg-danger-50 opacity-0 group-hover/stock:opacity-100 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between pt-2 px-1 text-xs text-surface-500 border-t border-surface-100">
                          <span>Total ({stocks.length} positions)</span>
                          <span className="font-semibold text-surface-700">{formatCurrency(stocksValue)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-surface-400 text-xs">
                        <p>No positions yet.</p>
                        <button
                          onClick={() => setShowStockModal({ accountId: acc.id, accountName: acc.name })}
                          className="mt-1 text-primary-500 hover:underline"
                        >
                          Add your first stock position
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Debts List */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-header flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-danger-500" />
            Debts & Liabilities ({debts.length})
          </h3>
          <p className="text-sm font-semibold text-danger-600">Total: {formatCurrency(totalDebts)}</p>
        </div>
        {debts.length === 0 ? (
          <p className="text-center text-surface-400 py-8">No debts recorded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debts.map(acc => (
              <div key={acc.id} className="flex items-center gap-3 p-4 rounded-2xl border border-danger-100 hover:border-danger-200 hover:shadow-card transition-all group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: acc.color + '18' }}>
                  {acc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 truncate">{acc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-surface-400">{acc.institution}</p>
                    {acc.interestRate !== undefined && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                        <span className="text-xs font-medium text-danger-500">{acc.interestRate}% APR</span>
                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                        <span className="text-[10px] text-surface-400">{formatCurrency(acc.balance * acc.interestRate / 100)}/yr interest</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === acc.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="input-field w-28 py-1 text-sm" autoFocus />
                      <button onClick={() => saveEdit(acc.id)} className="p-1.5 rounded-lg text-success-500 hover:bg-success-50"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-50"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-danger-600">{formatCurrency(acc.balance)}</p>
                      <button onClick={() => startEdit(acc.id, acc.balance)} className="p-1.5 rounded-lg text-surface-300 hover:text-primary-500 hover:bg-primary-50 opacity-0 group-hover:opacity-100 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteAccount(acc.id)} className="p-1.5 rounded-lg text-surface-300 hover:text-danger-500 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddAccountModal onClose={() => setShowAddModal(false)} />}
      {showStockModal && <AddStockModal onClose={() => setShowStockModal(null)} accountId={showStockModal.accountId} accountName={showStockModal.accountName} />}
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature="Unlimited accounts" />
    </div>
  );
}
