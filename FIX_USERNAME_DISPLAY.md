# Fix Username Display Issue

## Problem
Leaderboard shows "User 82af8c0e" instead of your username.

## Cause
Your existing user account doesn't have a username set in the database yet (created before username feature was added).

---

## Solution (Choose One)

### Option 1: Quick Fix - Auto-generate from Email ✅ (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Sets username to the part before @ in your email
-- Example: john@example.com → username: john
UPDATE user_profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Check it worked
SELECT id, email, username FROM user_profiles;
```

### Option 2: Set Custom Username

Run this in **Supabase SQL Editor** (replace with your values):

```sql
-- Replace 'your@email.com' with your actual email
-- Replace 'your_username' with desired username
UPDATE user_profiles
SET username = 'your_username'
WHERE email = 'your@email.com';

-- Check it worked
SELECT id, email, username FROM user_profiles;
```

### Option 3: Set via Settings Page

If you added the username settings component:
1. Go to Settings page
2. Enter your desired username
3. Click Save

---

## Verify It Works

1. **Check Database**:
   ```sql
   SELECT id, email, username FROM user_profiles;
   ```
   Should show your username now.

2. **Refresh Leaderboard**:
   - Go to leaderboard page
   - Press F12 (open console)
   - Look for logs: `User xxx: username="your_username"`
   - Your username should now appear!

3. **Clear Cache** (if needed):
   - Hard refresh: Ctrl + Shift + R
   - Or clear browser cache

---

## Debug Steps

### Step 1: Check Console Logs
1. Open leaderboard
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for:
   ```
   Fetched profiles: [...]
   User xxx: username="...", email="..."
   ```

### Step 2: Check Database
```sql
-- See all users and their usernames
SELECT id, email, username, xp FROM user_profiles;

-- Check if username column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'username';
```

### Step 3: Check if Username Column Exists
If username column doesn't exist, run:
```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
```

---

## Expected Result

### Before:
```
Rank | Username           | Score
-----|-------------------|-------
1    | User 82af8c0e (You)| 125.5
```

### After:
```
Rank | Username           | Score
-----|-------------------|-------
1    | your_username (You)| 125.5
```

Or if using email default:
```
Rank | Username      | Score
-----|--------------|-------
1    | john (You)   | 125.5
```
(from john@example.com)

---

## Quick Fix Command

**Just run this one command:**

```sql
UPDATE user_profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL;
```

Then refresh the leaderboard! ✅

---

## Still Not Working?

1. **Check browser console** (F12) for errors
2. **Verify user_profiles table** has username column
3. **Check RLS policies** allow SELECT on user_profiles
4. **Try hard refresh** (Ctrl + Shift + R)

If still having issues, share the console logs!
