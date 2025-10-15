# 🎯 Username Feature Setup Guide

## Overview
Add unique usernames to your typing app so users can display custom names on the leaderboard instead of emails.

---

## Step 1: Update Database

Run `ADD_USERNAME.sql` in Supabase SQL Editor:

```sql
-- This will:
-- ✅ Add username column to user_profiles
-- ✅ Make usernames unique
-- ✅ Add validation (3-50 characters)
-- ✅ Create index for fast lookups
```

**Just copy and paste the entire file into Supabase SQL Editor and click RUN.**

---

## Step 2: Leaderboard Already Updated! ✅

The leaderboard (`Leaderboard.jsx`) is already updated to:
- ✅ Fetch usernames from user_profiles
- ✅ Display username on leaderboard
- ✅ Fallback to email if no username set
- ✅ Fallback to "User xxxxxxxx" if neither exists

**No changes needed - it's already done!**

---

## Step 3: Add Username Settings (Optional)

If you want users to set their username in the Settings page:

### Option A: Use the Ready Component

1. Copy `USERNAME_SETTINGS_COMPONENT.jsx` content
2. Create new file: `src/components/UsernameSettings.jsx`
3. Paste the component code
4. Follow the instructions in the file to add it to Settings.jsx

### Option B: Quick Integration

Add this to your Settings.jsx:

```jsx
// 1. Add state
const [username, setUsername] = useState('');
const [savingUsername, setSavingUsername] = useState(false);

// 2. Fetch username in useEffect
const { data: profileData } = await supabase
  .from('user_profiles')
  .select('tier, premium_until, xp, username')  // Add username
  .eq('id', user.id)
  .single();

setUsername(profileData?.username || '');

// 3. Add save function
const handleSaveUsername = async (newUsername) => {
  if (!newUsername || newUsername.length < 3) {
    alert('Username must be at least 3 characters');
    return;
  }
  
  setSavingUsername(true);
  const { error } = await supabase
    .from('user_profiles')
    .update({ username: newUsername })
    .eq('id', user.id);
  
  if (error) {
    alert('Username already taken or invalid');
  } else {
    alert('Username saved!');
  }
  setSavingUsername(false);
};

// 4. Add UI in your JSX
<div>
  <label>Username</label>
  <input 
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="Enter username"
  />
  <button onClick={() => handleSaveUsername(username)}>
    Save
  </button>
</div>
```

---

## How It Works

### Username Priority:
1. **Username** (if set) → Shows on leaderboard
2. **Email** (if no username) → Shows email
3. **User ID** (if neither) → Shows "User xxxxxxxx"

### Username Rules:
- ✅ 3-50 characters
- ✅ Letters, numbers, underscores only
- ✅ Must be unique
- ✅ Case-sensitive

### Examples:
- ✅ `speed_demon`
- ✅ `TypeMaster123`
- ✅ `fast_fingers_99`
- ❌ `ab` (too short)
- ❌ `user@name` (no special chars)
- ❌ `user name` (no spaces)

---

## Testing

### 1. Run the SQL
```sql
-- Check if column was added
SELECT username FROM user_profiles LIMIT 5;
```

### 2. Set a Username
```sql
-- Manually set a username for testing
UPDATE user_profiles 
SET username = 'test_user' 
WHERE id = 'YOUR_USER_ID';
```

### 3. Check Leaderboard
- Go to leaderboard
- Your username should appear instead of email
- Other users without usernames show emails

---

## What's Already Done ✅

- ✅ Leaderboard fetches usernames
- ✅ Leaderboard displays usernames
- ✅ Fallback system works
- ✅ SQL script ready to run

## What You Need to Do 📝

1. **Run `ADD_USERNAME.sql`** in Supabase (Required)
2. **Add username settings UI** in Settings page (Optional)
3. **Test it!**

---

## Summary

**Minimum Setup (5 minutes):**
1. Run `ADD_USERNAME.sql` → Done!
2. Leaderboard automatically shows usernames

**Full Setup (15 minutes):**
1. Run `ADD_USERNAME.sql`
2. Add username settings component
3. Users can set their own usernames

**That's it!** The leaderboard will now show usernames instead of emails. 🎉
