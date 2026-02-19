-- FIX DUPLICATE SUBSCRIPTIONS SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Remove duplicate subscriptions, keeping only the latest one per user
DELETE FROM subscriptions
WHERE id NOT IN (
    SELECT id FROM (
        SELECT DISTINCT ON (user_id) id
        FROM subscriptions
        ORDER BY user_id, updated_at DESC, created_at DESC
    ) AS keep_rows
);

-- 2. Add Unique Constraint to prevent future duplicates
ALTER TABLE subscriptions 
ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);

-- 3. Verify
SELECT count(*) as total_subscriptions FROM subscriptions;
