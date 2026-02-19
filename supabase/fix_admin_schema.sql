-- 🛠️ SUPERADMIN FIX & FEATURE ROLLOUT SCRIPT
-- Run this to fix the "resolved_at" error and create tables for Logs/Tickets.

-- 1. FIX SUBSCRIPTION REQUESTS (Resolves "Could not find resolved_at")
alter table if exists public.subscription_requests 
add column if not exists resolved_at timestamp with time zone,
add column if not exists notes text;

-- 2. FIX SUBSCRIPTIONS (Ensure these exist)
alter table if exists public.subscriptions 
add column if not exists current_period_start timestamp with time zone default now(),
add column if not exists current_period_end timestamp with time zone,
add column if not exists updated_at timestamp with time zone default now();

-- 3. CREATE SYSTEM LOGS TABLE (For "System Logs" Feature)
create table if not exists public.system_logs (
    id uuid primary key default gen_random_uuid(),
    event_type text not null, -- 'security', 'error', 'admin_action', 'user_action'
    description text,
    user_id uuid references auth.users(id),
    metadata jsonb,
    created_at timestamp with time zone default now()
);

-- Enable RLS for Logs
alter table public.system_logs enable row level security;
drop policy if exists "Superadmin view all logs" on public.system_logs;
create policy "Superadmin view all logs" on public.system_logs for select using (public.is_superadmin());
drop policy if exists "System insert logs" on public.system_logs;
create policy "System insert logs" on public.system_logs for insert with check (true);

-- 4. CREATE SUPPORT TICKETS TABLE (For "Support Tickets" Feature)
create table if not exists public.support_tickets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    subject text not null,
    message text not null,
    status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
    priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
    admin_response text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS for Tickets
alter table public.support_tickets enable row level security;
drop policy if exists "Users manage own tickets" on public.support_tickets;
create policy "Users manage own tickets" on public.support_tickets using (auth.uid() = user_id);
drop policy if exists "Superadmin manage all tickets" on public.support_tickets;
create policy "Superadmin manage all tickets" on public.support_tickets using (public.is_superadmin());

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload config';
