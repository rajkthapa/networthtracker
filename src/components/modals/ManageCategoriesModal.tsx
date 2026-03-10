'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/utils';

export type CustomCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
};

const STORAGE_KEY = 'wealthpulse_custom_categories';

export function getCustomCategories(): CustomCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomCategories(cats: CustomCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function getAllExpenseCategories() {
  const custom = getCustomCategories().filter(c => c.type === 'expense');
  return [...EXPENSE_CATEGORIES, ...custom];
}

export function getAllIncomeCategories() {
  const custom = getCustomCategories().filter(c => c.type === 'income');
  return [...INCOME_CATEGORIES, ...custom];
}

const ICON_OPTIONS = ['📦', '🏠', '🚗', '⛽', '🛒', '🍽️', '💊', '🎓', '✈️', '🎁', '💰', '📈', '🏦', '💼', '📱', '🔧', '🗑️', '🔥', '⚡', '🌐', '📺', '🛍️', '🎬', '💪', '🐾', '💅', '📋', '🤝', '🎉', '₿'];
const COLOR_OPTIONS = ['#4c6ef5', '#7950f2', '#be4bdb', '#f06595', '#fa5252', '#fd7e14', '#f59f00', '#40c057', '#20c997', '#15aabf', '#22b8cf', '#868e96', '#495057', '#cc5de8', '#e64980'];

export function ManageCategoriesModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📦');
  const [newColor, setNewColor] = useState('#4c6ef5');

  useEffect(() => {
    setCustomCategories(getCustomCategories());
  }, []);

  const builtIn = tab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const custom = customCategories.filter(c => c.type === tab);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const id = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const allIds = [...builtIn.map(c => c.id), ...customCategories.map(c => c.id)];
    if (allIds.includes(id)) return;

    const newCat: CustomCategory = { id, name: newName.trim(), icon: newIcon, color: newColor, type: tab };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    setNewName('');
    setNewIcon('📦');
    setNewColor('#4c6ef5');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    saveCustomCategories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary-500" />
            Manage Categories
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="px-6 mb-4">
          <div className="flex bg-surface-100 rounded-xl p-1">
            <button
              onClick={() => setTab('expense')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'expense' ? 'bg-danger-500 text-white shadow-sm' : 'text-surface-500'
              }`}
            >
              Expense Categories
            </button>
            <button
              onClick={() => setTab('income')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === 'income' ? 'bg-success-500 text-white shadow-sm' : 'text-surface-500'
              }`}
            >
              Income Categories
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Built-in categories */}
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Built-in</p>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {builtIn.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-50">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-medium text-surface-600 truncate">{cat.name}</span>
                <div className="w-2.5 h-2.5 rounded-full ml-auto flex-shrink-0" style={{ backgroundColor: cat.color }} />
              </div>
            ))}
          </div>

          {/* Custom categories */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Custom</p>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>

          {showAdd && (
            <div className="p-4 rounded-2xl border border-primary-200 bg-primary-50/30 mb-3 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Category name"
                className="input-field text-sm"
                autoFocus
              />
              <div>
                <p className="text-[10px] font-medium text-surface-500 mb-1.5">Icon</p>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                        newIcon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-white hover:bg-surface-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-surface-500 mb-1.5">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {custom.length === 0 && !showAdd && (
            <p className="text-xs text-surface-400 py-4 text-center">No custom categories yet</p>
          )}

          <div className="space-y-1.5">
            {custom.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-50 group">
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs font-medium text-surface-600 flex-1 truncate">{cat.name}</span>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 rounded-lg text-surface-300 hover:text-danger-500 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
