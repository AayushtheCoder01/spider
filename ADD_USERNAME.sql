-- Add username column to user_profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Add username column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Step 2: Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Step 3: Add constraint to ensure username is unique and not empty when set
ALTER TABLE user_profiles 
ADD CONSTRAINT username_length_check 
CHECK (username IS NULL OR (char_length(username) >= 3 AND char_length(username) <= 50));

-- Step 4: Create a function to generate default usernames for existing users
CREATE OR REPLACE FUNCTION generate_default_username(user_id UUID)
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'user_' || substring(user_id::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Step 5: Optionally populate usernames for existing users (commented out by default)
-- Uncomment the line below if you want to auto-generate usernames for existing users
-- UPDATE user_profiles SET username = generate_default_username(id) WHERE username IS NULL;

-- Done!
SELECT 'Username column added successfully!' as message;
SELECT COUNT(*) as users_with_username FROM user_profiles WHERE username IS NOT NULL;
