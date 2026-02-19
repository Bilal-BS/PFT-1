-- ============================================
-- PFT (Personal Finance Tracker) Schema
-- FIXED: No RLS Recursion
-- ============================================

-- 1️⃣ PROFILES (User + Superadmin)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('user','superadmin')),
  base_currency text DEFAULT 'LKR',
  family_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2️⃣ ACCOUNTS (Cash / Bank / Wallet)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text CHECK (type IN ('cash','bank','wallet')),
  balance numeric DEFAULT 0,
  currency text DEFAULT 'LKR',
  created_at timestamp DEFAULT now()
);

-- 3️⃣ CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text,
  type text CHECK (type IN ('income','expense'))
);

-- 4️⃣ TRANSACTIONS (Income + Expense)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  account_id uuid REFERENCES accounts(id),
  type text CHECK (type IN ('income','expense')),
  category text,
  amount numeric CHECK (amount > 0),
  note text,
  transaction_date date,
  created_at timestamp DEFAULT now()
);

-- 5️⃣ BUDGETS (Monthly)
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  category text,
  month int CHECK (month BETWEEN 1 AND 12),
  year int,
  amount numeric
);

-- 6️⃣ INVESTMENTS
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  name text,
  invested_amount numeric,
  current_value numeric,
  start_date date,
  updated_at timestamp DEFAULT now()
);

-- 7️⃣ LOANS
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  person_name text,
  type text CHECK (type IN ('given','taken')),
  principal numeric,
  interest_rate numeric,
  start_date date,
  status text DEFAULT 'active'
);

-- 8️⃣ LOAN PAYMENTS
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  amount numeric,
  payment_date date
);

-- 9️⃣ PDC (Post-Dated Cheque) Management
CREATE TABLE IF NOT EXISTS pdcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  cheque_number text NOT NULL,
  bank_name text NOT NULL,
  payee_payer text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'LKR',
  maturity_date date NOT NULL,
  type text CHECK (type IN ('issued', 'received')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'bounced', 'cancelled')),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 🔟 USER STATUS & BLOCKING
CREATE TABLE IF NOT EXISTS user_status (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  blocked_reason text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 💳 PLANS (Subscription tiers)
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  price numeric NOT NULL,
  currency text DEFAULT 'LKR',
  features jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 💳 SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES plans(id),
  status text CHECK (status IN ('active','expired','cancelled','trial')) DEFAULT 'trial',
  start_date date DEFAULT current_date,
  end_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- 💳 SUBSCRIPTION PAYMENTS
CREATE TABLE IF NOT EXISTS subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date DEFAULT current_date,
  method text,
  reference text,
  created_at timestamp with time zone DEFAULT now()
);

-- 💹 EXCHANGE RATES
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  rate_date date DEFAULT current_date,
  created_at timestamp with time zone DEFAULT now()
);

-- 👨‍👩‍👧‍👦 FAMILY SHARING
CREATE TABLE IF NOT EXISTS families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- 🏗️ DASHBOARD WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  layout JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  panel_id TEXT NOT NULL,
  dock_location TEXT,
  x INT,
  y INT,
  width INT,
  height INT,
  z_index INT,
  collapsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 🔐 ROW LEVEL SECURITY (RLS) - NO RECURSION
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_panels ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES ====================
-- Drop old recursive policies
DROP POLICY IF EXISTS "User view own profile" ON profiles;
DROP POLICY IF EXISTS "User update own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin full access profiles" ON profiles;
DROP POLICY IF EXISTS "Service role admin" ON profiles;

CREATE POLICY "User view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==================== ACCOUNTS ====================
DROP POLICY IF EXISTS "User own accounts" ON accounts;
DROP POLICY IF EXISTS "Superadmin access accounts" ON accounts;

CREATE POLICY "User own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

-- ==================== TRANSACTIONS ====================
DROP POLICY IF EXISTS "User own transactions" ON transactions;
DROP POLICY IF EXISTS "Superadmin access transactions" ON transactions;

CREATE POLICY "User own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ==================== BUDGETS ====================
DROP POLICY IF EXISTS "User own budgets" ON budgets;
DROP POLICY IF EXISTS "Superadmin access budgets" ON budgets;

CREATE POLICY "User own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);

-- ==================== INVESTMENTS ====================
DROP POLICY IF EXISTS "User own investments" ON investments;
DROP POLICY IF EXISTS "Superadmin access investments" ON investments;

CREATE POLICY "User own investments" ON investments FOR ALL USING (auth.uid() = user_id);

-- ==================== LOANS ====================
DROP POLICY IF EXISTS "User own loans" ON loans;
DROP POLICY IF EXISTS "Superadmin access loans" ON loans;

CREATE POLICY "User own loans" ON loans FOR ALL USING (auth.uid() = user_id);

-- ==================== LOAN PAYMENTS ====================
DROP POLICY IF EXISTS "User own loan payments" ON loan_payments;
DROP POLICY IF EXISTS "Superadmin access loan payments" ON loan_payments;

CREATE POLICY "User own loan payments" ON loan_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid())
);

-- ==================== PDCs ====================
DROP POLICY IF EXISTS "User own pdcs" ON pdcs;
DROP POLICY IF EXISTS "Superadmin access pdcs" ON pdcs;

