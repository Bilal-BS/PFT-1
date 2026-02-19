-- 👑 SETUP SUPERADMIN SCRIPT
-- Run this to make yourself a Superadmin
-- Replace 'YOUR_EMAIL_HERE' with your actual email login

update profiles 
set role = 'superadmin' 
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');

-- If you don't know your email, you can run this to see all users:
select id, email from auth.users;

-- Then use the ID:
-- update profiles set role = 'superadmin' where id = 'USER_ID_HERE';
