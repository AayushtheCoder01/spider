-- Set default username for existing users who don't have one
-- Run this in Supabase SQL Editor

-- Option 1: Set username based on email (before @ symbol)
UPDATE user_profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Option 2: If you want to set a specific username for yourself
-- Replace 'YOUR_EMAIL' and 'your_username' with your actual values
-- UPDATE user_profiles
-- SET username = 'your_username'
-- WHERE email = 'YOUR_EMAIL';

-- Check the results
SELECT id, email, username, xp FROM user_profiles;
