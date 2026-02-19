-- 🛠️ CREATE MISSING TABLES for Currencies & Assets

-- 1. Exchange Rates (for Currency Sync)
create table if not exists exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  from_currency text not null,
  to_currency text not null,
  rate numeric not null,
  rate_date date default current_date,
  created_at timestamp default now()
);

-- 2. Assets (for Asset Registry)
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text, -- e.g., 'Real Estate', 'Vehicle', 'Digital', 'Gold'
  value numeric default 0,
  currency text default 'LKR',
  purchased_date date,
  description text,
  created_at timestamp default now()
);

-- 3. Enable RLS
alter table exchange_rates enable row level security;
alter table assets enable row level security;

-- 4. RLS Policies
create policy "User manage own rates" on exchange_rates for all using (auth.uid() = user_id);
create policy "User manage own assets" on assets for all using (auth.uid() = user_id);
