# 🚀 Leaderboard Setup - Simple Instructions

## Step 1: Open Supabase
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the SQL
1. Open the file: `FINAL_SETUP.sql`
2. **Copy ALL the content** (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor (Ctrl+V)
4. Click **RUN** button (or press Ctrl+Enter)

## Step 3: Wait for Success
You should see: ✅ **Success. No rows returned**

This is normal! It means the tables were created successfully.

## Step 4: Verify Setup
Run this query to check:
```sql
SELECT * FROM typing_results LIMIT 5;
SELECT * FROM user_profiles LIMIT 5;
```

## Step 5: Test the Leaderboard
1. Go to your app
2. Log in
3. Complete a typing test
4. Click **🏆 leaderboard** button
5. You should see yourself on the leaderboard!

---

## ⚠️ If You Get Errors

### Error: "relation already exists"
**This is OK!** It means the table is already there. The script will skip creating it.

### Error: "policy already exists"  
**This is OK!** The script drops old policies first, then creates new ones.

### Error: "permission denied"
Make sure you're logged into Supabase as the project owner.

---

## 🎉 That's It!

After running `FINAL_SETUP.sql`, your leaderboard should work perfectly.

**What the script does:**
- ✅ Creates `typing_results` table
- ✅ Creates `user_profiles` table  
- ✅ Sets up all security policies
- ✅ Creates performance indexes
- ✅ Populates user emails automatically

**No other files needed!** Just run `FINAL_SETUP.sql` and you're done.
