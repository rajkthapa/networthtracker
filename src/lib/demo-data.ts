import { Account, Transaction, CryptoHolding, StockHolding, NetWorthSnapshot } from './types';

// Current account balances (as of March 2026)
// Total Assets: $810,550
// Total Debts:  $374,700
// Net Worth:    $435,850
export const demoAccounts: Account[] = [
  // ASSETS - Total: $810,550
  { id: '1', name: '401(k) - Fidelity', type: '401k', balance: 145000, institution: 'Fidelity', color: '#4c6ef5', icon: '🏛️', isDebt: false, createdAt: '2024-01-01' },
  { id: '2', name: 'Roth IRA - Vanguard', type: 'roth_ira', balance: 52000, institution: 'Vanguard', color: '#be4bdb', icon: '🌟', isDebt: false, createdAt: '2024-01-01' },
  { id: '3', name: 'Traditional IRA', type: 'ira', balance: 35000, institution: 'Schwab', color: '#7950f2', icon: '📋', isDebt: false, createdAt: '2024-01-01' },
  { id: '4', name: 'Brokerage Account', type: 'brokerage', balance: 72000, institution: 'Fidelity', color: '#40c057', icon: '📈', isDebt: false, createdAt: '2024-01-01' },
  { id: '5', name: 'Chase Checking', type: 'checking', balance: 12500, institution: 'Chase', color: '#15aabf', icon: '🏦', isDebt: false, createdAt: '2024-01-01' },
  { id: '6', name: 'Marcus Savings', type: 'savings', balance: 28000, institution: 'Goldman Sachs', color: '#20c997', icon: '🐷', isDebt: false, createdAt: '2024-01-01' },
  { id: '7', name: 'Emergency Fund', type: 'savings', balance: 15000, institution: 'Ally Bank', color: '#12b886', icon: '🛟', isDebt: false, createdAt: '2024-01-01' },
  { id: '8', name: 'HSA', type: 'hsa', balance: 14050, institution: 'HealthEquity', color: '#f06595', icon: '🏥', isDebt: false, createdAt: '2024-01-01' },
  { id: '9', name: 'Crypto Portfolio', type: 'crypto_wallet', balance: 27000, institution: 'Coinbase', color: '#f7931a', icon: '₿', isDebt: false, createdAt: '2024-01-01' },
  { id: '10', name: 'Primary Residence', type: 'real_estate', balance: 385000, institution: '', color: '#e64980', icon: '🏠', isDebt: false, createdAt: '2024-01-01' },
  { id: '11', name: 'Tesla Model 3', type: 'vehicle', balance: 25000, institution: '', color: '#868e96', icon: '🚗', isDebt: false, createdAt: '2024-01-01' },
  // DEBTS - Total: $374,700
  { id: '12', name: 'Mortgage - Chase', type: 'mortgage_debt', balance: 298000, institution: 'Chase', color: '#fa5252', icon: '🏠', isDebt: true, interestRate: 6.5, createdAt: '2024-01-01' },
  { id: '13', name: 'Auto Loan - Tesla', type: 'auto_loan', balance: 22000, institution: 'Tesla Finance', color: '#fd7e14', icon: '🚗', isDebt: true, interestRate: 4.9, createdAt: '2024-01-01' },
  { id: '14', name: 'Student Loan', type: 'student_loan', balance: 42000, institution: 'Navient', color: '#f59f00', icon: '🎓', isDebt: true, interestRate: 5.5, createdAt: '2024-01-01' },
  { id: '15', name: 'Chase Sapphire', type: 'credit_card', balance: 4200, institution: 'Chase', color: '#e64980', icon: '💳', isDebt: true, interestRate: 24.99, createdAt: '2024-01-01' },
  { id: '16', name: 'Amex Gold', type: 'credit_card', balance: 2800, institution: 'American Express', color: '#cc5de8', icon: '💳', isDebt: true, interestRate: 22.49, createdAt: '2024-01-01' },
  { id: '17', name: 'Personal Loan', type: 'personal_loan', balance: 5700, institution: 'SoFi', color: '#be4bdb', icon: '📝', isDebt: true, interestRate: 8.5, createdAt: '2024-01-01' },
];

