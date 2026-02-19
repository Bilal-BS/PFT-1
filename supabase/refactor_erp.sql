-- 🛠️ ERP REFACTOR SCRIPT (Double Entry System)

-- 1. Update Accounts Table (Support Assets & Liabilities)
alter table accounts drop constraint if exists accounts_type_check;
alter table accounts add constraint accounts_type_check check (type in ('cash','bank','wallet','asset','liability','investment'));
alter table accounts add column if not exists subtype text; -- e.g. 'gold', 'real_estate'
alter table accounts add column if not exists description text;

-- 2. Update Transactions Table (Support Transfers)
alter table transactions drop constraint if exists transactions_type_check;
alter table transactions add constraint transactions_type_check check (type in ('income','expense','transfer'));
alter table transactions add column if not exists to_account_id uuid references accounts(id);

-- 3. Drop Separate Assets Table (Migrating to Accounts)
drop table if exists assets cascade;

-- 4. Enable RLS on modified columns (Inherited, but good to check)
-- No new tables created, so existing policies apply.
