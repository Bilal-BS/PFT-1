-- 💥 NEW PLANS SEED SCRIPT (4 TIERS)
-- This script resets all plans and seeds the new 4 tiers provided by the user.
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Clear existing data (Order matters because of Foreign Keys!)
truncate table subscription_requests cascade;
delete from subscriptions;         
delete from plans;                 

-- 2. Insert The 4 Tiers
insert into plans (name, price, currency, features) values
(
    'Free', 
    0, 
    'USD', 
    '{
        "expense_tracking": true,
        "income_tracking": true,
        "budget_overview": true,
        "max_accounts": 1,
        "charts": "limited",
        "description": "Perfect for people just getting started."
    }'
),
(
    'Basic', 
    4.99, 
    'USD', 
    '{
        "expense_tracking": true,
        "income_tracking": true,
        "budget_overview": true,
        "max_accounts": 3,
        "expense_categories": "unlimited",
        "monthly_goals": true,
        "bill_reminders": true,
        "charts": "basic",
        "description": "Great for regular budgeters."
    }'
),
(
    'Premium', 
    9.99, 
    'USD', 
    '{
        "expense_tracking": true,
        "income_tracking": true,
        "budget_overview": true,
        "max_accounts": "unlimited",
        "expense_categories": "unlimited",
        "monthly_goals": true,
        "bill_reminders": true,
        "charts": "advanced",
        "bank_sync": true,
        "smart_insights": true,
        "trend_reports": true,
        "export_data": true,
        "custom_alerts": true,
        "description": "For users who want deeper insights and automation."
    }'
),
(
    'Pro / Business', 
    19.99, 
    'USD', 
    '{
        "expense_tracking": true,
        "income_tracking": true,
        "budget_overview": true,
        "max_accounts": "unlimited",
        "expense_categories": "unlimited",
        "monthly_goals": true,
        "bill_reminders": true,
        "charts": "advanced",
        "bank_sync": true,
        "smart_insights": true,
        "trend_reports": true,
        "export_data": true,
        "custom_alerts": true,
        "multi_user": true,
        "tax_tools": true,
        "business_categories": true,
        "priority_support": true,
        "integrations": true,
        "description": "Best for freelancers and small business owners."
    }'
);

-- 3. Verify
select name, price from plans order by price asc;
