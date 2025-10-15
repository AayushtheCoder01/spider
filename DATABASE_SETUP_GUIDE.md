# Database Setup Guide for Leaderboard

## Quick Setup (Recommended)

### Option 1: Use the Minimal Script (Easiest)

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `database_setup_minimal.sql`
5. Click **Run** (or press Ctrl+Enter)

This creates the `typing_results` table with all necessary policies.

---

## Troubleshooting Common Errors

### Error: "relation already exists"
**Solution**: The table already exists. You can either:
- Skip this step (table is already created)
- Or drop the existing table first (WARNING: deletes all data):
  ```sql
  DROP TABLE IF EXISTS typing_results CASCADE;
  ```
  Then run the script again.

### Error: "policy already exists"
**Solution**: Policies already exist. You can either:
- Skip this step
- Or drop existing policies first:
  ```sql
  DROP POLICY IF EXISTS insert_own_results ON typing_results;
  DROP POLICY IF EXISTS view_all_results ON typing_results;
  DROP POLICY IF EXISTS delete_own_results ON typing_results;
  ```
  Then run the script again.

### Error: "permission denied"
**Solution**: Make sure you're using the SQL Editor in your Supabase dashboard with admin privileges.

---

## Manual Step-by-Step Setup

If you prefer to run commands one by one:

### Step 1: Create the Table
```sql
CREATE TABLE typing_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL,
  raw_wpm INTEGER,
  accuracy INTEGER NOT NULL,
  consistency INTEGER,
  errors INTEGER DEFAULT 0,
  correct_chars INTEGER DEFAULT 0,
  incorrect_chars INTEGER DEFAULT 0,
  duration_seconds INTEGER NOT NULL,
  time_remaining INTEGER,
  language VARCHAR(50) NOT NULL,
  wpm_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Create Indexes
```sql
CREATE INDEX idx_typing_results_user_id ON typing_results(user_id);
CREATE INDEX idx_typing_results_wpm ON typing_results(wpm DESC);
CREATE INDEX idx_typing_results_created_at ON typing_results(created_at DESC);
```

### Step 3: Enable Row Level Security
```sql
ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create Policies
```sql
-- Allow users to insert their own results
CREATE POLICY insert_own_results ON typing_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view all results
CREATE POLICY view_all_results ON typing_results
  FOR SELECT
  USING (true);

-- Allow users to delete their own results
CREATE POLICY delete_own_results ON typing_results
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Verify Setup

After running the SQL, verify everything is set up correctly:

### 1. Check if table exists
```sql
SELECT * FROM typing_results LIMIT 1;
```
Should return: "No rows" (or show data if you've already saved results)

### 2. Check policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'typing_results';
```
Should show 3 policies: insert_own_results, view_all_results, delete_own_results

### 3. Test insert (when logged in)
The app will automatically insert data when you complete a typing test while logged in.

---

## What Each File Does

- **`database_setup.sql`**: Full setup with all features (fixed version)
- **`database_setup_minimal.sql`**: Simplified version, easier to run, same functionality
- **`DATABASE_SETUP_GUIDE.md`**: This guide

---

## Need Help?

If you're still getting errors:

1. **Copy the exact error message** from Supabase
2. Check if `user_profiles` table exists (required for the leaderboard to show emails)
3. Make sure you're logged into Supabase as the project owner
4. Try the minimal script instead of the full one

The leaderboard will work as long as the `typing_results` table is created successfully!
