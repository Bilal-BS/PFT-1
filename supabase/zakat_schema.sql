-- 🌙 ISLAMIC ZAKAT MODULE SCHEMA (ROBUST)

-- 1. Modify Accounts Table
alter table accounts add column if not exists zakat_applicable boolean default false;

-- 2. Zakat Settings (Per User)
create table if not exists zakat_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  is_enabled boolean default false,
  nisab_method text check (nisab_method in ('Gold', 'Silver')) default 'Gold',
  hijri_day integer check (hijri_day >= 1 and hijri_day <= 30),
  hijri_month text, 
  include_jewelry boolean default false,
  updated_at timestamp default now()
);

-- 3. Zakat Records (History)
create table if not exists zakat_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  hawl_year integer, 
  calculation_date date default current_date,
  total_assets numeric default 0,
  short_term_liabilities numeric default 0,
  net_zakatable_wealth numeric default 0,
  nisab_threshold numeric default 0,
  zakat_due numeric default 0,
  amount_paid numeric default 0,
  status text check (status in ('Pending', 'Partial', 'Paid', 'Distributed')) default 'Pending',
  notes text,
  created_at timestamp default now()
);

-- 4. Enable RLS
alter table zakat_settings enable row level security;
alter table zakat_records enable row level security;

-- 5. RLS Policies (Drop first to avoid errors)
drop policy if exists "Users manage own zakat settings" on zakat_settings;
create policy "Users manage own zakat settings" on zakat_settings for all using (auth.uid() = user_id);

drop policy if exists "Users manage own zakat records" on zakat_records;
create policy "Users manage own zakat records" on zakat_records for all using (auth.uid() = user_id);
