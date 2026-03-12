import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-success-500';
  if (value < 0) return 'text-danger-500';
  return 'text-surface-500';
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-success-500/10 text-success-600';
  if (value < 0) return 'bg-danger-500/10 text-danger-600';
  return 'bg-surface-200 text-surface-600';
}

export const EXPENSE_CATEGORIES = [
  { id: 'mortgage', name: 'Rent/Mortgage', icon: '🏠', color: '#4c6ef5' },
  { id: 'rent', name: 'Rent', icon: '🏢', color: '#7950f2' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#f59f00' },
  { id: 'utility_gas', name: 'Utility - Gas', icon: '🔥', color: '#f59f00' },
  { id: 'utility_electric', name: 'Utility - Electric', icon: '⚡', color: '#fab005' },
  { id: 'utility_garbage', name: 'Utility - Garbage', icon: '🗑️', color: '#868e96' },
  { id: 'internet', name: 'Internet', icon: '🌐', color: '#15aabf' },
  { id: 'phone', name: 'Phone', icon: '📱', color: '#20c997' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#40c057' },
  { id: 'dining', name: 'Dining Out', icon: '🍽️', color: '#f06595' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#fd7e14' },
  { id: 'car_payment', name: 'Car Payment', icon: '🚗', color: '#fd7e14' },
  { id: 'car_gas', name: 'Car Gas', icon: '⛽', color: '#e64980' },
  { id: 'car_maintenance', name: 'Car Maintenance', icon: '🔧', color: '#495057' },
  { id: 'gas', name: 'Gas', icon: '⛽', color: '#e64980' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#be4bdb' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#fa5252' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', color: '#cc5de8' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f783ac' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#748ffc' },
  { id: 'education', name: 'Education', icon: '📚', color: '#3bc9db' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#22b8cf' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#69db7c' },
  { id: 'personal', name: 'Personal Care', icon: '💅', color: '#fcc419' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#ff8787' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', color: '#da77f2' },
  { id: 'taxes', name: 'Taxes', icon: '📋', color: '#868e96' },
  { id: 'other_expense', name: 'Other', icon: '📦', color: '#adb5bd' },
];

export const INCOME_CATEGORIES = [
  { id: 'paycheck', name: 'Paycheck', icon: '💰', color: '#4c6ef5' },
  { id: 'w2', name: 'W-2 Salary', icon: '💼', color: '#5c7cfa' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#7950f2' },
  { id: 'business', name: 'Business Income', icon: '🏪', color: '#f59f00' },
  { id: 'dividend', name: 'Dividend Income', icon: '📈', color: '#40c057' },
  { id: 'interest', name: 'Interest Income', icon: '🏦', color: '#15aabf' },
  { id: 'options_income', name: 'Options Income', icon: '📊', color: '#be4bdb' },
  { id: 'rental', name: 'Rental Income', icon: '🏠', color: '#20c997' },
  { id: 'social_media', name: 'Social Media', icon: '📱', color: '#f06595' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#fa5252' },
  { id: 'capital_gains', name: 'Capital Gains', icon: '📊', color: '#845ef7' },
  { id: 'bonus', name: 'Bonus', icon: '🎉', color: '#fd7e14' },
  { id: 'commission', name: 'Commission', icon: '🤝', color: '#e64980' },
  { id: 'side_hustle', name: 'Side Hustle', icon: '🔥', color: '#cc5de8' },
  { id: 'crypto', name: 'Crypto Income', icon: '₿', color: '#f7931a' },
  { id: 'other_income', name: 'Other Income', icon: '💰', color: '#adb5bd' },
];

export const ACCOUNT_TYPES = [
  { id: '401k', name: '401(k)', icon: '🏛️', color: '#4c6ef5' },
  { id: 'ira', name: 'Traditional IRA', icon: '📋', color: '#7950f2' },
  { id: 'roth_ira', name: 'Roth IRA', icon: '🌟', color: '#be4bdb' },
  { id: 'brokerage', name: 'Brokerage', icon: '📈', color: '#40c057' },
  { id: 'checking', name: 'Checking', icon: '🏦', color: '#15aabf' },
  { id: 'savings', name: 'Savings', icon: '🐷', color: '#20c997' },
  { id: 'hsa', name: 'HSA', icon: '🏥', color: '#f06595' },
  { id: '529', name: '529 Plan', icon: '🎓', color: '#fd7e14' },
  { id: 'crypto_wallet', name: 'Crypto Wallet', icon: '₿', color: '#f7931a' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', color: '#e64980' },
  { id: 'vehicle', name: 'Vehicle', icon: '🚗', color: '#868e96' },
  { id: 'other_asset', name: 'Other Asset', icon: '💎', color: '#cc5de8' },
];

export const LIQUID_ACCOUNT_TYPES = ['checking', 'savings', 'brokerage', 'crypto_wallet', 'hsa', '401k', 'ira', 'roth_ira', '529'];
export const ILLIQUID_ACCOUNT_TYPES = ['real_estate', 'vehicle', 'other_asset'];

export const DEBT_TYPES = [
  { id: 'mortgage_debt', name: 'Mortgage', icon: '🏠', color: '#fa5252' },
  { id: 'auto_loan', name: 'Auto Loan', icon: '🚗', color: '#fd7e14' },
  { id: 'student_loan', name: 'Student Loan', icon: '🎓', color: '#f59f00' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳', color: '#e64980' },
  { id: 'personal_loan', name: 'Personal Loan', icon: '📝', color: '#be4bdb' },
  { id: 'medical_debt', name: 'Medical Debt', icon: '🏥', color: '#f06595' },
  { id: 'other_debt', name: 'Other Debt', icon: '📋', color: '#868e96' },
];
