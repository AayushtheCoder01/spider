# 🎯 START HERE - Leaderboard Setup

## ✅ Your Leaderboard is Ready!

Everything is configured. Just follow these 3 steps:

---

## Step 1: Run SQL (2 minutes)

Open **Supabase Dashboard** → **SQL Editor** → **New Query**

Copy and paste this:

```sql
-- COMPLETE LEADERBOARD SETUP
-- Creates typing_results table + adds username to user_profiles

-- 1. Create typing_results table
CREATE TABLE IF NOT EXISTS typing_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
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

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_typing_results_user_id ON typing_results(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_results_wpm ON typing_results(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_typing_results_created_at ON typing_results(created_at DESC);

-- 3. Enable RLS
ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies
DROP POLICY IF EXISTS insert_own_results ON typing_results;
DROP POLICY IF EXISTS view_all_results ON typing_results;
DROP POLICY IF EXISTS delete_own_results ON typing_results;

-- 5. Create policies
CREATE POLICY insert_own_results ON typing_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY view_all_results ON typing_results
  FOR SELECT USING (true);

CREATE POLICY delete_own_results ON typing_results
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Add username to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 7. Create username index
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 8. Add constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'username_length_check'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT username_length_check 
    CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 50));
  END IF;
END $$;

-- Done!
SELECT 'Setup complete!' as status;
```

**Click RUN** ✅

---

## Step 2: Test Signup (1 minute)

1. Go to your app
2. Click **Sign Up**
3. Fill in:
   - Email: `test@example.com`
   - Username: `test_user_123` ← Will check if available ✓
   - Password: `password123`
4. Click **Execute Signup**
5. Should succeed! ✅

---

## Step 3: Test Leaderboard (1 minute)

1. **Log in** with your new account
2. **Complete a typing test** (any duration)
3. Click **🏆 leaderboard** button
4. **See yourself** on the leaderboard!

Your username should appear with your score. ✅

---

## 🎉 That's It!

Your leaderboard now shows:
- ✅ Usernames (not emails)
- ✅ Combined Score (WPM + XP bonus)
- ✅ Rankings with 🥇🥈🥉
- ✅ Filters (time, language)

---

## 📚 Need More Info?

- **COMPLETE_SETUP_GUIDE.md** - Full documentation
- **LEADERBOARD_SUMMARY.md** - Visual overview
- **SIGNUP_USERNAME_COMPLETE.md** - Signup details

---

## 🔧 Troubleshooting

### "Username already taken"
- Try a different username
- Check database: `SELECT username FROM user_profiles;`

### Leaderboard is empty
- Complete at least one typing test while logged in
- Check: `SELECT * FROM typing_results;`

### Username shows as "User xxxxxxxx"
- User needs to sign up with new account (username required)
- Or manually set: `UPDATE user_profiles SET username = 'name' WHERE id = 'user_id';`

---

## ✨ Features Summary

```
SIGNUP                TYPING TEST           LEADERBOARD
  ↓                       ↓                      ↓
Email ✓              Complete Test          Username
Username ✓    →      Earn XP        →       Score (WPM+XP)
Password ✓           Save Results           Rank 🥇
  ↓                       ↓                      ↓
user_profiles        typing_results         Combined View
```

**Everything is streamlined and ready to use!** 🚀

---

## Quick Commands

### Check if setup worked:
```sql
-- Should return data
SELECT * FROM typing_results LIMIT 5;
SELECT * FROM user_profiles LIMIT 5;
```

### View leaderboard data:
```sql
SELECT 
  up.username,
  MAX(tr.wpm) as best_wpm,
  up.xp,
  (MAX(tr.wpm) + (up.xp / 100)) as score
FROM typing_results tr
JOIN user_profiles up ON tr.user_id = up.id
GROUP BY up.id, up.username, up.xp
ORDER BY score DESC
LIMIT 10;
```

---

**Start with Step 1 above!** 👆
