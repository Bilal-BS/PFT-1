-- 💵 TAX ENGINE SCHEMA (ROBUST)

-- 1. Create Tax Records Table
create table if not exists tax_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  tax_year integer not null,
  income_total numeric default 0,
  deductibles_total numeric default 0,
  taxable_income numeric default 0,
  tax_due numeric default 0,
  tax_paid numeric default 0,
  status text check (status in ('Draft', 'Filed', 'Paid', 'Audit')) default 'Draft',
  notes text,
  created_at timestamp default now()
);

-- 2. Enable RLS
alter table tax_records enable row level security;

-- 3. RLS Policies (Drop first to avoid errors)
drop policy if exists "Users manage own tax records" on tax_records;
create policy "Users manage own tax records" on tax_records for all using (auth.uid() = user_id);
