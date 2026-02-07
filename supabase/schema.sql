-- 1️⃣ Profiles (User + Superadmin)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('user','superadmin')),
  created_at timestamp with time zone default now()
);

-- 2️⃣ Accounts (Cash / Bank / Wallet)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('cash','bank','wallet')),
  balance numeric default 0,
  created_at timestamp default now()
);

-- PDC (Post-Dated Cheque) Management
create table pdcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  account_id uuid references accounts(id) on delete cascade,
  cheque_number text not null,
  bank_name text not null,
  payee_payer text not null,
  amount numeric not null,
  currency text default 'LKR',
  maturity_date date not null,
  type text check (type in ('issued', 'received')),
  status text default 'pending' check (status in ('pending', 'cleared', 'bounced', 'cancelled')),
  notes text,
  created_at timestamp with time zone default now()
);

-- 3️⃣ Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  type text check (type in ('income','expense'))
);

-- 4️⃣ Transactions (Income + Expense)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  account_id uuid references accounts(id),
  type text check (type in ('income','expense')),
  category text,
  amount numeric check (amount > 0),
  note text,
  transaction_date date,
  created_at timestamp default now()
);

-- 5️⃣ Budgets (Monthly)
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  category text,
  month int check (month between 1 and 12),
  year int,
  amount numeric
);

-- 6️⃣ Investments
create table investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  invested_amount numeric,
  current_value numeric,
  start_date date,
  updated_at timestamp default now()
);

-- 7️⃣ Loans
create table loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  person_name text,
  type text check (type in ('given','taken')),
  principal numeric,
  interest_rate numeric,
  start_date date,
  status text default 'active'
);

-- 8️⃣ Loan Payments
create table loan_payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references loans(id) on delete cascade,
  amount numeric,
  payment_date date
);

-- 🔐 ROW LEVEL SECURITY (CRITICAL)
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table investments enable row level security;
alter table loans enable row level security;
alter table loan_payments enable row level security;

-- User: Access Only Own Data

-- Profiles
create policy "User own profile" on profiles for select using (auth.uid() = id);
create policy "User update own profile" on profiles for update using (auth.uid() = id);

-- Accounts
create policy "User own accounts" on accounts for all using (auth.uid() = user_id);

-- Transactions
create policy "User own transactions" on transactions for all using (auth.uid() = user_id);

-- Budgets
create policy "User own budgets" on budgets for all using (auth.uid() = user_id);

-- Investments
create policy "User own investments" on investments for all using (auth.uid() = user_id);

-- Loans
create policy "User own loans" on loans for all using (auth.uid() = user_id);

-- Loan Payments (Needs join or subquery check on loan ownership, but assuming explicit user_id link or join. 
-- Wait, loan_payments does NOT have user_id. It references loans. 
-- So we need a USING clause that checks the loan's user_id.
-- However, for RLS on a child table without user_id, we need to join.
-- supabase basic policy involves EXISTS.
create policy "User own loan payments" on loan_payments for all using (
  exists (
    select 1 from loans
    where loans.id = loan_payments.loan_id
    and loans.user_id = auth.uid()
  )
);

-- Superadmin: Full Access
-- Helper function or repeat the exists logic? The user prompt said:
-- create policy "Superadmin access" on accounts for all using ( exists ( select 1 from profiles where id = auth.uid() and role = 'superadmin' ) );
-- I'll define this condition as a reusable snippet concept in my head, but I have to write the SQL.

-- Accounts Superadmin
create policy "Superadmin access accounts" on accounts for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Transactions Superadmin
create policy "Superadmin access transactions" on transactions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Budgets Superadmin
create policy "Superadmin access budgets" on budgets for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Investments Superadmin
create policy "Superadmin access investments" on investments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Loans Superadmin
create policy "Superadmin access loans" on loans for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Loan Payments Superadmin
create policy "Superadmin access loan_payments" on loan_payments for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);

-- Profiles Superadmin (Can view/edit all profiles?)
create policy "Superadmin access profiles" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);


-- 🧮 Smart Calculations (Views)

-- Investment Profit / Loss View
create or replace view investment_summary as
select
  id,
  user_id,
  name,
  invested_amount,
  current_value,
  (current_value - invested_amount) as profit_loss,
  round(((current_value - invested_amount) / invested_amount) * 100, 2) as roi
from investments;

-- Monthly Expense Summary
create or replace view monthly_expense as
select
  user_id,
  extract(month from transaction_date) as month,
  extract(year from transaction_date) as year,
  sum(amount) as total_expense
from transactions
where type = 'expense'
group by user_id, month, year;

-- ⚙️ Auto Profile Creation (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, full_name)
  values (new.id, 'user', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql;

-- Drop trigger if exists to avoid error on rerun
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 🔐 USER STATUS & BLOCKING
create table user_status (
  user_id uuid primary key references profiles(id) on delete cascade,
  is_active boolean default true,
  blocked_reason text,
  updated_at timestamp with time zone default now()
);

alter table user_status enable row level security;

create policy "Superadmin manage user status"
on user_status
for all
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'superadmin'
  )
);

create policy "Users can view own status"
on user_status
for select
using (auth.uid() = user_id);

