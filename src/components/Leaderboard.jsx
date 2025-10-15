import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';

export default function Leaderboard({ user }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [userRank, setUserRank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, [languageFilter, currentPage]);

  // Reset to page 1 when language filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [languageFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Always filter for today's results only
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      
      // First, get total count for pagination
      let countQuery = supabase
        .from('typing_results')
        .select('*', { count: 'exact', head: false })
        .gte('created_at', startOfToday.toISOString());

      if (languageFilter !== 'all') {
        countQuery = countQuery.eq('language', languageFilter);
      }

      const { data: allData, count, error: countError } = await countQuery;

      if (countError) {
        console.error('Error fetching count:', countError);
        setTotalCount(0);
      } else {
        // Group by user to get actual unique user count
        const userBestScoresForCount = {};
        (allData || []).forEach(result => {
          const userId = result.user_id;
          if (!userBestScoresForCount[userId] || result.wpm > userBestScoresForCount[userId].wpm) {
            userBestScoresForCount[userId] = result;
          }
        });
        setTotalCount(Object.keys(userBestScoresForCount).length);
      }

      // Fetch all results for today (we need to process them to get best per user)
      let query = supabase
        .from('typing_results')
        .select('*')
        .gte('created_at', startOfToday.toISOString())
        .order('wpm', { ascending: false });

      // Apply language filter
      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
      } else {
        // Group by user and get their best WPM
        const userBestScores = {};
        data.forEach(result => {
          const userId = result.user_id;
          if (!userBestScores[userId] || result.wpm > userBestScores[userId].wpm) {
            userBestScores[userId] = result;
          }
        });

        // Get unique user IDs
        const userIds = Object.keys(userBestScores);

        // Fetch user profiles - try to get username, email, xp
        let profiles = [];
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', userIds);

          if (error) {
            console.error('Error fetching user_profiles:', error);
          } else {
            profiles = data || [];
            console.log('Successfully fetched profiles:', profiles);
          }
        } catch (err) {
          console.error('Exception fetching profiles:', err);
        }

        // Create XP, email, and username map
        const userXP = {};
        const userEmails = {};
        const userUsernames = {};
        
        profiles.forEach(profile => {
          userXP[profile.id] = profile.xp || 0;
          userEmails[profile.id] = profile.email || '';
          userUsernames[profile.id] = profile.username || '';
          console.log(`Profile for ${profile.id}:`, {
            username: profile.username,
            email: profile.email,
            xp: profile.xp
          });
        });

        // Calculate combined score for each user
        // Formula: Score = WPM + (XP / 100)
        // This means 100 XP = 1 WPM bonus
        const enrichedData = Object.values(userBestScores).map(result => {
          const xp = userXP[result.user_id] || 0;
          const xpBonus = xp / 100;
          const combinedScore = result.wpm + xpBonus;
          const username = userUsernames[result.user_id];
          const email = userEmails[result.user_id];
          
          // Generate friendly display name
          let displayName;
          if (username) {
            displayName = username;
          } else if (email) {
            // Use email username part as default (before @)
            displayName = email.split('@')[0];
          } else {
            displayName = `User_${result.user_id.substring(0, 8)}`;
          }
          
          return {
            ...result,
            username: displayName,
            email: email,
            xp: xp,
            xpBonus: Math.round(xpBonus * 10) / 10,
            combinedScore: Math.round(combinedScore * 10) / 10
          };
        });

        // Sort by combined score
        const sortedData = enrichedData
          .sort((a, b) => b.combinedScore - a.combinedScore);

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedData = sortedData.slice(startIndex, endIndex);

        setLeaderboardData(paginatedData);

        // Find user's rank (in the full sorted data, not paginated)
        if (user) {
          const userIndex = sortedData.findIndex(item => item.user_id === user.id);
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
          } else {
            setUserRank(null);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return theme.textSecondary;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.bg, 
        color: theme.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
      }}
    >
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
            spidertype@leaderboard
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className="px-8 py-4"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded text-sm transition font-mono"
              style={{
                backgroundColor: theme.bgSecondary,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.buttonHover;
                e.target.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.bgSecondary;
                e.target.style.borderColor = theme.border;
              }}
            >
              ← Back to Test
            </button>
          </div>

          <h1 className="text-2xl font-bold" style={{ color: theme.accent }}>
            🏆 Leaderboard
          </h1>

          <div className="w-32"></div>
        </div>
      </nav>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          {/* Today's Leaderboard Title */}
          <div>
            <h2 className="text-xl font-bold font-mono" style={{ color: theme.accent }}>
              📅 Today's Leaderboard
            </h2>
            <p className="text-sm font-mono mt-1" style={{ color: theme.textMuted }}>
              Rankings reset daily at midnight
            </p>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono" style={{ color: theme.textMuted }}>Language:</span>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-1.5 rounded text-sm font-mono cursor-pointer"
              style={{
                backgroundColor: theme.bgSecondary,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              <option value="all">All</option>
              <option value="words">Words</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
        </div>

        {/* User's Rank Card */}
        {user && userRank && (
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.accent + '20',
              border: `2px solid ${theme.accent}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold" style={{ color: theme.accent }}>
                  Your Rank: #{userRank}
                </span>
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  {user.email}
                </span>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-sm" style={{ color: theme.textMuted }}>Score</div>
                  <div className="text-3xl font-bold" style={{ color: theme.accent }}>
                    {leaderboardData[userRank - 1]?.combinedScore || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: theme.textMuted }}>WPM</div>
                  <div className="text-2xl font-bold" style={{ color: theme.text }}>
                    {leaderboardData[userRank - 1]?.wpm || 0}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: theme.textMuted }}>XP</div>
                  <div className="text-2xl font-bold" style={{ color: theme.correct }}>
                    {leaderboardData[userRank - 1]?.xp || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{ 
            backgroundColor: theme.bgSecondary,
            border: `1px solid ${theme.border}`
          }}
        >
          {/* Table Header */}
          <div 
            className="grid grid-cols-12 gap-4 px-6 py-4 font-mono text-sm font-bold"
            style={{ 
              backgroundColor: theme.bg,
              borderBottom: `1px solid ${theme.border}`,
              color: theme.accent
            }}
          >
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">User</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-1">WPM</div>
            <div className="col-span-2">XP</div>
            <div className="col-span-2">Accuracy</div>
            <div className="col-span-1">Lang</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div 
                className="inline-block animate-spin rounded-full h-12 w-12 border-4"
                style={{ 
                  borderColor: theme.border,
                  borderTopColor: theme.accent 
                }}
              ></div>
              <p className="mt-4" style={{ color: theme.textMuted }}>Loading leaderboard...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="px-6 py-12 text-center" style={{ color: theme.textMuted }}>
              No results found. Be the first to set a record!
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: theme.border }}>
              {leaderboardData.map((result, index) => {
                const rank = index + 1;
                const isCurrentUser = user && result.user_id === user.id;
                
                return (
                  <div
                    key={result.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 font-mono text-sm transition-colors"
                    style={{
                      backgroundColor: isCurrentUser ? theme.accent + '10' : 'transparent',
                      borderLeft: isCurrentUser ? `3px solid ${theme.accent}` : 'none',
                      color: theme.text
                    }}
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      <span 
                        className="text-lg font-bold"
                        style={{ color: getRankColor(rank) }}
                      >
                        {getRankIcon(rank)}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span style={{ color: isCurrentUser ? theme.accent : theme.text }}>
                        {isCurrentUser ? (result.username) : result.username}
                        {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-lg font-bold" style={{ color: theme.accent }}>
                        {result.combinedScore}
                      </span>
                      <span className="ml-1 text-xs" style={{ color: theme.textMuted }}>pts</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span style={{ color: theme.text }}>
                        {result.wpm}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span style={{ color: theme.correct }}>
                        {result.xp}
                      </span>
                      <span className="ml-1 text-xs" style={{ color: theme.textMuted }}>
                        (+{result.xpBonus})
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span style={{ color: theme.correct }}>
                        {result.accuracy}%
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span style={{ color: theme.textMuted }}>
                        {result.language.substring(0, 4)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {leaderboardData.length > 0 && (
          <div 
            className="mt-6 p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-mono" style={{ color: theme.textMuted }}>
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded text-sm font-mono transition"
                  style={{
                    backgroundColor: currentPage === 1 ? theme.bg : theme.bg,
                    color: currentPage === 1 ? theme.textMuted : theme.text,
                    border: `1px solid ${theme.border}`,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = theme.buttonHover;
                      e.target.style.borderColor = theme.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = theme.bg;
                      e.target.style.borderColor = theme.border;
                    }
                  }}
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm font-mono" style={{ color: theme.text }}>
                  Page {currentPage} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  className="px-4 py-2 rounded text-sm font-mono transition"
                  style={{
                    backgroundColor: currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? theme.bg : theme.bg,
                    color: currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? theme.textMuted : theme.text,
                    border: `1px solid ${theme.border}`,
                    cursor: currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer',
                    opacity: currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < Math.ceil(totalCount / ITEMS_PER_PAGE)) {
                      e.target.style.backgroundColor = theme.buttonHover;
                      e.target.style.borderColor = theme.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < Math.ceil(totalCount / ITEMS_PER_PAGE)) {
                      e.target.style.backgroundColor = theme.bg;
                      e.target.style.borderColor = theme.border;
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        {!user && (
          <div 
            className="mt-6 p-4 rounded-lg text-center"
            style={{ 
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              color: theme.textMuted
            }}
          >
            <p className="text-sm">
              💡 Sign up or log in to see your rank on the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
