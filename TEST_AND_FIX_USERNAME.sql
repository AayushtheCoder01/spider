-- ============================================
-- TEST AND FIX USERNAME DISPLAY
-- Run these commands one by one in Supabase SQL Editor
-- ============================================

-- STEP 1: Check if username column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'username';
-- Expected: Should show username column with VARCHAR type

-- STEP 2: Check current user_profiles data
SELECT id, email, username, xp FROM user_profiles;
-- Look at the username column - is it NULL or empty?

-- STEP 3: If username is NULL, set it to email username part
UPDATE user_profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;
-- This sets username to part before @ in email

-- STEP 4: Verify the update worked
SELECT id, email, username, xp FROM user_profiles;
-- Now username column should have values!

-- STEP 5: If you want a custom username for yourself, run this:
-- (Replace 'your@email.com' and 'your_custom_username')
-- UPDATE user_profiles
-- SET username = 'your_custom_username'
-- WHERE email = 'your@email.com';

-- ============================================
-- DONE! Now refresh your leaderboard page
-- ============================================