// All transactions with deterministic amounts (no randomness)
const generateTransactions = (): Transaction[] => {
  const txns: Transaction[] = [];
  const months = ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

  // Fixed variance per month to make data look natural but deterministic
  const variances = [0, 12, 5, 18, 8, 22, 3, 15, 10, 20, 7, 14];

  months.forEach((month, mi) => {
    const v = variances[mi];

    // === INCOME ===
    // W-2 Salary (bi-monthly)
    txns.push({ id: `inc-${mi}-1`, date: `${month}-01`, description: 'Salary Direct Deposit', amount: 7500, type: 'income', category: 'w2', createdAt: `${month}-01` });
    txns.push({ id: `inc-${mi}-2`, date: `${month}-15`, description: 'Salary Direct Deposit', amount: 7500, type: 'income', category: 'w2', createdAt: `${month}-15` });

    // Quarterly Dividend (every 3 months starting month 0)
    if (mi % 3 === 0) {
      txns.push({ id: `inc-${mi}-3`, date: `${month}-20`, description: 'Quarterly Dividend - VTI', amount: 380 + mi * 12, type: 'income', category: 'dividend', createdAt: `${month}-20` });
      txns.push({ id: `inc-${mi}-3b`, date: `${month}-20`, description: 'Quarterly Dividend - SCHD', amount: 220 + mi * 8, type: 'income', category: 'dividend', createdAt: `${month}-20` });
    }

    // YouTube (grows over time, starts month 3)
    if (mi >= 3) {
      txns.push({ id: `inc-${mi}-4`, date: `${month}-10`, description: 'YouTube Ad Revenue', amount: 280 + mi * 45, type: 'income', category: 'youtube', createdAt: `${month}-10` });
    }

    // Freelance (grows over time)
    txns.push({ id: `inc-${mi}-5`, date: `${month}-25`, description: 'Freelance Web Dev Project', amount: 1500 + mi * 80, type: 'income', category: 'freelance', createdAt: `${month}-25` });

    // Interest income (monthly)
    txns.push({ id: `inc-${mi}-6`, date: `${month}-28`, description: 'Marcus Savings Interest', amount: 95 + mi * 3, type: 'income', category: 'interest', createdAt: `${month}-28` });

    // === EXPENSES ===
    // Housing
    txns.push({ id: `exp-${mi}-1`, date: `${month}-01`, description: 'Mortgage Payment', amount: 2180, type: 'expense', category: 'mortgage', createdAt: `${month}-01` });
    txns.push({ id: `exp-${mi}-2`, date: `${month}-05`, description: 'Electric & Water Bill', amount: 165 + v, type: 'expense', category: 'utilities', createdAt: `${month}-05` });
    txns.push({ id: `exp-${mi}-3`, date: `${month}-05`, description: 'Internet - Xfinity', amount: 79.99, type: 'expense', category: 'internet', createdAt: `${month}-05` });
    txns.push({ id: `exp-${mi}-4`, date: `${month}-05`, description: 'Phone - T-Mobile', amount: 85, type: 'expense', category: 'phone', createdAt: `${month}-05` });

    // Groceries
    txns.push({ id: `exp-${mi}-5`, date: `${month}-06`, description: 'Whole Foods', amount: 285 + v, type: 'expense', category: 'groceries', createdAt: `${month}-06` });
    txns.push({ id: `exp-${mi}-6`, date: `${month}-14`, description: 'Costco Run', amount: 245 + (v > 10 ? 30 : 0), type: 'expense', category: 'groceries', createdAt: `${month}-14` });
    txns.push({ id: `exp-${mi}-7`, date: `${month}-22`, description: 'Trader Joe\'s', amount: 68 + (v > 15 ? 15 : 0), type: 'expense', category: 'groceries', createdAt: `${month}-22` });

    // Dining
    txns.push({ id: `exp-${mi}-8`, date: `${month}-09`, description: 'Dinner at Sushi Roku', amount: 85 + (v > 10 ? 20 : 0), type: 'expense', category: 'dining', createdAt: `${month}-09` });
    txns.push({ id: `exp-${mi}-9`, date: `${month}-17`, description: 'Lunch with team', amount: 42 + (v > 5 ? 12 : 0), type: 'expense', category: 'dining', createdAt: `${month}-17` });
    txns.push({ id: `exp-${mi}-10`, date: `${month}-25`, description: 'Coffee & brunch', amount: 35, type: 'expense', category: 'dining', createdAt: `${month}-25` });

    // Transportation
    txns.push({ id: `exp-${mi}-11`, date: `${month}-08`, description: 'Gas - Shell', amount: 52 + (v > 10 ? 8 : 0), type: 'expense', category: 'gas', createdAt: `${month}-08` });
    txns.push({ id: `exp-${mi}-12`, date: `${month}-20`, description: 'Gas - Chevron', amount: 48, type: 'expense', category: 'gas', createdAt: `${month}-20` });
    txns.push({ id: `exp-${mi}-13`, date: `${month}-15`, description: 'Auto Loan Payment', amount: 485, type: 'expense', category: 'transportation', createdAt: `${month}-15` });

    // Insurance
    txns.push({ id: `exp-${mi}-14`, date: `${month}-01`, description: 'Car Insurance - Geico', amount: 145, type: 'expense', category: 'insurance', createdAt: `${month}-01` });

    // Subscriptions
    txns.push({ id: `exp-${mi}-15`, date: `${month}-01`, description: 'Netflix', amount: 15.49, type: 'expense', category: 'subscriptions', createdAt: `${month}-01` });
    txns.push({ id: `exp-${mi}-16`, date: `${month}-01`, description: 'Spotify Premium', amount: 10.99, type: 'expense', category: 'subscriptions', createdAt: `${month}-01` });
    txns.push({ id: `exp-${mi}-17`, date: `${month}-01`, description: 'Disney+', amount: 13.99, type: 'expense', category: 'subscriptions', createdAt: `${month}-01` });
    txns.push({ id: `exp-${mi}-18`, date: `${month}-01`, description: 'iCloud Storage', amount: 2.99, type: 'expense', category: 'subscriptions', createdAt: `${month}-01` });

    // Fitness
    txns.push({ id: `exp-${mi}-19`, date: `${month}-01`, description: 'Gym Membership - LA Fitness', amount: 49.99, type: 'expense', category: 'fitness', createdAt: `${month}-01` });

    // Shopping
    txns.push({ id: `exp-${mi}-20`, date: `${month}-12`, description: 'Amazon Order', amount: 55 + v * 3, type: 'expense', category: 'shopping', createdAt: `${month}-12` });
    if (mi % 2 === 0) {
      txns.push({ id: `exp-${mi}-21`, date: `${month}-19`, description: 'Target Run', amount: 75 + v, type: 'expense', category: 'shopping', createdAt: `${month}-19` });
    }

    // Student Loan
    txns.push({ id: `exp-${mi}-22`, date: `${month}-15`, description: 'Student Loan Payment', amount: 350, type: 'expense', category: 'education', createdAt: `${month}-15` });

    // Healthcare (every other month)
    if (mi % 2 === 1) {
      txns.push({ id: `exp-${mi}-23`, date: `${month}-10`, description: 'Doctor Visit Copay', amount: 30, type: 'expense', category: 'healthcare', createdAt: `${month}-10` });
    }

    // Personal care
    txns.push({ id: `exp-${mi}-24`, date: `${month}-16`, description: 'Haircut', amount: 35, type: 'expense', category: 'personal', createdAt: `${month}-16` });

    // Entertainment (some months)
    if (mi % 3 !== 2) {
      txns.push({ id: `exp-${mi}-25`, date: `${month}-21`, description: 'Movie tickets', amount: 28, type: 'expense', category: 'entertainment', createdAt: `${month}-21` });
    }

    // Pets
    txns.push({ id: `exp-${mi}-26`, date: `${month}-10`, description: 'Pet food & supplies', amount: 65, type: 'expense', category: 'pets', createdAt: `${month}-10` });

    // Credit card payment (paying down balance)
    txns.push({ id: `exp-${mi}-27`, date: `${month}-25`, description: 'Chase Sapphire Payment', amount: 200, type: 'expense', category: 'other_expense', createdAt: `${month}-25` });
  });

  return txns;
};

