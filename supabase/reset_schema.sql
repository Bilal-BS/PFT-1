-- 💥 RESET DATABASE SCRIPT (Fixes "Database error saving new user")
-- This will DROP all existing tables and recreate them cleanly.
-- WARNING: This deletes all data in these specific tables.

-- 1. Disable RLS temporarily to allow drops
alter table if exists profiles disable row level security;
alter table if exists accounts disable row level security;
alter table if exists transactions disable row level security;

-- 2. Drop everything in order (Cascade handles dependencies)
drop table if exists subscription_payments cascade;
drop table if exists subscriptions cascade;
drop table if exists plans cascade;
drop table if exists user_status cascade;
drop table if exists loan_payments cascade;
drop table if exists loans cascade;
drop table if exists investments cascade;
drop table if exists budgets cascade;
drop table if exists transactions cascade;
drop table if exists categories cascade;
drop table if exists pdcs cascade;
drop table if exists accounts cascade;
drop table if exists exchange_rates cascade;
drop table if exists family_members cascade;
drop table if exists families cascade;
-- Drop profiles last as it is linked to auth.users
drop table if exists profiles cascade;

-- 3. Drop Functions & Triggers
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_new_user_setup() cascade;
drop function if exists public.is_superadmin() cascade;

-- ---------------------------------------------------------
-- 🚀 RE-CREATE EVERYTHING CLEANLY
-- ---------------------------------------------------------

-- 1️⃣ Profiles (User + Superadmin)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user' check (role in ('user','superadmin')),
  base_currency text default 'LKR',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2️⃣ Global Helper Function (Crucial for RLS)
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'superadmin'
  );
$$;

-- 3️⃣ Accounts
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text check (type in ('cash','bank','wallet')),
  balance numeric default 0,
  currency text default 'LKR',
  created_at timestamp default now()
);

-- 4️⃣ Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  type text check (type in ('income','expense'))
);

-- 5️⃣ Transactions
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

-- 6️⃣ Plans (Seed First!)
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  currency text default 'LKR',
  features jsonb,
  created_at timestamp with time zone default now()
);

-- Seed 'Free' Plan immediately (Critical for trigger)
insert into plans (name, price, currency, features)
values ('Free', 0, 'LKR', '{"max_accounts": 2, "max_investments": 3}');

insert into plans (name, price, currency, features)
values ('Ultimate', 25000, 'LKR', '{"max_accounts": 9999}');

-- 7️⃣ Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  plan_id uuid references plans(id) not null,
  status text check (status in ('active','expired','cancelled','trial')) default 'trial',
  start_date date default current_date,
  end_date date,
  created_at timestamp with time zone default now()
);

-- 8️⃣ User Status
create table user_status (
  user_id uuid primary key references profiles(id) on delete cascade,
  is_active boolean default true,
  blocked_reason text,
  updated_at timestamp with time zone default now()
);

-- 9️⃣ Enable RLS
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table user_status enable row level security;

-- 🔟 Policies (Simple & Recursive-Safe)

-- Profiles
create policy "User own profile" on profiles for select using (auth.uid() = id);
create policy "User update own profile" on profiles for update using (auth.uid() = id);
create policy "Superadmin full access profiles" on profiles for all using (is_superadmin());

-- Plans
create policy "Public view plans" on plans for select using (true);

-- Subscriptions
create policy "User view own sub" on subscriptions for select using (auth.uid() = user_id);
create policy "Superadmin manage subs" on subscriptions for all using (is_superadmin());

-- User Status
create policy "User view status" on user_status for select using (auth.uid() = user_id);
create policy "Superadmin manage status" on user_status for all using (is_superadmin());


-- ⚙️ TRIGGERS (The Magic Part)

-- Trigger 1: Handle New User (Insert into Profiles)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'user', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Attach to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Trigger 2: Setup New User (Status, Subscription)
create or replace function public.handle_new_user_setup()
returns trigger as $$
declare
  free_plan_id uuid;
begin
  -- Create User Status
  insert into public.user_status (user_id, is_active) values (new.id, true);

  -- Assign Free Subscription
  select id into free_plan_id from public.plans where name = 'Free' limit 1;
  
  if free_plan_id is not null then
      insert into public.subscriptions (user_id, plan_id, status, start_date)
      values (new.id, free_plan_id, 'active', current_date);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Attach to profiles
drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
after insert on profiles
for each row execute procedure public.handle_new_user_setup();
