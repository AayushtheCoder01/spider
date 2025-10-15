# 🚀 Complete Leaderboard Setup - Streamlined Guide

## Quick Overview

Your leaderboard system is **READY** with:
- ✅ Username-based display
- ✅ XP + WPM combined scoring
- ✅ Real-time uniqueness checking on signup
- ✅ Automatic profile creation

---

## 🎯 One-Time Setup (5 Minutes)

### Step 1: Run SQL Setup

**Copy and paste this into Supabase SQL Editor:**

```sql
-- ============================================
-- COMPLETE LEADERBOARD SETUP
-- Run this ONCE in Supabase SQL Editor
-- ============================================

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

-- 2. Create indexes for typing_results
CREATE INDEX IF NOT EXISTS idx_typing_results_user_id ON typing_results(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_results_wpm ON typing_results(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_typing_results_created_at ON typing_results(created_at DESC);

-- 3. Enable RLS on typing_results
ALTER TABLE typing_results ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies
DROP POLICY IF EXISTS insert_own_results ON typing_results;
DROP POLICY IF EXISTS view_all_results ON typing_results;
DROP POLICY IF EXISTS delete_own_results ON typing_results;

-- 5. Create typing_results policies
CREATE POLICY insert_own_results ON typing_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY view_all_results ON typing_results
  FOR SELECT USING (true);

CREATE POLICY delete_own_results ON typing_results
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Add username column to user_profiles (if not exists)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- 7. Create username index
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 8. Add username constraint
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
SELECT 'Setup complete!' as status,
       (SELECT COUNT(*) FROM typing_results) as typing_results,
       (SELECT COUNT(*) FROM user_profiles) as user_profiles;
```

**That's it! Click RUN and you're done.** ✅

---

## 📊 How Everything Works

### 1. **Signup Flow**
```
User Signs Up
    ↓
Enters: Email + Username + Password
    ↓
Real-time check: Is username unique? ✓
    ↓
Creates auth.users entry
    ↓
Creates user_profiles entry (username, email, xp=0)
    ↓
Success! Ready to use
```

### 2. **Typing Test Flow**
```
User Completes Test
    ↓
Saves to typing_results (wpm, accuracy, etc.)
    ↓
Earns XP → Updates user_profiles.xp
    ↓
Leaderboard automatically updates
```

### 3. **Leaderboard Display**
```
Fetches typing_results (best WPM per user)
    ↓
Fetches user_profiles (username, xp)
    ↓
Calculates: Score = WPM + (XP / 100)
    ↓
Sorts by combined score
    ↓
Shows: Rank | Username | Score | WPM | XP | Accuracy
```

---

## 🎮 Features Summary

### ✅ Username System
- **Signup**: Required username field
- **Real-time check**: Shows ✓ or ✗ as you type
- **Unique**: No duplicates allowed
- **Display**: Shows on leaderboard instead of email

### ✅ Ranking System
- **Formula**: Score = WPM + (XP / 100)
- **Fair**: Rewards both speed and consistency
- **Dynamic**: Updates automatically

### ✅ Leaderboard Display
| Column | Shows |
|--------|-------|
| Rank | Position (🥇🥈🥉 for top 3) |
| Username | User's chosen name |
| Score | Combined WPM + XP bonus |
| WPM | Best typing speed |
| XP | Total experience (+bonus) |
| Accuracy | Best accuracy % |
| Lang | Language used |

### ✅ Filters
- **Time**: All, Today, Week, Month
- **Language**: All, JavaScript, Python, etc.

---

## 🧪 Testing Checklist

### Test 1: Signup
- [ ] Go to signup page
- [ ] Enter email
- [ ] Enter username (e.g., `test_user_123`)
- [ ] See real-time check (✓ or ✗)
- [ ] Complete signup
- [ ] Should succeed

### Test 2: Duplicate Username
- [ ] Try to signup with same username
- [ ] Should show "Username already taken" ✗
- [ ] Cannot proceed

### Test 3: Typing Test
- [ ] Log in
- [ ] Complete a typing test
- [ ] Check that result is saved
- [ ] Verify XP increased

### Test 4: Leaderboard
- [ ] Go to leaderboard (🏆 button)
- [ ] See your username (not email)
- [ ] See your score (WPM + XP bonus)
- [ ] See your rank
- [ ] Try filters (time, language)

---

## 📁 Files Overview

### Core Files (Already Updated):
1. ✅ **Signup.jsx** - Username field with real-time checking
2. ✅ **Leaderboard.jsx** - Displays usernames, XP-based ranking
3. ✅ **TypingTest.jsx** - Saves results to database
4. ✅ **App.jsx** - Routes configured

### SQL Files (Run Once):
- **COMPLETE_SETUP_GUIDE.md** ← You're here! (Contains SQL)
- Or use: **SIMPLE_SETUP.sql** + **ADD_USERNAME.sql**

---

## 🔧 Troubleshooting

### Issue: "Username already taken" but I can't find it
**Solution**: Check database:
```sql
SELECT username FROM user_profiles WHERE username = 'your_username';
```

### Issue: Leaderboard shows "User xxxxxxxx" instead of username
**Solution**: User hasn't set username yet. They need to:
1. Sign up with new account (username required)
2. Or manually update: `UPDATE user_profiles SET username = 'name' WHERE id = 'user_id';`

### Issue: Leaderboard empty
**Solution**: 
1. Complete at least one typing test while logged in
2. Check: `SELECT * FROM typing_results;`
3. Verify RLS policies are set

### Issue: XP not showing
**Solution**: Check user_profiles table has xp column:
```sql
SELECT id, username, xp FROM user_profiles LIMIT 5;
```

---

## 🎯 Quick Reference

### Username Rules:
- 3-50 characters
- Letters, numbers, underscores only
- Must be unique
- Example: `speed_demon`, `TypeMaster123`

### Ranking Formula:
```
Score = WPM + (XP / 100)

Example:
- User A: 80 WPM, 5000 XP → Score = 130
- User B: 85 WPM, 0 XP → Score = 85
Winner: User A
```

### Database Tables:
1. **typing_results** - Test results (WPM, accuracy, etc.)
2. **user_profiles** - User data (username, email, XP)
3. **auth.users** - Supabase auth (managed automatically)

---

## ✨ Summary

**What You Have:**
- ✅ Username-based leaderboard
- ✅ Real-time username checking on signup
- ✅ XP + WPM combined scoring
- ✅ Automatic profile creation
- ✅ Filters (time, language)
- ✅ Top 50 rankings
- ✅ Visual feedback (🥇🥈🥉)

**What You Need to Do:**
1. Run the SQL above (one time)
2. Test signup with username
3. Complete a typing test
4. Check leaderboard

**That's it! Everything is streamlined and ready to go!** 🚀
