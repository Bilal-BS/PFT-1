-- FIX SUBSCRIPTION SCHEMA
-- Adds missing columns expected by the frontend logic

-- 1. Add missing columns
alter table public.subscriptions 
add column if not exists current_period_start timestamp with time zone default now(),
add column if not exists current_period_end timestamp with time zone,
add column if not exists updated_at timestamp with time zone default now();

-- 2. Reload Schema Cache (Force Supabase to recognize changes)
NOTIFY pgrst, 'reload config';
