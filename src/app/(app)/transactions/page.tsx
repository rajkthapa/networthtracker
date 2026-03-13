'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, Calendar, ChevronDown, ArrowLeftRight, Plus, Settings } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { CategoryDrilldownModal } from '@/components/modals/CategoryDrilldownModal';
import { ManageCategoriesModal, getAllExpenseCategories, getAllIncomeCategories } from '@/components/modals/ManageCategoriesModal';

export default function TransactionsPage() {
  const { transactions, deleteTransaction, getMonthTotals, availableMonths, selectedMonth, setSelectedMonth } = useApp();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [viewMonth, setViewMonth] = useState(selectedMonth);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync viewMonth when selectedMonth changes (e.g. auto-select on load)
  useEffect(() => {
    setViewMonth(selectedMonth);
  }, [selectedMonth]);
  const [drilldown, setDrilldown] = useState<{ category: string; name: string; icon: string; color: string; type: 'income' | 'expense' } | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const allCategories = [...getAllIncomeCategories(), ...getAllExpenseCategories()];
  const monthTotals = getMonthTotals(viewMonth);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(viewMonth))
      .filter(t => filter === 'all' || t.type === filter)
      .filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filter, search, viewMonth]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filtered]);

  // Daily totals
  const dailyTotals = useMemo(() => {
    const result: Record<string, { income: number; expenses: number }> = {};
    filtered.forEach(t => {
      if (!result[t.date]) result[t.date] = { income: 0, expenses: 0 };
      if (t.type === 'income') result[t.date].income += t.amount;
      else result[t.date].expenses += t.amount;
    });
    return result;
  }, [filtered]);

  const handleMonthChange = (m: string) => {
    setViewMonth(m);
    setSelectedMonth(m);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Transactions</h1>
          <p className="text-sm text-th-muted mt-1">{filtered.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryManager(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] text-sm font-medium text-th-body hover:bg-[var(--bg-hover)] transition-all">
            <Settings className="w-4 h-4" />
            Categories
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card border-l-4 border-success-500">
          <p className="stat-label">Income</p>
          <p className="text-lg font-bold text-[var(--text-positive)] num">{formatCurrency(monthTotals.income)}</p>
        </div>
        <div className="stat-card border-l-4 border-danger-500">
          <p className="stat-label">Expenses</p>
          <p className="text-lg font-bold text-[var(--text-negative)] num">{formatCurrency(monthTotals.expenses)}</p>
        </div>
        <div className="stat-card border-l-4 border-primary-500">
          <p className="stat-label">Net Savings</p>
          <p className={`text-lg font-bold num ${monthTotals.savings >= 0 ? 'text-[var(--text-accent)]' : 'text-[var(--text-negative)]'}`}>{formatCurrency(monthTotals.savings)}</p>
        </div>
        <div className="stat-card border-l-4 border-grape-500">
          <p className="stat-label">Savings Rate</p>
          <p className="text-lg font-bold text-[var(--text-accent-secondary)] num">{monthTotals.savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-th-faint" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex bg-th-card/80 rounded-xl border border-[var(--border-strong)] p-1">
            {(['all', 'income', 'expense'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? f === 'income' ? 'bg-success-500 text-white' : f === 'expense' ? 'bg-danger-500 text-white' : 'bg-primary-500 text-white'
                    : 'text-th-muted hover:text-th-heading'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={viewMonth}
              onChange={e => handleMonthChange(e.target.value)}
              className="appearance-none bg-th-card/80 border border-[var(--border-strong)] rounded-xl px-4 py-2.5 pr-8 text-sm font-medium text-th-heading cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              {availableMonths.map(m => {
                const [y, mo] = m.split('-');
                const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-th-faint pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length === 0 && (
          <div className="text-center py-16 text-th-faint">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-th-faint" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters or selecting a different month</p>
          </div>
        )}
        {Object.entries(groupedByDate).map(([date, txns]) => {
          const daily = dailyTotals[date];
          return (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-th-faint" />
                <h3 className="text-sm font-semibold text-th-muted">{date}</h3>
                <div className="flex-1 h-px bg-[var(--bg-hover)]" />
                {daily && (
                  <div className="flex gap-3 text-xs">
                    {daily.income > 0 && <span className="text-[var(--text-positive)] font-medium">+{formatCurrency(daily.income)}</span>}
                    {daily.expenses > 0 && <span className="text-[var(--text-negative)] font-medium">-{formatCurrency(daily.expenses)}</span>}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {txns.map(txn => {
                  const cat = allCategories.find(c => c.id === txn.category);
                  return (
                    <div key={txn.id} className="flex items-center gap-3 p-4 bg-th-card/80 backdrop-blur-sm rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all group">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: (cat?.color || '#868e96') + '18' }}
                      >
                        {cat?.icon || '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-th-heading truncate">{txn.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <button
                            onClick={() => cat && setDrilldown({ category: txn.category, name: cat.name, icon: cat.icon, color: cat.color, type: txn.type })}
                            className="text-xs text-th-faint hover:text-[var(--text-accent)] hover:underline transition-colors"
                          >
                            {cat?.name || txn.category}
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm font-bold num ${txn.type === 'income' ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <button
                        onClick={() => deleteTransaction(txn.id)}
                        className="p-2 rounded-lg text-th-faint hover:text-danger-400 hover:bg-danger-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} />}
      {showCategoryManager && <ManageCategoriesModal onClose={() => setShowCategoryManager(false)} />}
      {drilldown && (
        <CategoryDrilldownModal
          category={drilldown.category}
          name={drilldown.name}
          icon={drilldown.icon}
          color={drilldown.color}
          type={drilldown.type}
          onClose={() => setDrilldown(null)}
        />
      )}
    </div>
  );
}