CREATE POLICY "User own pdcs" ON pdcs FOR ALL USING (auth.uid() = user_id);

-- ==================== CATEGORIES ====================
DROP POLICY IF EXISTS "User own categories" ON categories;
DROP POLICY IF EXISTS "Superadmin access categories" ON categories;

CREATE POLICY "User own categories" ON categories FOR ALL USING (auth.uid() = user_id);

-- ==================== USER STATUS ====================
DROP POLICY IF EXISTS "User view own status" ON user_status;
DROP POLICY IF EXISTS "User insert own status" ON user_status;
DROP POLICY IF EXISTS "Superadmin manage user status" ON user_status;

CREATE POLICY "User view own status" ON user_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User insert own status" ON user_status FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== SUBSCRIPTIONS ====================
DROP POLICY IF EXISTS "User own subscription" ON subscriptions;
DROP POLICY IF EXISTS "User insert subscription" ON subscriptions;
DROP POLICY IF EXISTS "Superadmin subscription access" ON subscriptions;

CREATE POLICY "User own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User insert subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== SUBSCRIPTION PAYMENTS ====================
DROP POLICY IF EXISTS "User view own payments" ON subscription_payments;
DROP POLICY IF EXISTS "Superadmin payment access" ON subscription_payments;

CREATE POLICY "User view own payments" ON subscription_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM subscriptions WHERE id = subscription_payments.subscription_id AND user_id = auth.uid())
);

-- ==================== PLANS ====================
DROP POLICY IF EXISTS "Anyone view plans" ON plans;
DROP POLICY IF EXISTS "Superadmin manage plans" ON plans;

CREATE POLICY "Anyone view plans" ON plans FOR SELECT USING (true);

-- ==================== EXCHANGE RATES ====================
DROP POLICY IF EXISTS "Users and global view rates" ON exchange_rates;
DROP POLICY IF EXISTS "Users manage own rates" ON exchange_rates;
DROP POLICY IF EXISTS "Superadmin manage rates" ON exchange_rates;

CREATE POLICY "Users and global view rates" ON exchange_rates FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users manage own rates" ON exchange_rates FOR ALL USING (user_id = auth.uid());

-- ==================== FAMILIES ====================
DROP POLICY IF EXISTS "User view own family" ON families;
DROP POLICY IF EXISTS "Owner manage family" ON families;

CREATE POLICY "User view own family" ON families FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_members WHERE family_id = families.id AND user_id = auth.uid())
);
CREATE POLICY "Owner manage family" ON families FOR ALL USING (owner_id = auth.uid());

-- ==================== FAMILY MEMBERS ====================
DROP POLICY IF EXISTS "Member view family" ON family_members;

CREATE POLICY "Member view family" ON family_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM family_members fm WHERE fm.family_id = family_members.family_id AND fm.user_id = auth.uid())
);

-- ==================== WORKSPACES ====================
DROP POLICY IF EXISTS "User own workspaces" ON workspaces;
DROP POLICY IF EXISTS "User own workspace panels" ON workspace_panels;

CREATE POLICY "User own workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User own workspace panels" ON workspace_panels FOR ALL USING (
  EXISTS (SELECT 1 FROM workspaces WHERE workspaces.id = workspace_panels.workspace_id AND workspaces.user_id = auth.uid())
);

-- ============================================
-- ⚙️ AUTO PROFILE CREATION TRIGGER (SECURITY DEFINER)
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO user_status (user_id, is_active)
  VALUES (new.id, true)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 🧮 VIEWS
-- ============================================

CREATE OR REPLACE VIEW investment_summary AS
SELECT
  id,
  user_id,
  name,
  invested_amount,
  current_value,
  (current_value - invested_amount) AS profit_loss,
  ROUND(((current_value - invested_amount) / NULLIF(invested_amount, 0)) * 100, 2) AS roi
FROM investments;

CREATE OR REPLACE VIEW monthly_expense AS
SELECT
  user_id,
  EXTRACT(MONTH FROM transaction_date)::int AS month,
  EXTRACT(YEAR FROM transaction_date)::int AS year,
  SUM(amount) AS total_expense
FROM transactions
WHERE type = 'expense'
GROUP BY user_id, month, year;

-- ============================================
-- 📋 SEED DATA
-- ============================================

INSERT INTO plans (id, name, price, currency, features)
VALUES
  ('plan-free', 'Free', 0, 'LKR', '{"max_accounts": 2, "max_investments": 3}'),
  ('plan-std', 'Standard', 1500, 'LKR', '{"max_accounts": 5, "max_investments": 10}'),
  ('plan-pro', 'Pro', 3500, 'LKR', '{"max_accounts": 15, "max_investments": 50, "ai_insights": true}'),
  ('plan-ent', 'Enterprise', 10000, 'LKR', '{"max_accounts": 999, "max_investments": 999, "ai_insights": true, "priority_support": true}'),
  ('plan-ult', 'Ultimate', 25000, 'LKR', '{"max_accounts": 9999, "max_investments": 9999, "export_pdf": true, "ai_insights": true, "priority_support": true, "family_sharing": true}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exchange_rates (from_currency, to_currency, rate)
VALUES
  ('USD', 'LKR', 295.0),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'INR', 83.0),
  ('LKR', 'USD', 0.0034)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(from_currency, to_currency, rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
