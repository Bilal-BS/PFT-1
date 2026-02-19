-- 1. Ensure 'accounts' table has Zakat columns (Idempotent)
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS zakat_applicable boolean DEFAULT false;

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS zakat_treatment text 
CHECK (zakat_treatment IN ('zakatable', 'trading_inventory', 'non_zakatable')) 
DEFAULT 'zakatable';

-- 2. Ensure 'accounts' table has 'balance' column (Just in case)
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 0;

-- 3. Force Schema Report Reload
NOTIFY pgrst, 'reload schema';
