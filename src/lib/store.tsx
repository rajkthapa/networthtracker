'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { Account, Transaction, CryptoHolding, StockHolding, NetWorthSnapshot, MonthlyData } from './types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNT_TYPES, DEBT_TYPES } from './utils';
import { useAuth } from './auth-context';
import { createClient } from './supabase';

type CategoryBreakdownItem = {
  category: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
};

interface AppState {
  // Loading
  loading: boolean;

  // Data
  accounts: Account[];
  transactions: Transaction[];
  cryptoHoldings: CryptoHolding[];
  stockHoldings: StockHolding[];
  netWorthHistory: NetWorthSnapshot[];

  // Account actions
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Crypto actions
  addCryptoHolding: (holding: Omit<CryptoHolding, 'id'>) => Promise<void>;
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => Promise<void>;
  deleteCryptoHolding: (id: string) => Promise<void>;

  // Stock actions
  addStockHolding: (holding: Omit<StockHolding, 'id'>) => Promise<void>;
  updateStockHolding: (id: string, updates: Partial<StockHolding>) => Promise<void>;
  deleteStockHolding: (id: string) => Promise<void>;
  getStocksByAccount: (accountId: string) => StockHolding[];

  // Price refresh
  refreshCryptoPrices: () => Promise<void>;
  refreshStockPrices: () => Promise<void>;
  pricesLoading: boolean;

  // Computed from accounts + crypto
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  totalCryptoValue: number;

  // Month-specific helpers
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  monthIncome: number;
  monthExpenses: number;
  monthSavings: number;
  monthSavingsRate: number;

  prevMonthIncome: number;
  prevMonthExpenses: number;
  prevMonthSavings: number;
  prevMonthSavingsRate: number;

  incomeChange: number;
  expenseChange: number;
  savingsChange: number;

  monthlyData: MonthlyData[];
  getCategoryBreakdown: (type: 'income' | 'expense', month?: string) => CategoryBreakdownItem[];
  getMonthTotals: (month: string) => { income: number; expenses: number; savings: number; savingsRate: number };

  totalDividends: number;
  monthlyAvgDividend: number;
  dividendMonths: number;

  getCategoryHistory: (category: string) => { month: string; label: string; amount: number }[];
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

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Map DB row to app types
function mapAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balance: Number(row.balance),
    institution: row.institution || undefined,
    color: row.color || '#4c6ef5',
    icon: row.icon || '💰',
    isDebt: row.is_debt,
    interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
    createdAt: row.created_at,
  };
}

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    accountId: row.account_id || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function mapCrypto(row: any): CryptoHolding {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    quantity: Number(row.quantity),
    avgBuyPrice: Number(row.avg_buy_price),
    currentPrice: Number(row.current_price) || 0,
    priceChange24h: Number(row.price_change_24h) || 0,
    coingeckoId: row.coingecko_id || undefined,
  };
}

function mapStock(row: any): StockHolding {
  return {
    id: row.id,
    accountId: row.account_id,
    ticker: row.ticker,
    name: row.name,
    shares: Number(row.shares),
    avgCostBasis: Number(row.avg_cost_basis),
    currentPrice: Number(row.current_price) || 0,
    priceChange24h: Number(row.price_change_24h) || 0,
  };
}

