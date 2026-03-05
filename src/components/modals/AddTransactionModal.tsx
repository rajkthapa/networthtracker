'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/lib/store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/utils';

export function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useApp();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;
    addTransaction({
      date,
      description,
      amount: parseFloat(amount),
      type,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-surface-900">Add Transaction</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="px-6 mb-4">
          <div className="flex bg-surface-100 rounded-xl p-1">
            <button
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense' ? 'bg-danger-500 text-white shadow-md' : 'text-surface-500'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => { setType('income'); setCategory(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'income' ? 'bg-success-500 text-white shadow-md' : 'text-surface-500'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field pl-8 text-2xl font-bold"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="input-field"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                    category === cat.id
                      ? 'border-primary-500 bg-primary-50 shadow-glow-primary'
                      : 'border-surface-100 hover:border-surface-200'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] font-medium text-surface-600 leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
              type === 'expense'
                ? 'bg-gradient-to-r from-danger-500 to-accent-500 hover:shadow-glow-accent'
                : 'bg-gradient-to-r from-success-500 to-teal-500 hover:shadow-glow-success'
            }`}
          >
            Add {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </form>
      </div>
    </div>
  );
}
