-- 🌙 ZAKAT SYSTEM V2 MIGRATION
-- Adds Hijri scheduling and asset treatment

-- 1. Update Accounts Table
alter table accounts add column if not exists zakat_treatment text 
check (zakat_treatment in ('zakatable', 'trading_inventory', 'non_zakatable')) 
default 'zakatable';

-- 2. Update Zakat Settings
alter table zakat_settings add column if not exists hijri_day integer check (hijri_day >= 1 and hijri_day <= 30);
alter table zakat_settings add column if not exists hijri_month text;
alter table zakat_settings add column if not exists include_jewelry boolean default false;

-- 3. Update Zakat Records (Snapshots)
alter table zakat_records add column if not exists hijri_date_display text; -- e.g. "1 Ramadan 1447"
alter table zakat_records add column if not exists assets_snapshot jsonb;    -- Detailed breakdown
