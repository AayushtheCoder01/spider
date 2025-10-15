/**
 * XP System for Typing Test
 * Rewards users based on their typing performance to encourage more practice
 * Enhanced with addictive gamification features: streaks, achievements, multipliers
 */

// XP calculation constants
const BASE_XP_PER_TEST = 10;
const WPM_MULTIPLIER = 0.5; // XP per WPM point
const ACCURACY_BONUS_THRESHOLD = 95; // Bonus XP if accuracy >= 95%
const ACCURACY_BONUS = 20;
const PERFECT_ACCURACY_BONUS = 50; // 100% accuracy
const DURATION_MULTIPLIER = {
  15: 0.5,
  30: 1.0,
  60: 1.5,
  120: 2.0
};
const CONSISTENCY_BONUS_THRESHOLD = 80; // Bonus if consistency >= 80%
const CONSISTENCY_BONUS = 15;

// Streak bonuses (addictive feature!)
const STREAK_MULTIPLIERS = {
  3: 1.1,   // 10% bonus at 3-day streak
  7: 1.25,  // 25% bonus at 7-day streak
  14: 1.5,  // 50% bonus at 14-day streak
  30: 2.0,  // 100% bonus at 30-day streak
  100: 3.0  // 200% bonus at 100-day streak
};

// Combo multiplier for consecutive tests in same session
const COMBO_MULTIPLIER = 0.05; // 5% per test in combo

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_TEST: { id: 'first_test', name: 'First Steps', description: 'Complete your first test', xp: 50, icon: '🎯' },
  SPEED_DEMON_50: { id: 'speed_50', name: 'Speed Demon', description: 'Reach 50 WPM', xp: 100, icon: '⚡' },
  SPEED_DEMON_100: { id: 'speed_100', name: 'Lightning Fast', description: 'Reach 100 WPM', xp: 250, icon: '⚡⚡' },
  SPEED_DEMON_150: { id: 'speed_150', name: 'Supersonic', description: 'Reach 150 WPM', xp: 500, icon: '🚀' },
  PERFECT_ACCURACY: { id: 'perfect', name: 'Perfectionist', description: 'Get 100% accuracy', xp: 100, icon: '💯' },
  PERFECT_10: { id: 'perfect_10', name: 'Flawless Streak', description: 'Get 100% accuracy 10 times', xp: 300, icon: '✨' },
  STREAK_7: { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', xp: 200, icon: '🔥' },
  STREAK_30: { id: 'streak_30', name: 'Month Master', description: '30-day streak', xp: 1000, icon: '🔥🔥' },
  STREAK_100: { id: 'streak_100', name: 'Century Champion', description: '100-day streak', xp: 5000, icon: '👑' },
  TESTS_100: { id: 'tests_100', name: 'Dedicated Typist', description: 'Complete 100 tests', xp: 500, icon: '📈' },
  TESTS_500: { id: 'tests_500', name: 'Typing Veteran', description: 'Complete 500 tests', xp: 2000, icon: '🏆' },
  TESTS_1000: { id: 'tests_1000', name: 'Typing Legend', description: 'Complete 1000 tests', xp: 5000, icon: '👑' },
  NIGHT_OWL: { id: 'night_owl', name: 'Night Owl', description: 'Complete a test after midnight', xp: 50, icon: '🦉' },
  EARLY_BIRD: { id: 'early_bird', name: 'Early Bird', description: 'Complete a test before 6 AM', xp: 50, icon: '🐦' },
  MARATHON: { id: 'marathon', name: 'Marathon Runner', description: 'Complete 10 tests in one day', xp: 300, icon: '🏃' },
  CONSISTENCY_KING: { id: 'consistency', name: 'Consistency King', description: 'Achieve 95%+ consistency', xp: 150, icon: '📊' },
};

/**
 * Calculate XP earned from a typing test
 * @param {Object} testData - Test results data
 * @returns {Object} - XP breakdown and total
 */