function mapSnapshot(row: any): NetWorthSnapshot {
  return {
    date: row.date,
    totalAssets: Number(row.total_assets),
    totalDebts: Number(row.total_debts),
    netWorth: Number(row.net_worth),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [stockHoldings, setStockHoldings] = useState<StockHolding[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthSnapshot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // === Fetch all data when user changes ===
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setCryptoHoldings([]);
      setStockHoldings([]);
      setNetWorthHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      const [accRes, txnRes, cryptoRes, stockRes, snapRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_id', user!.id).order('date', { ascending: false }),
        supabase.from('crypto_holdings').select('*').eq('user_id', user!.id),
        supabase.from('stock_holdings').select('*').eq('user_id', user!.id),
        supabase.from('net_worth_snapshots').select('*').eq('user_id', user!.id).order('date', { ascending: true }),
      ]);

      if (cancelled) return;

      setAccounts((accRes.data || []).map(mapAccount));
      setTransactions((txnRes.data || []).map(mapTransaction));
      setCryptoHoldings((cryptoRes.data || []).map(mapCrypto));
      setStockHoldings((stockRes.data || []).map(mapStock));
      setNetWorthHistory((snapRes.data || []).map(mapSnapshot));
      setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [user, supabase]);

  // === Account Actions ===
  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('accounts').insert({
      user_id: user.id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      institution: account.institution || null,
      color: account.color,
      icon: account.icon,
      is_debt: account.isDebt,
      interest_rate: account.interestRate || null,
    }).select().single();
    if (!error && data) setAccounts(prev => [mapAccount(data), ...prev]);
  }, [user, supabase]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.institution !== undefined) dbUpdates.institution = updates.institution;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.isDebt !== undefined) dbUpdates.is_debt = updates.isDebt;
    if (updates.interestRate !== undefined) dbUpdates.interest_rate = updates.interestRate;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('accounts').update(dbUpdates).eq('id', id);
    if (!error) setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [supabase]);

  const deleteAccount = useCallback(async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      setStockHoldings(prev => prev.filter(s => s.accountId !== id));
    }
  }, [supabase]);

  // === Transaction Actions ===
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      account_id: transaction.accountId || null,
      notes: transaction.notes || null,
    }).select().single();
    if (!error && data) setTransactions(prev => [mapTransaction(data), ...prev]);
  }, [user, supabase]);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
  }, [supabase]);

  // === Crypto Actions ===
  const addCryptoHolding = useCallback(async (holding: Omit<CryptoHolding, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('crypto_holdings').insert({
      user_id: user.id,
      symbol: holding.symbol,
      name: holding.name || holding.symbol,
      quantity: holding.quantity,
      avg_buy_price: holding.avgBuyPrice || 0,
      current_price: holding.currentPrice || 0,
      price_change_24h: holding.priceChange24h || 0,
    }).select().single();
    if (!error && data) setCryptoHoldings(prev => [...prev, mapCrypto(data)]);
  }, [user, supabase]);

  const updateCryptoHolding = useCallback(async (id: string, updates: Partial<CryptoHolding>) => {
    const dbUpdates: any = {};
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.avgBuyPrice !== undefined) dbUpdates.avg_buy_price = updates.avgBuyPrice;
    if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
    if (updates.priceChange24h !== undefined) dbUpdates.price_change_24h = updates.priceChange24h;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('crypto_holdings').update(dbUpdates).eq('id', id);
    if (!error) setCryptoHoldings(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, [supabase]);

  const deleteCryptoHolding = useCallback(async (id: string) => {
    const { error } = await supabase.from('crypto_holdings').delete().eq('id', id);
    if (!error) setCryptoHoldings(prev => prev.filter(h => h.id !== id));
  }, [supabase]);

  // === Stock Actions ===
  const addStockHolding = useCallback(async (holding: Omit<StockHolding, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('stock_holdings').insert({
      user_id: user.id,
      account_id: holding.accountId,
      ticker: holding.ticker,
      name: holding.name,
      shares: holding.shares,
      avg_cost_basis: holding.avgCostBasis,
      current_price: holding.currentPrice || 0,
      price_change_24h: holding.priceChange24h || 0,
    }).select().single();
    if (!error && data) setStockHoldings(prev => [...prev, mapStock(data)]);
  }, [user, supabase]);

  const updateStockHolding = useCallback(async (id: string, updates: Partial<StockHolding>) => {
    const dbUpdates: any = {};
    if (updates.shares !== undefined) dbUpdates.shares = updates.shares;
    if (updates.avgCostBasis !== undefined) dbUpdates.avg_cost_basis = updates.avgCostBasis;
    if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
    if (updates.priceChange24h !== undefined) dbUpdates.price_change_24h = updates.priceChange24h;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('stock_holdings').update(dbUpdates).eq('id', id);
    if (!error) setStockHoldings(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, [supabase]);

  const deleteStockHolding = useCallback(async (id: string) => {
    const { error } = await supabase.from('stock_holdings').delete().eq('id', id);
    if (!error) setStockHoldings(prev => prev.filter(h => h.id !== id));
  }, [supabase]);

  const getStocksByAccount = useCallback((accountId: string) => {
    return stockHoldings.filter(s => s.accountId === accountId);
  }, [stockHoldings]);

  // === Price Refresh ===
  const refreshCryptoPrices = useCallback(async () => {
    if (cryptoHoldings.length === 0) return;
    setPricesLoading(true);
    try {
      const symbols = cryptoHoldings.map(h => h.symbol);
      const res = await fetch(`/api/prices?type=crypto&symbols=${symbols.join(',')}`);
      const { prices } = await res.json();
      if (prices) {
        for (const holding of cryptoHoldings) {
          const p = prices[holding.symbol];
          if (p) {
            await updateCryptoHolding(holding.id, { currentPrice: p.price, priceChange24h: p.change24h });
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh crypto prices:', err);
    }
    setPricesLoading(false);
  }, [cryptoHoldings, updateCryptoHolding]);

  const refreshStockPrices = useCallback(async () => {
    if (stockHoldings.length === 0) return;
    setPricesLoading(true);
    try {
      const tickers = Array.from(new Set(stockHoldings.map(h => h.ticker)));
      const res = await fetch(`/api/prices?type=stock&symbols=${tickers.join(',')}`);
      const { prices } = await res.json();
      if (prices) {
        for (const holding of stockHoldings) {
          const p = prices[holding.ticker];
          if (p) {
            await updateStockHolding(holding.id, { currentPrice: p.price, priceChange24h: p.change24h });
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh stock prices:', err);
    }
    setPricesLoading(false);
  }, [stockHoldings, updateStockHolding]);

  // === Computed ===
  const totalCryptoValue = useMemo(() => cryptoHoldings.reduce((s, h) => s + h.quantity * h.currentPrice, 0), [cryptoHoldings]);
  const totalAssets = useMemo(() => accounts.filter(a => !a.isDebt).reduce((s, a) => s + a.balance, 0) + totalCryptoValue, [accounts, totalCryptoValue]);
  const totalDebts = useMemo(() => accounts.filter(a => a.isDebt).reduce((s, a) => s + a.balance, 0), [accounts]);
  const netWorth = totalAssets - totalDebts;

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    const currentMonth = getCurrentMonth();
    set.add(currentMonth);
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Auto-select the most recent month that has transactions
  useEffect(() => {
    if (transactions.length === 0) return;
    const months = Array.from(new Set(transactions.map(t => t.date.slice(0, 7)))).sort().reverse();
    const currentMonth = getCurrentMonth();
    // If current month has no transactions, select the most recent month that does
    const hasCurrentMonth = transactions.some(t => t.date.startsWith(currentMonth));
    if (!hasCurrentMonth && months.length > 0) {
      setSelectedMonth(months[0]);
    }
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

  const getCategoryHistory = useCallback((category: string) => {
    const sorted = [...availableMonths].sort();
    return sorted.map(m => {
      const total = transactions
        .filter(t => t.category === category && t.date.startsWith(m))
        .reduce((s, t) => s + t.amount, 0);
      return { month: m, label: getMonthLabel(m), amount: Math.round(total * 100) / 100 };
    });
  }, [transactions, availableMonths]);

  const { totalDividends, monthlyAvgDividend, dividendMonths } = useMemo(() => {
    const divTxns = transactions.filter(t => t.category === 'dividend');
    const total = divTxns.reduce((s, t) => s + t.amount, 0);
    const divMonths = new Set(divTxns.map(t => t.date.slice(0, 7)));
    const numMonths = Math.max(divMonths.size, 1);
    return { totalDividends: total, monthlyAvgDividend: total / numMonths, dividendMonths: numMonths };
  }, [transactions]);

  return (
    <AppContext.Provider value={{
      loading,
      accounts, transactions, cryptoHoldings, stockHoldings, netWorthHistory,
      addAccount, updateAccount, deleteAccount,
      addTransaction, deleteTransaction,
      addCryptoHolding, updateCryptoHolding, deleteCryptoHolding,
      addStockHolding, updateStockHolding, deleteStockHolding, getStocksByAccount,
      refreshCryptoPrices, refreshStockPrices, pricesLoading,
      totalAssets, totalDebts, netWorth, totalCryptoValue,
      selectedMonth, setSelectedMonth, availableMonths,
      monthIncome: current.income, monthExpenses: current.expenses,
      monthSavings: current.savings, monthSavingsRate: current.savingsRate,
      prevMonthIncome: prev.income, prevMonthExpenses: prev.expenses,
      prevMonthSavings: prev.savings, prevMonthSavingsRate: prev.savingsRate,
      incomeChange, expenseChange, savingsChange,
      monthlyData, getCategoryBreakdown, getMonthTotals,
      totalDividends, monthlyAvgDividend, dividendMonths, getCategoryHistory,
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
