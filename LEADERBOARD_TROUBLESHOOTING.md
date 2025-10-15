# Leaderboard Troubleshooting Guide

## Issue: "Rows exist in Supabase but I don't see myself on the leaderboard"

### Quick Fixes (Try these first)

#### 1. **Check Browser Console**
Open your browser's Developer Tools (F12) and check the Console tab for errors or logs:
- Look for: `"Fetched results: X"` - shows how many results were found
- Look for: `"Your rank: X"` - shows your position
- Look for: `"You are not in top 50"` - means you're ranked below 50

#### 2. **Verify Data in Supabase**
1. Go to Supabase Dashboard → Table Editor
2. Open `typing_results` table
3. Check:
   - ✅ Are there rows with your `user_id`?
   - ✅ What's your WPM score?
   - ✅ Is the `language` field filled correctly?

#### 3. **Refresh the Leaderboard**
- Try changing the time filter (All → Today → All)
- Try changing the language filter
- Hard refresh the page (Ctrl + Shift + R)

---

## Common Issues & Solutions

### Issue 1: "I'm not in the top 50"
**Cause**: The leaderboard only shows the top 50 users by WPM.

**Solution**: 
- Check your WPM score in the database
- Complete more tests to improve your score
- The console will show: `"You are not in top 50"`

---

### Issue 2: "Email shows as 'User#xxxxxxxx'"
**Cause**: The `user_profiles` table doesn't exist or doesn't have your email.

**Solution**: Run the `create_user_profiles.sql` script:
```sql
-- Copy and paste this in Supabase SQL Editor
-- See create_user_profiles.sql file
```

This will:
1. Create the user_profiles table
2. Auto-populate emails for new users
3. Set up a trigger for future signups

**Manual Fix**: If you already have users, populate the table:
```sql
INSERT INTO user_profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

---

### Issue 3: "Leaderboard is empty"
**Cause**: No data in `typing_results` table or query error.

**Solution**:
1. Check console for errors
2. Verify RLS policies allow SELECT:
   ```sql
   -- Run this to check policies
   SELECT * FROM pg_policies WHERE tablename = 'typing_results';
   ```
3. Make sure you have the "view_all_results" policy

---

### Issue 4: "Error fetching leaderboard"
**Cause**: Database permissions or table doesn't exist.

**Solution**:
1. Verify table exists:
   ```sql
   SELECT * FROM typing_results LIMIT 1;
   ```
2. Check RLS is enabled and has correct policies
3. Re-run the database setup script

---

## Debugging Steps

### Step 1: Check if data is being saved
1. Complete a typing test while logged in
2. Open browser console
3. Look for: `"Test result saved to database for leaderboard"`
4. If you see an error, check the error message

### Step 2: Manually query your results
Run this in Supabase SQL Editor:
```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT * FROM typing_results 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY wpm DESC;
```

### Step 3: Check your rank manually
```sql
-- See all users ranked by WPM
SELECT 
  user_id,
  MAX(wpm) as best_wpm,
  COUNT(*) as total_tests
FROM typing_results
GROUP BY user_id
ORDER BY best_wpm DESC
LIMIT 50;
```

### Step 4: Verify you're logged in
- Check if you see your email in the top-right corner
- If not logged in, you won't appear on the leaderboard
- Log in and complete a test

---

## Expected Behavior

### When you complete a test:
1. ✅ Console shows: `"Test result saved to database for leaderboard"`
2. ✅ Data appears in `typing_results` table
3. ✅ Your `user_id` matches your auth user ID

### When you view the leaderboard:
1. ✅ Console shows: `"Fetched results: X"` (X > 0)
2. ✅ Console shows: `"Leaderboard data: X users"`
3. ✅ If you're in top 50: `"Your rank: X"`
4. ✅ Your row is highlighted with accent color

---

## Still Not Working?

### Check these:

1. **User ID mismatch**
   ```sql
   -- Get your current user ID
   SELECT auth.uid();
   
   -- Check if it matches your typing_results
   SELECT DISTINCT user_id FROM typing_results;
   ```

2. **RLS blocking you**
   - Temporarily disable RLS to test:
   ```sql
   ALTER TABLE typing_results DISABLE ROW LEVEL SECURITY;
   -- Test the leaderboard
   -- Then re-enable:
   ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;
   ```

3. **Clear cache and re-login**
   - Log out
   - Clear browser cache
   - Log back in
   - Complete a new test

---

## Quick Test Script

Run this to verify everything is working:

```sql
-- 1. Check table exists
SELECT COUNT(*) as total_results FROM typing_results;

-- 2. Check your results (replace YOUR_EMAIL)
SELECT tr.*, up.email 
FROM typing_results tr
LEFT JOIN user_profiles up ON tr.user_id = up.id
WHERE up.email = 'YOUR_EMAIL'
ORDER BY wpm DESC;

-- 3. Check top 10 leaderboard
SELECT 
  user_id,
  MAX(wpm) as best_wpm,
  MAX(accuracy) as best_accuracy
FROM typing_results
GROUP BY user_id
ORDER BY best_wpm DESC
LIMIT 10;
```

---

## Contact Support

If none of these solutions work:
1. Copy the error from browser console
2. Run the Quick Test Script above
3. Share the results for debugging