export function calculateXP(testData) {
  const {
    wpm = 0,
    accuracy = 0,
    duration_seconds = 30,
    consistency = 0,
    errors = 0,
    streak = 0,
    combo = 0
  } = testData;

  let breakdown = {
    base: BASE_XP_PER_TEST,
    wpm: 0,
    accuracy: 0,
    duration: 0,
    consistency: 0,
    streak: 0,
    combo: 0,
    total: 0,
    multiplier: 1.0
  };

  // Base XP
  breakdown.base = BASE_XP_PER_TEST;

  // WPM bonus (higher WPM = more XP)
  breakdown.wpm = Math.floor(wpm * WPM_MULTIPLIER);

  // Accuracy bonus
  if (accuracy >= 100) {
    breakdown.accuracy = PERFECT_ACCURACY_BONUS;
  } else if (accuracy >= ACCURACY_BONUS_THRESHOLD) {
    breakdown.accuracy = ACCURACY_BONUS;
  }

  // Duration multiplier
  const durationMult = DURATION_MULTIPLIER[duration_seconds] || 1.0;
  breakdown.duration = Math.floor((breakdown.base + breakdown.wpm) * (durationMult - 1));

  // Consistency bonus
  if (consistency >= CONSISTENCY_BONUS_THRESHOLD) {
    breakdown.consistency = CONSISTENCY_BONUS;
  }

  // Calculate base total before multipliers
  let baseTotal = breakdown.base + breakdown.wpm + breakdown.accuracy + breakdown.duration + breakdown.consistency;

  // Streak multiplier (ADDICTIVE!)
  let streakMultiplier = 1.0;
  if (streak >= 100) streakMultiplier = STREAK_MULTIPLIERS[100];
  else if (streak >= 30) streakMultiplier = STREAK_MULTIPLIERS[30];
  else if (streak >= 14) streakMultiplier = STREAK_MULTIPLIERS[14];
  else if (streak >= 7) streakMultiplier = STREAK_MULTIPLIERS[7];
  else if (streak >= 3) streakMultiplier = STREAK_MULTIPLIERS[3];
  
  breakdown.streak = Math.floor(baseTotal * (streakMultiplier - 1));
  breakdown.multiplier = streakMultiplier;

  // Combo multiplier (consecutive tests in session)
  if (combo > 0) {
    const comboMult = 1 + (combo * COMBO_MULTIPLIER);
    breakdown.combo = Math.floor(baseTotal * (comboMult - 1));
    breakdown.multiplier *= comboMult;
  }

  // Calculate final total
  breakdown.total = Math.floor(baseTotal * breakdown.multiplier);

  return breakdown;
}

/**
 * Calculate level from total XP
 * Uses a progressive leveling system
 * @param {number} totalXP - Total XP accumulated
 * @returns {Object} - Level info
 */
export function calculateLevel(totalXP) {
  // Level formula: XP needed = 100 * level^1.5
  // This creates a smooth progression curve
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  while (totalXP >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    level,
    currentXP: totalXP,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpForNextLevel,
    progressPercent: Math.min(100, Math.max(0, progressPercent))
  };
}

/**
 * Get level title based on level number
 * @param {number} level - User's level
 * @returns {string} - Level title
 */
export function getLevelTitle(level) {
  if (level >= 100) return '🏆 Typing Legend';
  if (level >= 75) return '👑 Typing Master';
  if (level >= 50) return '⚡ Speed Demon';
  if (level >= 40) return '🔥 Expert Typist';
  if (level >= 30) return '💎 Advanced Typist';
  if (level >= 20) return '⭐ Skilled Typist';
  if (level >= 10) return '📈 Intermediate Typist';
  if (level >= 5) return '🌱 Novice Typist';
  return '🐣 Beginner Typist';
}

/**
 * Get motivational message based on XP earned
 * @param {number} xpEarned - XP earned in the test
 * @returns {string} - Motivational message
 */
export function getMotivationalMessage(xpEarned) {
  if (xpEarned >= 150) return '🎉 Outstanding performance! Keep it up!';
  if (xpEarned >= 100) return '🌟 Excellent work! You\'re on fire!';
  if (xpEarned >= 75) return '💪 Great job! You\'re improving fast!';
  if (xpEarned >= 50) return '👍 Nice work! Keep practicing!';
  if (xpEarned >= 25) return '✨ Good effort! You\'re making progress!';
  return '🎯 Keep going! Every test makes you better!';
}

/**
 * Calculate and update streak (Supabase version)
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {Object} currentStreakData - Current streak data from DB
 * @returns {Object} - Streak info
 */
