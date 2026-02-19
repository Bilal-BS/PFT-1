-- 🔧 FIX MISSING TABLE: subscription_requests
-- This table is required for the Billing and Superadmin pages.

create table if not exists subscription_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  plan_id uuid references plans(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  type text check (type in ('upgrade', 'downgrade')) default 'upgrade',
  requested_at timestamp with time zone default now(),
  processed_at timestamp with time zone
);

-- Enable RLS
alter table subscription_requests enable row level security;

-- Policies
create policy "Users view own requests" on subscription_requests for select using (auth.uid() = user_id);
create policy "Users create requests" on subscription_requests for insert with check (auth.uid() = user_id);
create policy "Superadmin manage requests" on subscription_requests for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'superadmin')
);
