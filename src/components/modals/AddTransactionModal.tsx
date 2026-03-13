'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getAllExpenseCategories, getAllIncomeCategories } from '@/components/modals/ManageCategoriesModal';

export function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useApp();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'income' ? getAllIncomeCategories() : getAllExpenseCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!amount || !description || !category) {
      setError(!category ? 'Please select a category' : 'Please fill all fields');
      return;
    }
    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await addTransaction({
        date,
        description,
        amount: parseFloat(amount),
        type,
        category,
      });
      onClose();
    } catch {
      setError('Failed to save transaction. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-color)] animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-th-heading">Add Transaction</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors">
            <X className="w-5 h-5 text-th-muted" />
          </button>
        </div>

        <div className="px-6 mb-4">
          <div className="flex bg-[var(--bg-hover)] rounded-xl p-1">
            <button
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense' ? 'bg-danger-500 text-white shadow-sm' : 'text-th-muted'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income' ? 'bg-success-500 text-white shadow-sm' : 'text-th-muted'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[var(--bg-negative-subtle)] border border-danger-500/30 text-[var(--text-negative)] text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-th-faint font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pl-8 text-2xl font-bold num"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-th-body mb-2">
              Category {!category && <span className="text-[var(--text-negative)]">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                    category === cat.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-[var(--border-color)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-medium text-th-body leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              type === 'expense'
                ? 'bg-danger-500 hover:bg-danger-600'
                : 'bg-success-500 hover:bg-success-600'
            }`}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Add ${type === 'expense' ? 'Expense' : 'Income'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