export async function calculateStreakSupabase(supabase, userId, currentStreakData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  
  // CRITICAL: Check localStorage to prevent multiple updates in same day
  const lastStreakUpdateDate = localStorage.getItem('lastStreakUpdateDate');
  const alreadyUpdatedToday = lastStreakUpdateDate === todayString;
  
  console.log('🔍 Streak Check:', {
    todayString,
    lastStreakUpdateDate,
    alreadyUpdatedToday
  });
  
  if (!currentStreakData) {
    // First test ever - create streak record
    const { data, error } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        best_streak: 1,
        last_test_date: todayString,
        total_tests: 1,
        tests_today: 1,
        last_test_day: todayString
      })
      .select()
      .single();
    
    // Mark as updated today
    localStorage.setItem('lastStreakUpdateDate', todayString);
    
    return { 
      streak: 1, 
      isNewStreak: true, 
      testsToday: 1,
      totalTests: 1,
      error 
    };
  }
  
  // Parse last test date from database
  const lastTestDateString = currentStreakData.last_test_date;
  const lastDate = new Date(lastTestDateString + 'T00:00:00');
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let newStreak = currentStreakData.current_streak;
  let isNewStreak = false;
  let streakBroken = false;
  let shouldUpdateStreak = false;
  
  // Check if same day for tests_today counter
  const lastTestDayString = currentStreakData.last_test_day;
  const lastTestDay = new Date(lastTestDayString + 'T00:00:00');
  lastTestDay.setHours(0, 0, 0, 0);
  const isSameDay = today.getTime() === lastTestDay.getTime();
  
  const testsToday = isSameDay ? currentStreakData.tests_today + 1 : 1;
  
  console.log('📊 Tests Today Calculation:', {
    lastTestDayString,
    todayString,
    isSameDay,
    currentTestsToday: currentStreakData.tests_today,
    newTestsToday: testsToday
  });
  
  // CRITICAL LOGIC: Only update streak if NOT already updated today
  if (diffDays === 0) {
    // Same day - DON'T increment streak
    console.log('✅ Same day - maintaining streak:', currentStreakData.current_streak);
    newStreak = currentStreakData.current_streak;
    isNewStreak = false;
    shouldUpdateStreak = false;
  } else if (diffDays === 1 && !alreadyUpdatedToday) {
    // Next day AND not yet updated today - increment streak! 🎉
    console.log('🎉 New day! Incrementing streak:', currentStreakData.current_streak, '->', currentStreakData.current_streak + 1);
    newStreak = currentStreakData.current_streak + 1;
    isNewStreak = true;
    shouldUpdateStreak = true;
    // Mark as updated today
    localStorage.setItem('lastStreakUpdateDate', todayString);
  } else if (diffDays === 1 && alreadyUpdatedToday) {
    // Next day BUT already updated - don't increment again
    console.log('⚠️ Already updated streak today, maintaining:', currentStreakData.current_streak);
    newStreak = currentStreakData.current_streak;
    isNewStreak = false;
    shouldUpdateStreak = false;
  } else if (diffDays > 1) {
    // Streak broken 💔 - reset to 1
    console.log('💔 Streak broken! Days missed:', diffDays - 1);
    newStreak = 1;
    streakBroken = true;
    shouldUpdateStreak = true;
    // Mark as updated today
    localStorage.setItem('lastStreakUpdateDate', todayString);
  }
  
  // Update best streak if current is higher
  const bestStreak = Math.max(newStreak, currentStreakData.best_streak);
  
  // Prepare update data
  const updateData = {
    best_streak: bestStreak,
    total_tests: currentStreakData.total_tests + 1,
    tests_today: testsToday,
    last_test_day: todayString
  };
  
  // Only update streak and last_test_date if we should update streak
  if (shouldUpdateStreak) {
    updateData.current_streak = newStreak;
    updateData.last_test_date = todayString;
    console.log('📝 Updating streak in database:', updateData);
  } else {
    console.log('📝 NOT updating streak, only test counts:', updateData);
  }
  
  // Update database
  const { error } = await supabase
    .from('user_streaks')
    .update(updateData)
    .eq('user_id', userId);
  
  return { 
    streak: newStreak, 
    isNewStreak, 
    streakBroken,
    testsToday,
    totalTests: currentStreakData.total_tests + 1,
    bestStreak,
    error 
  };
}

/**
 * Calculate and update streak (localStorage fallback for non-logged users)
 * @param {string} lastTestDate - ISO date string of last test
 * @returns {Object} - Streak info
 */
