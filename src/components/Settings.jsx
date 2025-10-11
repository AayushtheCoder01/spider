import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase-client';
import PremiumBadge from './PremiumBadge';

export default function Settings({ user }) {
  const { theme, themeName, themes, setTheme } = useTheme();
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const themesList = Object.entries(themes);

  // Fetch user's test history and premium status
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check premium status
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('tier, premium_until')
          .eq('id', user.id)
          .single();

        // Check if premium has expired
        const now = new Date();
        const isExpired = profileData?.premium_until && new Date(profileData.premium_until) < now;
        
        // If expired, automatically downgrade to free
        if (isExpired && profileData?.tier === 'premium') {
          console.log('Premium expired, downgrading to free tier');
          
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              tier: 'free',
              premium_until: null,
              subscription_cancelled_at: now.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating expired profile:', updateError);
          } else {
            // Update auth metadata
            await supabase.auth.updateUser({
              data: {
                tier: 'free',
                premium_until: null
              }
            });
          }
          
          setIsPremium(false);
        } else {
          // User is premium if tier is 'premium' AND (no expiry OR expiry is in future)
          const userIsPremium = profileData?.tier === 'premium' && 
            (profileData?.premium_until === null || new Date(profileData.premium_until) > now);
          
          setIsPremium(userIsPremium);
        }

        // Fetch test history
        const { data, error, count } = await supabase
          .from('typing_results')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(0, ITEMS_PER_PAGE - 1);

        if (error) {
          console.error('Error fetching history:', error);
        } else {
          setTestHistory(data || []);
          setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Load more tests
  const loadMoreTests = async () => {
    if (!user || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const start = nextPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    try {
      const { data, error } = await supabase
        .from('typing_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('Error loading more:', error);
      } else {
        setTestHistory(prev => [...prev, ...(data || [])]);
        setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <nav 
        className="px-8 py-4"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.accent}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            <span className="text-xl">←</span>
            <span className="text-sm">Back to Practice</span>
          </button>
          
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Settings
          </h1>
          
          <div className="w-32"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Theme Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
              Theme
            </h2>
            <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
              Choose your preferred color theme
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themesList.map(([key, themeData]) => {
                const isLocked = themeData.premium && !isPremium;
                return (
                <button
                  key={key}
                  onClick={() => {
                    if (isLocked) {
                      navigate('/premium');
                    } else {
                      setTheme(key);
                    }
                  }}
                  className="relative p-6 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: themeData.bgSecondary,
                    border: `2px solid ${themeName === key ? theme.accent : theme.border}`,
                    transform: themeName === key ? 'scale(1.02)' : 'scale(1)',
                    opacity: isLocked ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (themeName !== key) {
                      e.currentTarget.style.borderColor = themeData.accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (themeName !== key) {
                      e.currentTarget.style.borderColor = theme.border;
                    }
                  }}
                >
                  {/* Premium Lock Overlay */}
                  {isLocked && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center rounded-lg z-10 backdrop-blur-sm transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                      }}
                    >
                      <div className="text-center transform hover:scale-110 transition-transform duration-300">
                        <div className="text-3xl mb-1 animate-bounce">🔒</div>
                        <PremiumBadge variant="premium" label="Premium" subtle />
                        <div 
                          className="text-xs mt-2 font-semibold"
                          style={{ color: theme.accent }}
                        >
                          Click to unlock
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Theme Preview */}
                  <div className="mb-4">
                    <div className="flex gap-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: themeData.bg }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: themeData.accent }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: themeData.correct }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: themeData.incorrect }}
                      ></div>
                    </div>
                    
                    {/* Sample Text */}
                    <div 
                      className="text-xs font-mono mb-1"
                      style={{ color: themeData.text }}
                    >
                      const hello = "world";
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: themeData.textMuted }}
                    >
                      Sample preview text
                    </div>
                  </div>

                  {/* Theme Name */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-medium"
                      style={{ color: themeData.text }}
                    >
                      {themeData.name}
                    </span>
                    {themeName === key && (
                      <span 
                        className="text-sm font-semibold"
                        style={{ color: theme.accent }}
                      >
                        ✓ Active
                      </span>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          {/* Test History Section */}
          {user && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
                  Test History
                </h2>
                {!isPremium && (
                  <PremiumBadge variant="premium" label="Premium Feature" />
                )}
              </div>
              <p className="text-sm mb-6" style={{ color: theme.textMuted }}>
                Your recent typing test results
              </p>

              {!isPremium ? (
                <div 
                  className="p-8 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.accent + '10',
                    border: `2px solid ${theme.accent}`
                  }}
                >
                  <div className="text-5xl mb-3">🔒</div>
                  <PremiumBadge variant="premium" label="Premium Feature" className="mb-2" />
                  <p className="mb-2" style={{ color: theme.textSecondary }}>
                    View your complete test history with detailed analytics
                  </p>
                  <PremiumBadge variant="promo" label="Get 1 Month Free - Limited Time" className="mb-6" />
                  <div>
                    <button
                      onClick={() => navigate('/premium')}
                      className="px-8 py-3 rounded-lg font-bold transition"
                      style={{ 
                        backgroundColor: theme.accent,
                        color: theme.bg 
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      Claim Free Premium
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div 
                    className="inline-block animate-spin rounded-full h-8 w-8 border-4"
                    style={{ 
                      borderColor: theme.border,
                      borderTopColor: theme.accent 
                    }}
                  ></div>
                </div>
              ) : testHistory.length === 0 ? (
                <div 
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: theme.bgSecondary }}
                >
                  <p style={{ color: theme.textMuted }}>
                    No test history yet. Complete a typing test to see your results here!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => navigate(`/test/${test.id}`)}
                      className="w-full p-4 rounded-lg transition-all duration-300 text-left cursor-pointer relative overflow-hidden"
                      style={{ 
                        backgroundColor: theme.bgSecondary,
                        border: `1px solid ${theme.border}`,
                        boxShadow: isPremium ? `0 2px 8px ${theme.accent}20` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 24px ${theme.accent}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = isPremium ? `0 2px 8px ${theme.accent}20` : 'none';
                      }}
                    >
                      {/* Premium shimmer effect */}
                      {isPremium && (
                        <div 
                          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${theme.accent}15, transparent)`,
                            animation: 'shimmer 2s infinite',
                          }}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        {/* Left: Main Stats */}
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

                          <div className="pl-4" style={{ borderLeft: `1px solid ${theme.border}` }}>
                            <div className="text-sm" style={{ color: theme.textSecondary }}>
                              <span className="font-medium">{test.language}</span>
                            </div>
                            <div className="text-xs" style={{ color: theme.textMuted }}>
                              {test.duration_seconds}s test
                            </div>
                          </div>
                        </div>

                        {/* Right: Additional Info */}
                        <div className="text-right">
                          <div className="text-xs mb-1" style={{ color: theme.textMuted }}>
                            {new Date(test.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>
                            {new Date(test.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {/* Stats badges */}
                          <div className="flex gap-2 mt-2 justify-end">
                            {test.consistency && (
                              <span 
                                className="text-xs px-2 py-1 rounded"
                                style={{ 
                                  backgroundColor: theme.buttonBg,
                                  color: theme.textSecondary 
                                }}
                              >
                                {Math.round(test.consistency)}% consistent
                              </span>
                            )}
                            {test.errors > 0 && (
                              <span 
                                className="text-xs px-2 py-1 rounded"
                                style={{ 
                                  backgroundColor: theme.incorrect + '20',
                                  color: theme.incorrect 
                                }}
                              >
                                {test.errors} errors
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-6">
                      <button
                        onClick={loadMoreTests}
                        disabled={loadingMore}
                        className="px-6 py-3 rounded-lg transition font-medium"
                        style={{
                          backgroundColor: theme.buttonBg,
                          color: theme.textSecondary,
                          border: `1px solid ${theme.border}`
                        }}
                        onMouseEnter={(e) => {
                          if (!loadingMore) {
                            e.target.style.backgroundColor = theme.buttonHover;
                            e.target.style.borderColor = theme.accent;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = theme.buttonBg;
                          e.target.style.borderColor = theme.border;
                        }}
                      >
                        {loadingMore ? (
                          <span className="flex items-center gap-2">
                            <div 
                              className="inline-block animate-spin rounded-full h-4 w-4 border-2"
                              style={{ 
                                borderColor: theme.border,
                                borderTopColor: theme.accent 
                              }}
                            ></div>
                            Loading...
                          </span>
                        ) : (
                          <span>Load Older Tests →</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Premium Section - Only show if user is not premium */}
          {user && !isPremium && (
            <div 
              className="p-6 rounded-lg mb-12"
              style={{ 
                backgroundColor: theme.accent + '15',
                border: `2px solid ${theme.accent}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold" style={{ color: theme.accent }}>
                      Get Premium FREE
                    </h2>
                    <PremiumBadge variant="promo" label="Limited Time" subtle />
                  </div>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    1 Month FREE! Unlock detailed analytics, unlimited history, and more!
                  </p>
                  <div className="mt-2">
                    <PremiumBadge variant="premium" label="Includes detailed analytics & history" subtle />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/premium')}
                  className="px-6 py-3 rounded-lg font-bold transition whitespace-nowrap"
                  style={{ 
                    backgroundColor: theme.accent,
                    color: theme.bg 
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Claim Now
                </button>
              </div>
            </div>
          )}

          {/* Premium Active Badge - Show if user is premium */}
          {user && isPremium && (
            <div 
              className="p-6 rounded-lg mb-12 text-center relative overflow-hidden"
              style={{ 
                backgroundColor: theme.correct + '15',
                border: `2px solid ${theme.correct}`,
                boxShadow: `0 8px 32px ${theme.correct}40`,
              }}
            >
              {/* Animated gradient background */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(45deg, ${theme.correct}, ${theme.accent}, ${theme.correct})`,
                  backgroundSize: '200% 200%',
                  animation: 'gradient 3s ease infinite',
                }}
              />
              
              <div className="relative z-10">
                <div className="text-4xl mb-2 animate-pulse">✨</div>
                <PremiumBadge variant="active" label="Premium Active" className="mb-3" />
                <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                  You have access to all premium features
                </p>
              </div>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-2 rounded-lg font-medium transition"
                style={{ 
                  backgroundColor: theme.buttonBg,
                  color: theme.textSecondary,
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
              </button>
            </div>
          )}

          {/* Test History Section */}
          {user && (
            <div 
              className="p-6 rounded-lg mb-12"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
                  Test History
                </h2>
                {!isPremium && (
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ 
                      backgroundColor: theme.accent + '20',
                      color: theme.accent 
                    }}
                  >
                    ⭐ PREMIUM FEATURE
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Logged in as
                  </p>
                  <p className="font-medium" style={{ color: theme.text }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