export const demoTransactions = generateTransactions();

export const demoCryptoHoldings: CryptoHolding[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', quantity: 0.12, avgBuyPrice: 45000, currentPrice: 97250, priceChange24h: 2.4, image: '' },
  { id: '2', symbol: 'ETH', name: 'Ethereum', quantity: 3.0, avgBuyPrice: 2600, currentPrice: 3420, priceChange24h: -1.2, image: '' },
  { id: '3', symbol: 'SOL', name: 'Solana', quantity: 20, avgBuyPrice: 85, currentPrice: 178, priceChange24h: 5.8, image: '' },
  { id: '4', symbol: 'ADA', name: 'Cardano', quantity: 3000, avgBuyPrice: 0.52, currentPrice: 0.82, priceChange24h: 3.1, image: '' },
  { id: '5', symbol: 'LINK', name: 'Chainlink', quantity: 80, avgBuyPrice: 14, currentPrice: 24.5, priceChange24h: -0.8, image: '' },
  { id: '6', symbol: 'DOT', name: 'Polkadot', quantity: 150, avgBuyPrice: 7.0, currentPrice: 9.2, priceChange24h: 1.5, image: '' },
];
// Crypto total value: BTC 11670 + ETH 10260 + SOL 3560 + ADA 2460 + LINK 1960 + DOT 1380 = ~31,290
// (Account #9 shows 27,000 as the deposited cost basis, actual value tracked via holdings)