-- 💳 SUBSCRIPTION SYSTEM (SaaS CORE)
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- Free, Pro, Premium
  price numeric not null,             -- Monthly price
  currency text default 'LKR',
  features jsonb,                     -- {max_accounts: 3, max_investments: 5}
  created_at timestamp with time zone default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  plan_id uuid references plans(id) not null,
  status text check (status in ('active','expired','cancelled','trial')) default 'trial',
  start_date date default current_date,
  end_date date,
  created_at timestamp with time zone default now()
);

create table subscription_payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  amount numeric not null,
  payment_date date default current_date,
  method text,        -- stripe, cash, bank
  reference text,
  created_at timestamp with time zone default now()
);

-- 🔐 SUBSCRIPTION RLS
alter table subscriptions enable row level security;

create policy "User own subscription"
on subscriptions
for select
using (auth.uid() = user_id);

create policy "Superadmin subscription access"
on subscriptions
for all
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'superadmin'
  )
);

alter table plans enable row level security;
create policy "Anyone can view plans" on plans for select using (true);

alter table subscription_payments enable row level security;
create policy "User view own payments"
on subscription_payments
for select
using (
  exists (
    select 1 from subscriptions
    where id = subscription_payments.subscription_id
    and user_id = auth.uid()
  )
);

-- 👤 PROFILES (EXTENDED)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('user', 'superadmin')) default 'user',
  base_currency text default 'LKR',
  updated_at timestamp with time zone default now()
);

create policy "Superadmin payment access"
on subscription_payments
for all
using (
  exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'superadmin'
  )
);


-- 💹 CURRENCY EXCHANGE RATES (Historical Tracking)
create table exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  from_currency text not null,
  to_currency text not null,
  rate numeric not null,
  rate_date date default current_date,
  created_at timestamp with time zone default now()
);

-- Index for fast lookup of latest rates
create index idx_exchange_rates_date on exchange_rates(from_currency, to_currency, rate_date desc);

-- Seed initial rates (Base: USD)
insert into exchange_rates (from_currency, to_currency, rate)
values 
  ('USD', 'LKR', 295.0),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('USD', 'INR', 83.0),
  ('LKR', 'USD', 0.0034);

-- 🏦 ACCOUNTS (Add Currency)
alter table accounts add column currency text default 'LKR';

-- 🧾 SEED ULTIMATE PLAN
insert into plans (id, name, price, currency, features)
values 
  ('plan-ult', 'Ultimate', 25000, 'LKR', '{"max_accounts": 9999, "max_investments": 9999, "export_pdf": true, "ai_insights": true, "priority_support": true, "family_sharing": true}');

-- 🔐 RLS for Exchange Rates
alter table exchange_rates enable row level security;
drop policy if exists "Anyone can view rates" on exchange_rates;
create policy "Users and Global view rates" on exchange_rates for select using (user_id is null or user_id = auth.uid());
create policy "Users manage own rates" on exchange_rates for all using (user_id = auth.uid());
create policy "Superadmin full management" on exchange_rates for all using (
  exists (
    select 1 from profiles where id = auth.uid() and role = 'superadmin'
  )
);

create or replace function handle_new_user_setup()
returns trigger as $$
declare
  free_plan_id uuid;
begin
  -- 1. Create Profile (handled by previous trigger, but let's be safe if combined)
  -- 2. Create User Status
  insert into user_status (user_id, is_active) values (new.id, true);

  -- 3. Assign Free Subscription
  select id into free_plan_id from plans where name = 'Free' limit 1;
  insert into subscriptions (user_id, plan_id, status, start_date)
  values (new.id, free_plan_id, 'active', current_date);

  return new;
end;
$$ language plpgsql security definer;

-- Note: In a real migration, you'd add this to the existing handle_new_user function 
-- or create a separate trigger on the profiles table.
create trigger on_profile_created
after insert on profiles
for each row execute procedure handle_new_user_setup();

-- 👨‍👩‍👧‍👦 FAMILY SHARING SYSTEM
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('admin', 'member')) default 'member',
  joined_at timestamp with time zone default now(),
  unique(family_id, user_id)
);

-- Update profiles to link to family
alter table profiles add column family_id uuid references families(id) on delete set null;

-- Enable RLS
alter table families enable row level security;
alter table family_members enable row level security;

-- Family Policies
create policy "User can view own family" on families for select 
using (exists (select 1 from family_members where family_id = families.id and user_id = auth.uid()));

create policy "Owner manage family" on families for all
using (owner_id = auth.uid());

create policy "Member view family detail" on family_members for select
using (exists (select 1 from family_members fm where fm.family_id = family_members.family_id and fm.user_id = auth.uid()));

-- Shared Data Policies (Example for Accounts)
drop policy if exists "User own accounts" on accounts;
create policy "User or Family view accounts" on accounts for select
using (
  user_id = auth.uid() or 
  exists (
    select 1 from family_members fm
    join profiles p on p.family_id = fm.family_id
    where p.id = accounts.user_id
    and fm.user_id = auth.uid()
  )
);

-- Table for storing user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for storing workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    layout JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for storing workspace panels
CREATE TABLE workspace_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
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

-- Table for storing panel types
CREATE TABLE panel_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for storing user preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    default_workspace UUID REFERENCES workspaces(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
