/**
 * XP System for Typing Test
 * Rewards users based on their typing performance to encourage more practice
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
    errors = 0
  } = testData;

  let breakdown = {
    base: BASE_XP_PER_TEST,
    wpm: 0,
    accuracy: 0,
    duration: 0,
    consistency: 0,
    total: 0
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

  // Calculate total
  breakdown.total = breakdown.base + breakdown.wpm + breakdown.accuracy + breakdown.duration + breakdown.consistency;

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