// Net worth history - must end at values matching current accounts
// Assets: $810,550, Debts: $374,700, Net Worth: $435,850
export const demoNetWorthHistory: NetWorthSnapshot[] = [
  { date: '2025-01', totalAssets: 685000, totalDebts: 402000, netWorth: 283000 },
  { date: '2025-02', totalAssets: 692000, totalDebts: 399500, netWorth: 292500 },
  { date: '2025-03', totalAssets: 702000, totalDebts: 397000, netWorth: 305000 },
  { date: '2025-04', totalAssets: 698000, totalDebts: 395000, netWorth: 303000 },
  { date: '2025-05', totalAssets: 715000, totalDebts: 393000, netWorth: 322000 },
  { date: '2025-06', totalAssets: 728000, totalDebts: 391000, netWorth: 337000 },
  { date: '2025-07', totalAssets: 738000, totalDebts: 389000, netWorth: 349000 },
  { date: '2025-08', totalAssets: 749000, totalDebts: 387500, netWorth: 361500 },
  { date: '2025-09', totalAssets: 755000, totalDebts: 386000, netWorth: 369000 },
  { date: '2025-10', totalAssets: 768000, totalDebts: 384000, netWorth: 384000 },
  { date: '2025-11', totalAssets: 778000, totalDebts: 382000, netWorth: 396000 },
  { date: '2025-12', totalAssets: 788000, totalDebts: 380000, netWorth: 408000 },
  { date: '2026-01', totalAssets: 796000, totalDebts: 378000, netWorth: 418000 },
  { date: '2026-02', totalAssets: 803000, totalDebts: 376500, netWorth: 426500 },
  { date: '2026-03', totalAssets: 810550, totalDebts: 374700, netWorth: 435850 },
];

// Stock holdings tied to investment accounts
export const demoStockHoldings: StockHolding[] = [
  // 401(k) - account id '1'
  { id: 'stk-1', accountId: '1', ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 180, avgCostBasis: 210, currentPrice: 285.50, priceChange24h: 0.45 },
  { id: 'stk-2', accountId: '1', ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', shares: 250, avgCostBasis: 52, currentPrice: 61.80, priceChange24h: -0.32 },
  { id: 'stk-3', accountId: '1', ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 300, avgCostBasis: 72, currentPrice: 73.20, priceChange24h: 0.08 },
  // Roth IRA - account id '2'
  { id: 'stk-4', accountId: '2', ticker: 'VGT', name: 'Vanguard Info Tech ETF', shares: 45, avgCostBasis: 380, currentPrice: 520.40, priceChange24h: 1.15 },
  { id: 'stk-5', accountId: '2', ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', shares: 180, avgCostBasis: 68, currentPrice: 82.50, priceChange24h: 0.22 },
  // Traditional IRA - account id '3'
  { id: 'stk-6', accountId: '3', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 50, avgCostBasis: 380, currentPrice: 512.00, priceChange24h: 0.65 },
  { id: 'stk-7', accountId: '3', ticker: 'QQQ', name: 'Invesco QQQ Trust', shares: 15, avgCostBasis: 340, currentPrice: 478.20, priceChange24h: 0.95 },
  // Brokerage - account id '4'
  { id: 'stk-8', accountId: '4', ticker: 'AAPL', name: 'Apple Inc.', shares: 50, avgCostBasis: 145, currentPrice: 228.50, priceChange24h: 1.20 },
  { id: 'stk-9', accountId: '4', ticker: 'MSFT', name: 'Microsoft Corp.', shares: 30, avgCostBasis: 280, currentPrice: 425.80, priceChange24h: 0.78 },
  { id: 'stk-10', accountId: '4', ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 40, avgCostBasis: 120, currentPrice: 175.60, priceChange24h: -0.42 },
  { id: 'stk-11', accountId: '4', ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 20, avgCostBasis: 450, currentPrice: 890.00, priceChange24h: 2.10 },
  { id: 'stk-12', accountId: '4', ticker: 'AMZN', name: 'Amazon.com Inc.', shares: 25, avgCostBasis: 130, currentPrice: 198.40, priceChange24h: 0.55 },
];
