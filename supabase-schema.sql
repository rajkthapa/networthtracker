-- WealthPulse Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts (assets and debts)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  institution TEXT,
  color TEXT DEFAULT '#4c6ef5',
  icon TEXT DEFAULT '💰',
  is_debt BOOLEAN DEFAULT false,
  interest_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crypto holdings
CREATE TABLE IF NOT EXISTS crypto_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  avg_buy_price DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2) DEFAULT 0,
  price_change_24h DECIMAL(10,4) DEFAULT 0,
  coingecko_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock holdings
CREATE TABLE IF NOT EXISTS stock_holdings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  shares DECIMAL(15,6) NOT NULL,
  avg_cost_basis DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(15,2) DEFAULT 0,
  price_change_24h DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history (for storing fetched prices)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'stock')),
  price DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, asset_type, date)
);

-- Net worth snapshots (daily/monthly)
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_assets DECIMAL(15,2) NOT NULL,
  total_debts DECIMAL(15,2) NOT NULL,
  net_worth DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Plaid items (stores access tokens server-side only)
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plaid_item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_name TEXT,
  institution_id TEXT,
  cursor TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plaid accounts (links Plaid accounts to app accounts)
CREATE TABLE IF NOT EXISTS plaid_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE NOT NULL,
  plaid_account_id TEXT NOT NULL UNIQUE,
  app_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL
);

-- Add plaid_transaction_id to transactions for dedup
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plaid_transaction_id TEXT UNIQUE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_user ON crypto_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_holdings_user ON stock_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_holdings_account ON stock_holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_snapshots_user_date ON net_worth_snapshots(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date ON price_history(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_plaid_items_user ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item ON plaid_accounts(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_id ON transactions(plaid_transaction_id);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can CRUD own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can CRUD own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can CRUD own crypto" ON crypto_holdings;
DROP POLICY IF EXISTS "Users can CRUD own stocks" ON stock_holdings;
DROP POLICY IF EXISTS "Users can CRUD own snapshots" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Anyone can read price history" ON price_history;
DROP POLICY IF EXISTS "Authenticated users can insert price history" ON price_history;
DROP POLICY IF EXISTS "Users can read own plaid_items" ON plaid_items;
DROP POLICY IF EXISTS "Service role can manage plaid_items" ON plaid_items;
DROP POLICY IF EXISTS "Users can read own plaid_accounts" ON plaid_accounts;
DROP POLICY IF EXISTS "Service role can manage plaid_accounts" ON plaid_accounts;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own crypto" ON crypto_holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own stocks" ON stock_holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own snapshots" ON net_worth_snapshots FOR ALL USING (auth.uid() = user_id);

-- Plaid items: users can read their own, service role handles writes (access_token sensitive)
CREATE POLICY "Users can read own plaid_items" ON plaid_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage plaid_items" ON plaid_items FOR ALL USING (true);
CREATE POLICY "Users can read own plaid_accounts" ON plaid_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage plaid_accounts" ON plaid_accounts FOR ALL USING (true);

-- Price history is readable by anyone, writable by authenticated users
CREATE POLICY "Anyone can read price history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert price history" ON price_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Account balance snapshots (month-over-month tracking)
CREATE TABLE IF NOT EXISTS account_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, month)
);
ALTER TABLE account_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own account_snapshots" ON account_snapshots;
CREATE POLICY "Users can CRUD own account_snapshots" ON account_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_user ON account_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_account_month ON account_snapshots(account_id, month);

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
