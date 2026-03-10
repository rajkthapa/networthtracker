// Maps Plaid account types/subtypes to app account types
// Returns [appType, isDebt, icon, color]
export function mapPlaidAccountType(
  type: string,
  subtype: string | null
): { appType: string; isDebt: boolean; icon: string; color: string } {
  const sub = subtype?.toLowerCase() || '';
  const t = type.toLowerCase();

  if (t === 'depository') {
    if (sub === 'checking') return { appType: 'checking', isDebt: false, icon: '🏦', color: '#15aabf' };
    if (sub === 'savings') return { appType: 'savings', isDebt: false, icon: '🐷', color: '#20c997' };
    if (sub === 'money market') return { appType: 'savings', isDebt: false, icon: '🐷', color: '#20c997' };
    if (sub === 'hsa') return { appType: 'hsa', isDebt: false, icon: '🏥', color: '#f06595' };
    return { appType: 'checking', isDebt: false, icon: '🏦', color: '#15aabf' };
  }

  if (t === 'credit') {
    return { appType: 'credit_card', isDebt: true, icon: '💳', color: '#e64980' };
  }

  if (t === 'loan') {
    if (sub === 'mortgage') return { appType: 'mortgage_debt', isDebt: true, icon: '🏠', color: '#fa5252' };
    if (sub === 'student') return { appType: 'student_loan', isDebt: true, icon: '🎓', color: '#f59f00' };
    if (sub === 'auto') return { appType: 'auto_loan', isDebt: true, icon: '🚗', color: '#fd7e14' };
    return { appType: 'personal_loan', isDebt: true, icon: '📝', color: '#be4bdb' };
  }

  if (t === 'investment') {
    if (sub === '401k') return { appType: '401k', isDebt: false, icon: '🏛️', color: '#4c6ef5' };
    if (sub === 'ira') return { appType: 'ira', isDebt: false, icon: '📋', color: '#7950f2' };
    if (sub === 'roth' || sub === 'roth 401k') return { appType: 'roth_ira', isDebt: false, icon: '🌟', color: '#be4bdb' };
    if (sub === '529') return { appType: '529', isDebt: false, icon: '🎓', color: '#fd7e14' };
    return { appType: 'brokerage', isDebt: false, icon: '📈', color: '#40c057' };
  }

  return { appType: 'other_asset', isDebt: false, icon: '💎', color: '#cc5de8' };
}

// Maps Plaid personal_finance_category to app category
// Plaid positive amount = money out (expense), negative = money in (income)
export function mapPlaidCategory(
  category: string | null | undefined,
  isExpense: boolean
): string {
  if (!category) return isExpense ? 'other_expense' : 'other_income';

  const cat = category.toUpperCase();

  // Income categories
  if (cat.startsWith('INCOME')) {
    if (cat.includes('WAGES')) return 'w2';
    if (cat.includes('DIVIDENDS')) return 'dividend';
    if (cat.includes('INTEREST')) return 'interest';
    return 'other_income';
  }

  // Expense categories
  if (cat.startsWith('FOOD_AND_DRINK')) {
    if (cat.includes('GROCERIES')) return 'groceries';
    return 'dining';
  }
  if (cat.startsWith('TRANSPORTATION')) {
    if (cat.includes('GAS')) return 'gas';
    return 'transportation';
  }
  if (cat.startsWith('RENT_AND_UTILITIES')) {
    if (cat.includes('RENT')) return 'rent';
    return 'utilities';
  }
  if (cat.startsWith('MEDICAL') || cat.startsWith('HEALTHCARE')) return 'healthcare';
  if (cat.startsWith('ENTERTAINMENT')) return 'entertainment';
  if (cat.startsWith('PERSONAL_CARE')) return 'personal';
  if (cat.startsWith('GENERAL_MERCHANDISE') || cat.startsWith('SHOPPING')) return 'shopping';
  if (cat.startsWith('TRAVEL')) return 'travel';
  if (cat.startsWith('LOAN_PAYMENTS') || cat.startsWith('MORTGAGE')) return 'mortgage';
  if (cat.startsWith('INSURANCE')) return 'insurance';
  if (cat.startsWith('EDUCATION')) return 'education';
  if (cat.startsWith('GOVERNMENT_AND_NON_PROFIT') && cat.includes('TAX')) return 'taxes';
  if (cat.startsWith('SUBSCRIPTION') || cat.startsWith('SERVICE')) return 'subscriptions';
  if (cat.startsWith('TRANSFER')) return isExpense ? 'other_expense' : 'other_income';

  return isExpense ? 'other_expense' : 'other_income';
}