export function calculateStreak(lastTestDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  
  // CRITICAL: Check if already updated today
  const lastStreakUpdateDate = localStorage.getItem('lastStreakUpdateDate');
  const alreadyUpdatedToday = lastStreakUpdateDate === todayString;
  
  console.log('🔍 Streak Check (localStorage):', {
    todayString,
    lastStreakUpdateDate,
    alreadyUpdatedToday
  });
  
  if (!lastTestDate) {
    localStorage.setItem('currentStreak', '1');
    localStorage.setItem('lastTestDate', todayString);
    localStorage.setItem('lastStreakUpdateDate', todayString);
    return { streak: 1, isNewStreak: true };
  }

  const lastDate = new Date(lastTestDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Get current streak from localStorage
  const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
  
  if (diffDays === 0) {
    // Same day - maintain streak, don't update
    console.log('✅ Same day - maintaining streak:', currentStreak);
    return { streak: currentStreak || 1, isNewStreak: false };
  } else if (diffDays === 1 && !alreadyUpdatedToday) {
    // Next day AND not yet updated - increment streak
    const newStreak = currentStreak + 1;
    localStorage.setItem('currentStreak', newStreak.toString());
    localStorage.setItem('lastTestDate', todayString);
    localStorage.setItem('lastStreakUpdateDate', todayString);
    console.log('🎉 New day! Incrementing streak:', currentStreak, '->', newStreak);
    return { streak: newStreak, isNewStreak: true };
  } else if (diffDays === 1 && alreadyUpdatedToday) {
    // Already updated today - don't increment again
    console.log('⚠️ Already updated streak today, maintaining:', currentStreak);
    return { streak: currentStreak, isNewStreak: false };
  } else if (diffDays > 1) {
    // Streak broken - reset to 1
    localStorage.setItem('currentStreak', '1');
    localStorage.setItem('lastTestDate', todayString);
    localStorage.setItem('lastStreakUpdateDate', todayString);
    console.log('💔 Streak broken! Days missed:', diffDays - 1);
    return { streak: 1, isNewStreak: true, streakBroken: true };
  }
  
  // Fallback
  return { streak: currentStreak || 1, isNewStreak: false };
}

/**
 * Check and unlock achievements (Supabase version)
 * @param {Object} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {Object} testData - Test data and user stats
 * @param {Array} existingAchievements - Already unlocked achievement IDs
 * @returns {Array} - Newly unlocked achievements
 */
export async function checkAchievementsSupabase(supabase, userId, testData, existingAchievements = []) {
  const {
    wpm = 0,
    accuracy = 0,
    consistency = 0,
    streak = 0,
    totalTests = 0,
    perfectAccuracyCount = 0
  } = testData;

  const newlyUnlocked = [];

  const checkAndUnlock = async (achievement) => {
    if (!existingAchievements.includes(achievement.id)) {
      newlyUnlocked.push(achievement);
      
      // Save to Supabase
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          xp_earned: achievement.xp
        });
    }
  };

  // First test
  if (totalTests === 1) {
    await checkAndUnlock(ACHIEVEMENTS.FIRST_TEST);
  }

  // Speed achievements
  if (wpm >= 150) await checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_150);
  else if (wpm >= 100) await checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_100);
  else if (wpm >= 50) await checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_50);

  // Accuracy achievements
  if (accuracy >= 100) {
    await checkAndUnlock(ACHIEVEMENTS.PERFECT_ACCURACY);
    if (perfectAccuracyCount >= 10) {
      await checkAndUnlock(ACHIEVEMENTS.PERFECT_10);
    }
  }

  // Streak achievements
  if (streak >= 100) await checkAndUnlock(ACHIEVEMENTS.STREAK_100);
  else if (streak >= 30) await checkAndUnlock(ACHIEVEMENTS.STREAK_30);
  else if (streak >= 7) await checkAndUnlock(ACHIEVEMENTS.STREAK_7);

  // Test count achievements
  if (totalTests >= 1000) await checkAndUnlock(ACHIEVEMENTS.TESTS_1000);
  else if (totalTests >= 500) await checkAndUnlock(ACHIEVEMENTS.TESTS_500);
  else if (totalTests >= 100) await checkAndUnlock(ACHIEVEMENTS.TESTS_100);

  // Time-based achievements
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) {
    await checkAndUnlock(ACHIEVEMENTS.EARLY_BIRD);
  } else if (hour >= 22 || hour < 2) {
    await checkAndUnlock(ACHIEVEMENTS.NIGHT_OWL);
  }

  // Consistency achievement
  if (consistency >= 95) {
    await checkAndUnlock(ACHIEVEMENTS.CONSISTENCY_KING);
  }

  // Daily marathon
  if (testData.testsToday >= 10) {
    await checkAndUnlock(ACHIEVEMENTS.MARATHON);
  }

  return newlyUnlocked;
}

/**
 * Check and unlock achievements (localStorage fallback)
 * @param {Object} testData - Test data and user stats
 * @returns {Array} - Newly unlocked achievements
 */
