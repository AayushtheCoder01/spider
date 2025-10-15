# 🎯 Simple Leaderboard Setup

## What Changed
✅ **Simplified!** No `user_profiles` table needed  
✅ Leaderboard shows user IDs instead of emails  
✅ Your own email is shown when you're logged in  
✅ Much simpler database setup

---

## Setup (One File Only!)

### Step 1: Run SQL
1. Open `SIMPLE_SETUP.sql`
2. Copy everything
3. Paste in Supabase SQL Editor
4. Click **RUN**

### Step 2: Test
1. Log in to your app
2. Complete a typing test
3. Click **🏆 leaderboard**
4. See yourself on the leaderboard!

---

## What You'll See

**On the leaderboard:**
- Your row: Shows your email + "(You)"
- Other users: Shows "User xxxxxxxx" (first 8 chars of user ID)
- Rankings by WPM
- Filters work (time, language)

---

## That's It!

No complex setup, no email tables, just works! 🚀

**Only need:** `SIMPLE_SETUP.sql`  
**Ignore:** All other SQL files
