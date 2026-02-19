-- 💥 DOUBLE ENTRY REFACTOR (Reset)
-- This script transforms the database into a Professional Double-Entry System.
-- WARNING: This drops 'transactions', 'accounts', 'assets' tables. Data/History will be lost.

-- 1. Drop Old Tables
drop view if exists account_balances;
drop table if exists ledger_entries cascade;
drop table if exists transactions cascade;
drop table if exists accounts cascade;
drop table if exists assets cascade; -- Dropping the temp table
drop table if exists categories cascade; -- Categories are now Accounts (Income/Expense types)

-- 2. Create Accounts (The Master Entity)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type text check (type in ('asset', 'liability', 'equity', 'income', 'expense')) not null,
  subtype text, -- 'cash', 'bank', 'gold', 'vehicle', 'credit_card', 'payable', 'receivable'
  code text, -- optional accounting code like '1000'
  currency text default 'LKR',
  created_at timestamp default now()
);

-- 3. Create Transactions (The Event Header)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date default current_date not null,
  description text not null,
  reference text,      -- Check #, Invoice #
  type text,          -- Optional tag: 'expense', 'income', 'transfer' (for UI grouping)
  created_at timestamp default now()
);

-- 4. Create Ledger Entries (The Double Entry Heart)
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade not null,
  account_id uuid references accounts(id) on delete cascade not null,
  debit numeric default 0 check (debit >= 0),
  credit numeric default 0 check (credit >= 0),
  description text, -- line item description
  
  -- Constraint: Can't be both (normalized accounting)
  CONSTRAINT check_debit_credit CHECK (
    (debit = 0 AND credit > 0) OR 
    (credit = 0 AND debit > 0) OR
    (debit = 0 AND credit = 0)
  )
);

-- 5. Indexes for Performance
create index idx_ledger_account on ledger_entries(account_id);
create index idx_ledger_transaction on ledger_entries(transaction_id);
create index idx_transactions_user on transactions(user_id);
create index idx_accounts_user on accounts(user_id);

-- 6. View: Account Balances (Real-time calculation)
-- Asset/Expense: Debit is +
-- Liability/Equity/Income: Credit is +
create or replace view account_balances as
select 
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.subtype,
  a.code,
  a.currency,
  coalesce(sum(
    case 
      when a.type in ('asset', 'expense') then le.debit - le.credit
      else le.credit - le.debit
    end
  ), 0) as balance
from accounts a
left join ledger_entries le on a.id = le.account_id
group by a.id;

-- 7. RLS
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table ledger_entries enable row level security;

create policy "Users view own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users manage own accounts" on accounts for all using (auth.uid() = user_id);

create policy "Users view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users manage own transactions" on transactions for all using (auth.uid() = user_id);

create policy "Users view own ledger" on ledger_entries for select using (
  exists (select 1 from transactions t where t.id = ledger_entries.transaction_id and t.user_id = auth.uid())
);
create policy "Users manage own ledger" on ledger_entries for all using (
  exists (select 1 from transactions t where t.id = ledger_entries.transaction_id and t.user_id = auth.uid())
);

-- 8. Seed some Default Accounts for existing users (Optional - helps for testing)
-- You can run this block to auto-populate accounts for your user if you know your user ID,
-- otherwise the Frontend will likely need to handle seeding.
