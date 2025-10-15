import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';
import PremiumBadge from './PremiumBadge';
import { calculateLevel, getLevelTitle, getUserStats, ACHIEVEMENTS } from '../utils/xpSystem';

export default function Dashboard({ user }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [todayStats, setTodayStats] = useState({ tests: [], avgWpm: 0, avgAccuracy: 0, totalTests: 0 });
  const [weekStats, setWeekStats] = useState({ tests: [], avgWpm: 0, avgAccuracy: 0, totalTests: 0 });
  const [timeFilter, setTimeFilter] = useState('today'); // 'today' or 'week'
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userStats, setUserStats] = useState(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Check premium status and load XP
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('tier, premium_until, xp')
        .eq('id', user.id)
        .single();

      const now = new Date();
      const isExpired = profileData?.premium_until && new Date(profileData.premium_until) < now;
      const premium = profileData?.tier === 'premium' && !isExpired;
      setIsPremium(premium);

      // Load user XP and calculate level
      const currentXP = profileData?.xp || 0;
      setUserXP(currentXP);
      const levelInfo = calculateLevel(currentXP);
      setUserLevel(levelInfo.level);

      // Load streak data from Supabase
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load achievements from Supabase
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      setUnlockedAchievements(achievementsData ? achievementsData.map(a => a.achievement_id) : []);

      if (!premium) {
        setLoading(false);
        return;
      }

      // Fetch tests from localStorage
      const allTests = JSON.parse(localStorage.getItem('typingResults') || '[]');
      
      // Filter today's tests
      const todayStartTime = new Date();
      todayStartTime.setHours(0, 0, 0, 0);
      
      const todayTests = allTests.filter(test => {
        const testDate = new Date(test.timestamp);
        return testDate >= todayStartTime;
      });

      // Filter this week's tests
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekTests = allTests.filter(test => {
        const testDate = new Date(test.timestamp);
        return testDate >= weekStart;
      });

      // Calculate today's stats
      if (todayTests && todayTests.length > 0) {
        const avgWpm = todayTests.reduce((sum, test) => sum + test.wpm, 0) / todayTests.length;
        const avgAccuracy = todayTests.reduce((sum, test) => sum + test.accuracy, 0) / todayTests.length;
        setTodayStats({
          tests: todayTests,
          avgWpm: Math.round(avgWpm),
          avgAccuracy: Math.round(avgAccuracy),
          totalTests: todayTests.length
        });
      }

      // Calculate week's stats
      if (weekTests && weekTests.length > 0) {
        const avgWpm = weekTests.reduce((sum, test) => sum + test.wpm, 0) / weekTests.length;
        const avgAccuracy = weekTests.reduce((sum, test) => sum + test.accuracy, 0) / weekTests.length;
        setWeekStats({
          tests: weekTests,
          avgWpm: Math.round(avgWpm),
          avgAccuracy: Math.round(avgAccuracy),
          totalTests: weekTests.length
        });
      }

      // Calculate comprehensive user stats
      const avgWpm = allTests.length > 0 
        ? Math.round(allTests.reduce((sum, t) => sum + (t.wpm || 0), 0) / allTests.length)
        : 0;
      
      const avgAccuracy = allTests.length > 0
        ? Math.round(allTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / allTests.length)
        : 0;
      
      const bestWpm = allTests.length > 0
        ? Math.max(...allTests.map(t => t.wpm || 0))
        : 0;
      
      const perfectAccuracyCount = allTests.filter(t => t.accuracy >= 100).length;

      // Calculate tests today from localStorage (more accurate than Supabase)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const testsCompletedToday = allTests.filter(test => {
        const testDate = new Date(test.timestamp);
        return testDate >= todayStart;
      }).length;

      const stats = {
        totalTests: streakData?.total_tests || allTests.length,
        currentStreak: streakData?.current_streak || 0,
        bestStreak: streakData?.best_streak || 0,
        todayTests: testsCompletedToday, // Use calculated value from localStorage
        avgWpm,
        avgAccuracy,
        bestWpm,
        perfectAccuracyCount,
        unlockedAchievements: achievementsData?.length || 0,
        totalAchievements: Object.keys(ACHIEVEMENTS).length
      };
      
      setUserStats(stats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStats = timeFilter === 'today' ? todayStats : weekStats;

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.bg }}>
        {/* Navigation */}
        <nav className="px-8 py-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold transition"
              style={{ color: theme.text }}
            >
              🕷️ SpiderType
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded-lg transition"
              style={{ 
                backgroundColor: theme.buttonBg,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              ← Back to Settings
            </button>
          </div>
        </nav>

        {/* Premium Lock */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div 
            className="max-w-2xl w-full p-12 rounded-lg text-center"
            style={{ 
              backgroundColor: theme.accent + '10',
              border: `2px solid ${theme.accent}`
            }}
          >
            <div className="text-6xl mb-6">📊</div>
            <PremiumBadge variant="premium" label="Premium Feature" className="mb-4" />
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>
              Premium Dashboard
            </h2>
            <p className="mb-2" style={{ color: theme.textSecondary }}>
              Track your daily and weekly progress with detailed analytics
            </p>
            <PremiumBadge variant="promo" label="Get 1 Month Free - Limited Time" className="mb-8" />
            <button
              onClick={() => navigate('/premium')}
              className="px-8 py-3 rounded-lg font-bold transition-all duration-300"
              style={{ 
                backgroundColor: theme.accent,
                color: theme.bg,
                boxShadow: `0 4px 20px ${theme.accent}40`,
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 8px 30px ${theme.accent}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 20px ${theme.accent}40`;
              }}
            >
              Claim Free Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: theme.bg,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
    }}>
      {/* Terminal Header Bar */}
      <div 
        className="px-4 py-2 flex items-center justify-between"
        style={{ 
          backgroundColor: theme.bgSecondary,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }}></div>
          </div>
          <span className="text-xs font-mono" style={{ color: theme.accent }}>
            spidertype@dashboard
          </span>
          <span className="text-xs" style={{ color: theme.textMuted }}>:</span>
          <span className="text-xs font-mono" style={{ color: theme.correct }}>~</span>
          <span className="text-xs" style={{ color: theme.textMuted }}>$</span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: theme.textMuted }}>
          <span className="font-mono">bash</span>
          <span>•</span>
          <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-8 py-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold transition font-mono"
              style={{ color: theme.accent }}
            >
              $ ./spidertype
            </button>
            <PremiumBadge variant="active" label="Premium" subtle />
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-lg transition font-mono"
            style={{ 
              backgroundColor: theme.buttonBg,
              color: theme.text,
              border: `1px solid ${theme.border}`
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.buttonHover;
              e.target.style.borderColor = theme.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.buttonBg;
              e.target.style.borderColor = theme.border;
            }}
          >
            $ cd ../settings
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Gamification Stats Section */}
        {userStats && (
          <div className="mb-12">
            {/* XP and Level Card */}
            <div 
              className="p-6 rounded-lg mb-6 relative overflow-hidden"
              style={{ 
                backgroundColor: theme.bgSecondary,
                border: `2px solid ${theme.accent}`,
                boxShadow: `0 8px 32px ${theme.accent}30`
              }}
            >
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.correct}, ${theme.accent})`,
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-4xl font-bold" style={{ color: theme.accent }}>
                        Level {userLevel}
                      </span>
                      <span className="text-2xl">{getLevelTitle(userLevel).split(' ')[0]}</span>
                    </div>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      {getLevelTitle(userLevel)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: theme.correct }}>
                      {userXP.toLocaleString()}
                    </div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      Total XP
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <div 
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.buttonBg }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${calculateLevel(userXP).progressPercent}%`,
                        backgroundColor: theme.accent,
                        boxShadow: `0 0 10px ${theme.accent}80`
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs" style={{ color: theme.textMuted }}>
                    <span>{calculateLevel(userXP).xpInCurrentLevel} XP</span>
                    <span>{calculateLevel(userXP).xpNeededForNextLevel} XP to Level {userLevel + 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold mb-1" style={{ color: theme.accent }}>
                  {userStats.currentStreak}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  Day Streak
                </div>
              </div>

              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="text-3xl mb-2">📝</div>
                <div className="text-2xl font-bold mb-1" style={{ color: theme.correct }}>
                  {userStats.todayTests}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  Tests Today
                </div>
              </div>

              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold mb-1" style={{ color: theme.accent }}>
                  {userStats.totalTests}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  Total Tests
                </div>
              </div>

              <div 
                className="p-4 rounded-lg text-center"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold mb-1" style={{ color: theme.correct }}>
                  {userStats.unlockedAchievements}/{userStats.totalAchievements}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  Achievements
                </div>
              </div>
            </div>

            {/* Achievements Display */}
            <div 
              className="p-6 rounded-lg"
              style={{ 
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.border}`
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>
                Achievements ({userStats.unlockedAchievements}/{userStats.totalAchievements})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.values(ACHIEVEMENTS).map((achievement) => {
                  const unlocked = unlockedAchievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className="p-3 rounded-lg text-center transition-all duration-300"
                      style={{
                        backgroundColor: unlocked ? theme.accent + '20' : theme.buttonBg,
                        border: `1px solid ${unlocked ? theme.accent : theme.border}`,
                        opacity: unlocked ? 1 : 0.4,
                        transform: unlocked ? 'scale(1)' : 'scale(0.95)'
                      }}
                      title={achievement.description}
                    >
                      <div className="text-3xl mb-1">{achievement.icon}</div>
                      <div 
                        className="text-xs font-semibold mb-1"
                        style={{ color: unlocked ? theme.accent : theme.textMuted }}
                      >
                        {achievement.name}
                      </div>
                      {unlocked && (
                        <div className="text-xs" style={{ color: theme.textMuted }}>
                          +{achievement.xp} XP
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Terminal Prompt Header */}
        <div className="mb-8 px-6 py-4 rounded-lg" style={{ 
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`
        }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono" style={{ color: theme.accent }}>user@spidertype</span>
            <span style={{ color: theme.textMuted }}>:</span>
            <span className="font-mono" style={{ color: theme.correct }}>~/dashboard</span>
            <span style={{ color: theme.textMuted }}>$</span>
            <span className="font-mono" style={{ color: theme.text }}>./analytics --show-stats</span>
          </div>
          <p className="text-sm font-mono" style={{ color: theme.textMuted }}>
            # Track your typing progress and performance
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTimeFilter('today')}
            className="px-6 py-3 rounded-lg font-mono font-semibold transition-all duration-300"
            style={{
              backgroundColor: timeFilter === 'today' ? theme.accent : theme.bgSecondary,
              color: timeFilter === 'today' ? theme.bg : theme.text,
              border: `2px solid ${timeFilter === 'today' ? theme.accent : theme.border}`,
            }}
          >
            $ --filter=today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className="px-6 py-3 rounded-lg font-mono font-semibold transition-all duration-300"
            style={{
              backgroundColor: timeFilter === 'week' ? theme.accent : theme.bgSecondary,
              color: timeFilter === 'week' ? theme.bg : theme.text,
              border: `2px solid ${timeFilter === 'week' ? theme.accent : theme.border}`,
            }}
          >
            $ --filter=week
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-4"
              style={{ 
                borderColor: theme.border,
                borderTopColor: theme.accent 
              }}
            ></div>
          </div>
        ) : currentStats.totalTests === 0 ? (
          <div 
            className="p-12 rounded-lg text-center"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <div className="text-5xl mb-4">📝</div>
            <p className="text-xl" style={{ color: theme.textMuted }}>
              No tests {timeFilter === 'today' ? 'today' : 'this week'} yet. Start typing to see your stats!
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Tests */}
              <div 
                className="p-6 rounded-lg relative overflow-hidden"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `2px solid ${theme.border}`,
                  boxShadow: `0 4px 12px ${theme.accent}20`,
                }}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{
                    background: `radial-gradient(circle, ${theme.accent}, transparent)`,
                  }}
                />
                <div className="relative">
                  <div className="text-sm mb-2 font-mono" style={{ color: theme.textMuted }}>
                    $ echo $TOTAL_TESTS
                  </div>
                  <div className="text-4xl font-bold font-mono" style={{ color: theme.accent }}>
                    {currentStats.totalTests}
                  </div>
                </div>
              </div>

              {/* Average WPM */}
              <div 
                className="p-6 rounded-lg relative overflow-hidden"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `2px solid ${theme.border}`,
                  boxShadow: `0 4px 12px ${theme.correct}20`,
                }}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{
                    background: `radial-gradient(circle, ${theme.correct}, transparent)`,
                  }}
                />
                <div className="relative">
                  <div className="text-sm mb-2 font-mono" style={{ color: theme.textMuted }}>
                    $ echo $AVG_WPM
                  </div>
                  <div className="text-4xl font-bold font-mono" style={{ color: theme.correct }}>
                    {currentStats.avgWpm}
                  </div>
                </div>
              </div>

              {/* Average Accuracy */}
              <div 
                className="p-6 rounded-lg relative overflow-hidden"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `2px solid ${theme.border}`,
                  boxShadow: `0 4px 12px ${theme.accent}20`,
                }}
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-10"
                  style={{
                    background: `radial-gradient(circle, ${theme.accent}, transparent)`,
                  }}
                />
                <div className="relative">
                  <div className="text-sm mb-2 font-mono" style={{ color: theme.textMuted }}>
                    $ echo $AVG_ACCURACY
                  </div>
                  <div className="text-4xl font-bold font-mono" style={{ color: theme.accent }}>
                    {currentStats.avgAccuracy}%
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Best Performance */}
              <div 
                className="p-6 rounded-lg"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏆</span>
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                    Best Performance
                  </h3>
                </div>
                {currentStats.tests.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                        Highest WPM
                      </div>
                      <div className="text-3xl font-bold" style={{ color: theme.accent }}>
                        {Math.max(...currentStats.tests.map(t => t.wpm))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                        Best Accuracy
                      </div>
                      <div className="text-3xl font-bold" style={{ color: theme.correct }}>
                        {Math.max(...currentStats.tests.map(t => t.accuracy))}%
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    No data yet
                  </p>
                )}
              </div>

              {/* Most Used Language */}
              <div 
                className="p-6 rounded-lg"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💻</span>
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                    Most Practiced
                  </h3>
                </div>
                {currentStats.tests.length > 0 ? (
                  <>
                    {(() => {
                      const langCounts = currentStats.tests.reduce((acc, test) => {
                        acc[test.language] = (acc[test.language] || 0) + 1;
                        return acc;
                      }, {});
                      const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];
                      return (
                        <>
                          <div className="mb-3">
                            <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                              Language
                            </div>
                            <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                              {topLang[0]}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                              Tests Completed
                            </div>
                            <div className="text-3xl font-bold" style={{ color: theme.text }}>
                              {topLang[1]}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    No data yet
                  </p>
                )}
              </div>

              {/* Consistency Score */}
              <div 
                className="p-6 rounded-lg"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📈</span>
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                    Consistency
                  </h3>
                </div>
                {currentStats.tests.length > 1 ? (
                  <>
                    {(() => {
                      const wpms = currentStats.tests.map(t => t.wpm);
                      const avgWpm = wpms.reduce((a, b) => a + b, 0) / wpms.length;
                      const variance = wpms.reduce((sum, wpm) => sum + Math.pow(wpm - avgWpm, 2), 0) / wpms.length;
                      const stdDev = Math.sqrt(variance);
                      const consistency = Math.max(0, 100 - (stdDev / avgWpm) * 100);
                      
                      return (
                        <>
                          <div className="mb-3">
                            <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                              Score
                            </div>
                            <div className="text-3xl font-bold" style={{ color: consistency > 70 ? theme.correct : theme.accent }}>
                              {Math.round(consistency)}%
                            </div>
                          </div>
                          <div className="text-sm" style={{ color: theme.textSecondary }}>
                            {consistency > 80 ? '🎯 Very consistent!' : consistency > 60 ? '👍 Good consistency' : '💪 Keep practicing'}
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Need more tests
                  </p>
                )}
              </div>

              {/* Improvement Trend */}
              <div 
                className="p-6 rounded-lg"
                style={{ 
                  backgroundColor: theme.bgSecondary,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                    Progress
                  </h3>
                </div>
                {currentStats.tests.length > 2 ? (
                  <>
                    {(() => {
                      const recent = currentStats.tests.slice(0, 3);
                      const older = currentStats.tests.slice(-3);
                      const recentAvg = recent.reduce((sum, t) => sum + t.wpm, 0) / recent.length;
                      const olderAvg = older.reduce((sum, t) => sum + t.wpm, 0) / older.length;
                      const improvement = recentAvg - olderAvg;
                      
                      return (
                        <>
                          <div className="mb-3">
                            <div className="text-sm mb-1" style={{ color: theme.textMuted }}>
                              WPM Change
                            </div>
                            <div 
                              className="text-3xl font-bold flex items-center gap-2"
                              style={{ color: improvement >= 0 ? theme.correct : theme.incorrect }}
                            >
                              {improvement >= 0 ? '↑' : '↓'} {Math.abs(Math.round(improvement))}
                            </div>
                          </div>
                          <div className="text-sm" style={{ color: theme.textSecondary }}>
                            {improvement > 5 ? '🔥 Great improvement!' : improvement > 0 ? '✨ Getting better!' : '💪 Keep going!'}
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    Need more tests
                  </p>
                )}
              </div>
            </div>

            {/* Recent Tests */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: theme.accent }}>$</span>
                <h2 className="text-2xl font-bold font-mono" style={{ color: theme.text }}>
                  ls -la ~/tests/recent
                </h2>
              </div>
              <div className="space-y-3">
                {currentStats.tests.slice(0, 10).map((test) => (
                  <button
                    key={test.id}
                    onClick={() => navigate(`/test/${test.id}`)}
                    className="w-full p-4 rounded-lg transition-all duration-300 text-left relative overflow-hidden"
                    style={{ 
                      backgroundColor: theme.bgSecondary,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 2px 8px ${theme.accent}20`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.accent;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${theme.accent}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 2px 8px ${theme.accent}20`;
                    }}
                  >
                    {/* Shimmer effect */}
                    <div 
                      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${theme.accent}15, transparent)`,
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-3xl font-bold" style={{ color: theme.accent }}>
                            {Math.round(test.wpm)}
                          </div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            WPM
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold" style={{ color: theme.correct }}>
                            {Math.round(test.accuracy)}%
                          </div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            Accuracy
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.text }}>
                            {test.language}
                          </div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            {test.duration_seconds}s
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm" style={{ color: theme.textSecondary }}>
                          {new Date(test.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs" style={{ color: theme.textMuted }}>
                          {new Date(test.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
