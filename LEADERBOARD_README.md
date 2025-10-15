# Leaderboard Feature

## Overview
The leaderboard feature displays top typing test results ranked by WPM (Words Per Minute). Users can compete globally and see their ranking among all players.

## Features

### 1. **WPM-Based Rankings**
- Users are ranked by their highest WPM score
- Top 50 players are displayed
- Special badges for top 3 positions:
  - 🥇 1st place (Gold)
  - 🥈 2nd place (Silver)
  - 🥉 3rd place (Bronze)

### 2. **Filters**
- **Time Filters**: All time, Today, This Week, This Month
- **Language Filters**: Filter by programming language or word mode
  - All languages
  - Words
  - JavaScript, React, Python, Java, TypeScript, C++, Go, Rust

### 3. **User Rank Display**
- Logged-in users see their current rank highlighted
- Personal best WPM is displayed
- User's row is highlighted with accent color

### 4. **Leaderboard Data**
Each entry shows:
- Rank position
- User email
- WPM score
- Accuracy percentage
- Language/mode used
- Test duration

## Database Setup

### Required Table: `typing_results`

Run the SQL script in `database_setup.sql` in your Supabase SQL editor to create:

1. **typing_results table** with columns:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `wpm` (integer)
   - `raw_wpm` (integer)
   - `accuracy` (integer)
   - `consistency` (integer)
   - `errors` (integer)
   - `correct_chars` (integer)
   - `incorrect_chars` (integer)
   - `duration_seconds` (integer)
   - `time_remaining` (integer)
   - `language` (varchar)
   - `wpm_history` (jsonb)
   - `created_at` (timestamp)

2. **Indexes** for optimal query performance
3. **Row Level Security (RLS) policies**:
   - Users can insert their own results
   - Everyone can view all results (for leaderboard)
   - Users can delete their own results

## How It Works

### 1. **Saving Results**
When a user completes a typing test:
- If logged in, the result is automatically saved to Supabase
- Results include WPM, accuracy, language, duration, and other metrics
- Each test creates a new record in the database

### 2. **Displaying Leaderboard**
- Fetches top results from Supabase
- Groups by user and shows their best WPM
- Applies selected filters (time, language)
- Sorts by WPM in descending order

### 3. **User Ranking**
- Calculates user's position in the filtered leaderboard
- Highlights user's row if they appear in top 50
- Shows rank badge in a special card

## Navigation

Access the leaderboard via:
- **Navigation button** in the main typing test page (🏆 leaderboard)
- **Direct URL**: `/leaderboard`

## Requirements

### For Users:
- Must be logged in to appear on the leaderboard
- Complete at least one typing test
- Results are saved automatically

### For Developers:
1. Run `database_setup.sql` in Supabase
2. Ensure `user_profiles` table exists with `email` column
3. Verify Supabase connection in `supabase-client.ts`

## UI/UX Features

- **Terminal-themed design** matching the app's aesthetic
- **Responsive layout** with grid-based table
- **Color-coded ranks** (gold, silver, bronze)
- **Smooth transitions** and hover effects
- **Loading states** with spinner animation
- **Empty state** message when no results exist

## Privacy

- User emails are displayed on the leaderboard
- Users can only delete their own results
- All users can view the leaderboard (public)

## Future Enhancements

Potential improvements:
- [ ] Add pagination for more than 50 results
- [ ] Weekly/monthly leaderboard resets
- [ ] Friend-only leaderboards
- [ ] Country/region-based rankings
- [ ] Leaderboard for different test durations (15s, 30s, 60s, 120s)
- [ ] Export leaderboard data
- [ ] Share rank on social media
