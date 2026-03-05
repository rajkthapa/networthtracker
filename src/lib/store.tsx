'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { Account, Transaction, CryptoHolding, StockHolding, NetWorthSnapshot, MonthlyData } from './types';
import { demoAccounts, demoTransactions, demoCryptoHoldings, demoStockHoldings, demoNetWorthHistory } from './demo-data';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNT_TYPES, DEBT_TYPES } from './utils';

type CategoryBreakdownItem = {
  category: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
};

interface AppState {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  cryptoHoldings: CryptoHolding[];
  stockHoldings: StockHolding[];
  netWorthHistory: NetWorthSnapshot[];

  // Account actions
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  // Crypto actions
  addCryptoHolding: (holding: Omit<CryptoHolding, 'id'>) => void;
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => void;
  deleteCryptoHolding: (id: string) => void;

  // Stock actions
  addStockHolding: (holding: Omit<StockHolding, 'id'>) => void;
  updateStockHolding: (id: string, updates: Partial<StockHolding>) => void;
  deleteStockHolding: (id: string) => void;
  getStocksByAccount: (accountId: string) => StockHolding[];

  // Computed from accounts
  totalAssets: number;
  totalDebts: number;
  netWorth: number;

  // Month-specific helpers
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  // For the selected month
  monthIncome: number;
  monthExpenses: number;
  monthSavings: number;
  monthSavingsRate: number;

  // Previous month (for comparison)
  prevMonthIncome: number;
  prevMonthExpenses: number;
  prevMonthSavings: number;
  prevMonthSavingsRate: number;

  // Change percentages
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;

  // Monthly data for charts
  monthlyData: MonthlyData[];

  // Category breakdown
  getCategoryBreakdown: (type: 'income' | 'expense', month?: string) => CategoryBreakdownItem[];

  // Get month income/expenses
  getMonthTotals: (month: string) => { income: number; expenses: number; savings: number; savingsRate: number };

  // Dividend specific
  totalDividends: number;
  monthlyAvgDividend: number;
  dividendMonths: number;
}

const AppContext = createContext<AppState | null>(null);

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...ACCOUNT_TYPES, ...DEBT_TYPES];

function getMonthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function getPrevMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(demoCryptoHoldings);
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>(demoStockHoldings);
  const [netWorthHistory] = useState<NetWorthSnapshot[]>(demoNetWorthHistory);
  const [selectedMonth, setSelectedMonth] = useState('2026-03');

  // === Account Actions ===
  const addAccount = useCallback((account: Omit<Account, 'id' | 'createdAt'>) => {
    setAccounts(prev => [...prev, { ...account, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    // Also delete stock holdings tied to this account
    setStockHoldings(prev => prev.filter(s => s.accountId !== id));
  }, []);

  // === Transaction Actions ===
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{ ...transaction, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // === Crypto Actions ===
  const addCryptoHolding = useCallback((holding: Omit<CryptoHolding, 'id'>) => {
    setCryptoHoldings(prev => [...prev, { ...holding, id: `crypto-${Date.now()}` }]);
  }, []);

  const updateCryptoHolding = useCallback((id: string, updates: Partial<CryptoHolding>) => {
    setCryptoHoldings(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteCryptoHolding = useCallback((id: string) => {
    setCryptoHoldings(prev => prev.filter(h => h.id !== id));
  }, []);

  // === Stock Actions ===
  const addStockHolding = useCallback((holding: Omit<StockHolding, 'id'>) => {
    setStockHoldings(prev => [...prev, { ...holding, id: `stk-${Date.now()}` }]);
  }, []);

  const updateStockHolding = useCallback((id: string, updates: Partial<StockHolding>) => {
    setStockHoldings(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteStockHolding = useCallback((id: string) => {
    setStockHoldings(prev => prev.filter(h => h.id !== id));
  }, []);

  const getStocksByAccount = useCallback((accountId: string) => {
    return stockHoldings.filter(s => s.accountId === accountId);
  }, [stockHoldings]);

  // === Computed ===
  const totalAssets = useMemo(() => accounts.filter(a => !a.isDebt).reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalDebts = useMemo(() => accounts.filter(a => a.isDebt).reduce((s, a) => s + a.balance, 0), [accounts]);
  const netWorth = totalAssets - totalDebts;

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const getMonthTotals = useCallback((month: string) => {
    const txns = transactions.filter(t => t.date.startsWith(month));
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    return { income, expenses, savings, savingsRate };
  }, [transactions]);

  const current = useMemo(() => getMonthTotals(selectedMonth), [getMonthTotals, selectedMonth]);
  const prevMonth = getPrevMonth(selectedMonth);
  const prev = useMemo(() => getMonthTotals(prevMonth), [getMonthTotals, prevMonth]);

  const incomeChange = prev.income > 0 ? ((current.income - prev.income) / prev.income) * 100 : 0;
  const expenseChange = prev.expenses > 0 ? ((current.expenses - prev.expenses) / prev.expenses) * 100 : 0;
  const savingsChange = prev.savings > 0 ? ((current.savings - prev.savings) / prev.savings) * 100 : 0;

  const monthlyData: MonthlyData[] = useMemo(() => {
    const sorted = [...availableMonths].sort();
    return sorted.map(m => {
      const totals = getMonthTotals(m);
      return {
        month: getMonthLabel(m),
        income: Math.round(totals.income * 100) / 100,
        expenses: Math.round(totals.expenses * 100) / 100,
        savings: Math.round(totals.savings * 100) / 100,
        savingsRate: Math.round(totals.savingsRate * 10) / 10,
      };
    });
  }, [availableMonths, getMonthTotals]);

  const getCategoryBreakdown = useCallback((type: 'income' | 'expense', month?: string): CategoryBreakdownItem[] => {
    const m = month || selectedMonth;
    const filteredTxns = transactions.filter(t => t.type === type && t.date.startsWith(m));
    const total = filteredTxns.reduce((s, t) => s + t.amount, 0);
    const grouped: Record<string, number> = {};
    filteredTxns.forEach(t => { grouped[t.category] = (grouped[t.category] || 0) + t.amount; });
    return Object.entries(grouped)
      .map(([cat, amount]) => {
        const catInfo = ALL_CATEGORIES.find(c => c.id === cat) || { name: cat, color: '#868e96', icon: '📦' };
        return { category: cat, name: catInfo.name, amount: Math.round(amount * 100) / 100, percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0, color: catInfo.color, icon: catInfo.icon };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedMonth]);

  const { totalDividends, monthlyAvgDividend, dividendMonths } = useMemo(() => {
    const divTxns = transactions.filter(t => t.category === 'dividend');
    const total = divTxns.reduce((s, t) => s + t.amount, 0);
    const divMonths = new Set(divTxns.map(t => t.date.slice(0, 7)));
    const numMonths = Math.max(divMonths.size, 1);
    return { totalDividends: total, monthlyAvgDividend: total / numMonths, dividendMonths: numMonths };
  }, [transactions]);

  return (
    <AppContext.Provider value={{
      accounts, transactions, cryptoHoldings, stockHoldings, netWorthHistory,
      addAccount, updateAccount, deleteAccount,
      addTransaction, deleteTransaction,
      addCryptoHolding, updateCryptoHolding, deleteCryptoHolding,
      addStockHolding, updateStockHolding, deleteStockHolding, getStocksByAccount,
      totalAssets, totalDebts, netWorth,
      selectedMonth, setSelectedMonth, availableMonths,
      monthIncome: current.income, monthExpenses: current.expenses,
      monthSavings: current.savings, monthSavingsRate: current.savingsRate,
      prevMonthIncome: prev.income, prevMonthExpenses: prev.expenses,
      prevMonthSavings: prev.savings, prevMonthSavingsRate: prev.savingsRate,
      incomeChange, expenseChange, savingsChange,
      monthlyData, getCategoryBreakdown, getMonthTotals,
      totalDividends, monthlyAvgDividend, dividendMonths,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