export function checkAchievements(testData) {
  const {
    wpm = 0,
    accuracy = 0,
    consistency = 0,
    streak = 0,
    totalTests = 0,
    perfectAccuracyCount = 0
  } = testData;

  const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  const newlyUnlocked = [];

  const checkAndUnlock = (achievement) => {
    if (!unlockedAchievements.includes(achievement.id)) {
      newlyUnlocked.push(achievement);
      unlockedAchievements.push(achievement.id);
    }
  };

  // First test
  if (totalTests === 1) {
    checkAndUnlock(ACHIEVEMENTS.FIRST_TEST);
  }

  // Speed achievements
  if (wpm >= 150) checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_150);
  else if (wpm >= 100) checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_100);
  else if (wpm >= 50) checkAndUnlock(ACHIEVEMENTS.SPEED_DEMON_50);

  // Accuracy achievements
  if (accuracy >= 100) {
    checkAndUnlock(ACHIEVEMENTS.PERFECT_ACCURACY);
    if (perfectAccuracyCount >= 10) {
      checkAndUnlock(ACHIEVEMENTS.PERFECT_10);
    }
  }

  // Streak achievements
  if (streak >= 100) checkAndUnlock(ACHIEVEMENTS.STREAK_100);
  else if (streak >= 30) checkAndUnlock(ACHIEVEMENTS.STREAK_30);
  else if (streak >= 7) checkAndUnlock(ACHIEVEMENTS.STREAK_7);

  // Test count achievements
  if (totalTests >= 1000) checkAndUnlock(ACHIEVEMENTS.TESTS_1000);
  else if (totalTests >= 500) checkAndUnlock(ACHIEVEMENTS.TESTS_500);
  else if (totalTests >= 100) checkAndUnlock(ACHIEVEMENTS.TESTS_100);

  // Time-based achievements
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) {
    checkAndUnlock(ACHIEVEMENTS.EARLY_BIRD);
  } else if (hour >= 22 || hour < 2) {
    checkAndUnlock(ACHIEVEMENTS.NIGHT_OWL);
  }

  // Consistency achievement
  if (consistency >= 95) {
    checkAndUnlock(ACHIEVEMENTS.CONSISTENCY_KING);
  }

  // Daily marathon
  const todayTests = getTodayTestCount();
  if (todayTests >= 10) {
    checkAndUnlock(ACHIEVEMENTS.MARATHON);
  }

  // Save unlocked achievements
  if (newlyUnlocked.length > 0) {
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
  }

  return newlyUnlocked;
}

/**
 * Get test count for today
 * @returns {number} - Number of tests completed today
 */
function getTodayTestCount() {
  const today = new Date().toDateString();
  const lastTestDay = localStorage.getItem('lastTestDay');
  
  if (lastTestDay === today) {
    return parseInt(localStorage.getItem('todayTestCount') || '0');
  } else {
    localStorage.setItem('lastTestDay', today);
    localStorage.setItem('todayTestCount', '0');
    return 0;
  }
}

/**
 * Increment today's test count
 */
export function incrementTodayTestCount() {
  const count = getTodayTestCount() + 1;
  localStorage.setItem('todayTestCount', count.toString());
  return count;
}

/**
 * Get user stats for display
 * @returns {Object} - User statistics
 */
export function getUserStats() {
  const allTests = JSON.parse(localStorage.getItem('typingResults') || '[]');
  const totalTests = allTests.length;
  const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
  const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  const todayTests = getTodayTestCount();
  
  // Calculate stats
  const avgWpm = totalTests > 0 
    ? Math.round(allTests.reduce((sum, t) => sum + (t.wpm || 0), 0) / totalTests)
    : 0;
  
  const avgAccuracy = totalTests > 0
    ? Math.round(allTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / totalTests)
    : 0;
  
  const bestWpm = totalTests > 0
    ? Math.max(...allTests.map(t => t.wpm || 0))
    : 0;
  
  const perfectAccuracyCount = allTests.filter(t => t.accuracy >= 100).length;
  
  const bestStreak = parseInt(localStorage.getItem('bestStreak') || currentStreak.toString());
  if (currentStreak > bestStreak) {
    localStorage.setItem('bestStreak', currentStreak.toString());
  }

  return {
    totalTests,
    currentStreak,
    bestStreak: Math.max(currentStreak, bestStreak),
    todayTests,
    avgWpm,
    avgAccuracy,
    bestWpm,
    perfectAccuracyCount,
    unlockedAchievements: unlockedAchievements.length,
    totalAchievements: Object.keys(ACHIEVEMENTS).length
  };
}
