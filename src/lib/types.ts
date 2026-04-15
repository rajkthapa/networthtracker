export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution?: string;
  color: string;
  icon: string;
  isDebt: boolean;
  interestRate?: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId?: string;
  notes?: string;
  createdAt: string;
}

export interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  priceChange24h: number;
  image?: string;
  coingeckoId?: string;
}

export interface StockHolding {
  id: string;
  accountId: string;
  ticker: string;
  name: string;
  shares: number;
  avgCostBasis: number;
  currentPrice: number;
  priceChange24h: number;
}

export interface NetWorthSnapshot {
  date: string;
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  sortOrder: number;
}

export interface AccountSnapshot {
  id: string;
  accountId: string;
  month: string;
  balance: number;
}

export interface FIREData {
  currentNetWorth: number;
  annualExpenses: number;
  annualIncome: number;
  savingsRate: number;
  fireNumber: number;
  progress: number;
  yearsToFire: number;
  monthlyPassiveIncome: number;
  coastFireNumber: number;
  leanFireNumber: number;
  fatFireNumber: number;
}
