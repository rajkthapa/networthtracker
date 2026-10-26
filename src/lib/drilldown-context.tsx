'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { MonthRange } from './types';
import { TransactionDrilldownModal } from '@/components/modals/TransactionDrilldownModal';
import { NetWorthMonthModal } from '@/components/modals/NetWorthMonthModal';

export interface TransactionDrilldown {
  title?: string;
  range: MonthRange;
  type?: 'income' | 'expense';
  category?: string;
}

interface DrilldownState {
  openTransactions: (filter: TransactionDrilldown) => void;
  openNetWorthMonth: (month: string) => void;
}

const DrilldownContext = createContext<DrilldownState | null>(null);

// One modal host for every chart/stat on every page, so any clickable number
// can drill into the transactions (or account balances) behind it.
export function DrilldownProvider({ children }: { children: ReactNode }) {
  const [txnFilter, setTxnFilter] = useState<TransactionDrilldown | null>(null);
  const [nwMonth, setNwMonth] = useState<string | null>(null);

  const openTransactions = useCallback((filter: TransactionDrilldown) => {
    setNwMonth(null);
    setTxnFilter(filter);
  }, []);
  const openNetWorthMonth = useCallback((month: string) => {
    setTxnFilter(null);
    setNwMonth(month.slice(0, 7));
  }, []);

  return (
    <DrilldownContext.Provider value={{ openTransactions, openNetWorthMonth }}>
      {children}
      {txnFilter && (
        <TransactionDrilldownModal
          key={JSON.stringify(txnFilter)}
          filter={txnFilter}
          onClose={() => setTxnFilter(null)}
        />
      )}
      {nwMonth && <NetWorthMonthModal month={nwMonth} onClose={() => setNwMonth(null)} />}
    </DrilldownContext.Provider>
  );
}

export function useDrilldown() {
  const ctx = useContext(DrilldownContext);
  if (!ctx) throw new Error('useDrilldown must be used within DrilldownProvider');
  return ctx;
}
