'use client';

import { Bell, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { AddTransactionModal } from '@/components/modals/AddTransactionModal';

export function TopBar() {
  const [showAddTxn, setShowAddTxn] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white/40 backdrop-blur-xl border-b border-surface-100">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 via-grape-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-lg font-bold text-gradient-primary bg-gradient-to-r from-primary-600 to-grape-600">WealthPulse</h1>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTxn(true)}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
          <button className="p-2.5 rounded-xl bg-white/80 border border-surface-200 text-surface-500 hover:text-surface-700 hover:bg-surface-50 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
            JD
          </div>
        </div>
      </header>
      {showAddTxn && <AddTransactionModal onClose={() => setShowAddTxn(false)} />}
    </>
  );
}
