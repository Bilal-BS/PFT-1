-- 💥 SEED PLANS SCRIPT (ROBUST)
-- This script resets all plans and seeds the 4 Strategic Levels.
-- RUN THIS IN SUPABASE SQL EDITOR

-- 0. Ensure dependent tables exist (to avoid errors)
create table if not exists subscription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan_id uuid references plans(id),
  status text default 'pending',
  type text default 'upgrade',
  requested_at timestamp default now(),
  processed_at timestamp
);

-- 1. Clear existing data (Order matters because of Foreign Keys!)
truncate table subscription_requests cascade;
delete from subscriptions;         
delete from plans;                 

-- 2. Insert The 4 Tiers
insert into plans (name, price, currency, features) values
(
    'Starter', 
    0, 
    'USD', 
    '{
        "max_accounts": 2, 
        "max_txns": 100, 
        "zakat_enabled": false, 
        "multi_currency": false,
        "investments": false
    }'
),
(
    'Personal', 
    5, 
    'USD', 
    '{
        "max_accounts": 9999, 
        "max_txns": 9999, 
        "zakat_enabled": false, 
        "multi_currency": false, 
        "investments": true,
        "loans": true
    }'
),
(
    'Wealth', 
    12, 
    'USD', 
    '{
        "max_accounts": 9999, 
        "max_txns": 9999, 
        "zakat_enabled": "optional", 
        "multi_currency": true, 
        "investments": true,
        "crypto": true,
        "advanced_reports": true
    }'
),
(
    'Halal Wealth', 
    15, 
    'USD', 
    '{
        "max_accounts": 9999, 
        "max_txns": 9999, 
        "zakat_enabled": true, 
        "multi_currency": true, 
        "investments": true,
        "nisab_calculator": true,
        "islamic_mode": true
    }'
);

-- 3. Verify
select name, price from plans order by price asc;
