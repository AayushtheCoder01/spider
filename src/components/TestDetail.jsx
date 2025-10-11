import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';
import PremiumBadge from './PremiumBadge';

export default function TestDetail({ user }) {
  const { testId } = useParams();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchTestDetail = async () => {
      if (!user) {
        navigate('/settings');
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

        // Fetch test data
        const { data, error } = await supabase
          .from('typing_results')
          .select('*')
          .eq('id', testId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching test:', error);
          navigate('/settings');
        } else {
          setTestData(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        navigate('/settings');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetail();
  }, [testId, user, navigate]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div 
          className="inline-block animate-spin rounded-full h-16 w-16 border-4"
          style={{ 
            borderColor: theme.border,
            borderTopColor: theme.accent 
          }}
        ></div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test not found</h2>
          <button
            onClick={() => navigate('/settings')}
            className="px-6 py-2 rounded-lg"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 transition"
            style={{ color: theme.textSecondary }}
            onMouseEnter={(e) => e.target.style.color = theme.accent}
            onMouseLeave={(e) => e.target.style.color = theme.textSecondary}
          >
            <span className="text-xl">←</span>
            <span className="text-sm">Back to Settings</span>
          </button>
          
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Test Details
          </h1>
          
          <div className="w-32"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Premium Banner - Always show for non-premium users */}
          {!isPremium && (
            <div 
              className="mb-8 p-8 rounded-lg text-center"
              style={{ 
                backgroundColor: theme.accent + '10',
                border: `2px solid ${theme.accent}`
              }}
            >
              <div className="text-5xl mb-4">🔒</div>
              <PremiumBadge variant="premium" label="Premium Feature" className="mb-3" />
              <p className="mb-2" style={{ color: theme.textSecondary }}>
                Access detailed test analytics, performance graphs, and unlimited history
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
          )}

          {/* Premium Active Badge - Only for premium users */}
          {isPremium && (
            <div className="mb-8 text-center relative">
              <div 
                className="inline-block relative"
                style={{
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                <div 
                  className="absolute inset-0 blur-xl opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${theme.correct}, transparent)`,
                  }}
                />
                <PremiumBadge variant="active" label="Premium Active" />
              </div>
            </div>
          )}

          {/* Content - Only show for premium users */}
          {isPremium && (
            <>
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div 
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: theme.accent }}>
                {Math.round(testData.wpm)}
              </div>
              <div className="text-sm" style={{ color: theme.textMuted }}>
                Words Per Minute
              </div>
            </div>

            <div 
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: theme.correct }}>
                {Math.round(testData.accuracy)}%
              </div>
              <div className="text-sm" style={{ color: theme.textMuted }}>
                Accuracy
              </div>
            </div>

            <div 
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: theme.accent }}>
                {Math.round(testData.raw_wpm)}
              </div>
              <div className="text-sm" style={{ color: theme.textMuted }}>
                Raw WPM
              </div>
            </div>

            <div 
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: testData.consistency ? theme.correct : theme.textMuted }}>
                {testData.consistency ? Math.round(testData.consistency) : 0}%
              </div>
              <div className="text-sm" style={{ color: theme.textMuted }}>
                Consistency
              </div>
            </div>
          </div>

          {/* WPM Graph */}
          {testData.wpm_history && testData.wpm_history.length > 1 && (
            <div 
              className="p-6 rounded-lg mb-8"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
                Performance Graph
              </h2>
              <div style={{ height: '240px', padding: '20px 0' }}>
                <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="lineGradientDetail" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: theme.accent, stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: theme.accent, stopOpacity: 0.6 }} />
                    </linearGradient>
                    <linearGradient id="areaGradientDetail" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: theme.accent, stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: theme.accent, stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1="0"
                      y1={i * 40}
                      x2="800"
                      y2={i * 40}
                      stroke={theme.border}
                      strokeWidth="1"
                      opacity="0.2"
                    />
                  ))}
                  
                  {/* Vertical time markers */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const x = ratio * 800;
                    return (
                      <g key={`marker-${idx}`}>
                        <line
                          x1={x}
                          y1="0"
                          x2={x}
                          y2="200"
                          stroke={theme.border}
                          strokeWidth="1"
                          opacity="0.15"
                          strokeDasharray="4,4"
                        />
                        <text
                          x={x}
                          y="195"
                          fill={theme.textMuted}
                          fontSize="10"
                          textAnchor="middle"
                          opacity="0.6"
                        >
                          {Math.round(ratio * testData.duration_seconds)}s
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Area fill */}
                  <polygon
                    points={
                      testData.wpm_history.map((w, i) => {
                        const x = (i / (testData.wpm_history.length - 1)) * 800;
                        const maxWpm = Math.max(...testData.wpm_history, 50);
                        const y = 180 - ((w / maxWpm) * 160);
                        return `${x},${y}`;
                      }).join(' ') + ` 800,180 0,180`
                    }
                    fill="url(#areaGradientDetail)"
                  />
                  
                  {/* WPM Line */}
                  <polyline
                    points={testData.wpm_history.map((w, i) => {
                      const x = (i / (testData.wpm_history.length - 1)) * 800;
                      const maxWpm = Math.max(...testData.wpm_history, 50);
                      const y = 180 - ((w / maxWpm) * 160);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#lineGradientDetail)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {testData.wpm_history.map((w, i) => {
                    const x = (i / (testData.wpm_history.length - 1)) * 800;
                    const maxWpm = Math.max(...testData.wpm_history, 50);
                    const y = 180 - ((w / maxWpm) * 160);
                    return (
                      <circle
                        key={`point-${i}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={theme.accent}
                        opacity="0.8"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Test Information */}
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
                Test Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Language:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.language}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Duration:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.duration_seconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Time Remaining:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.time_remaining}s</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Date:</span>
                  <span className="font-medium" style={{ color: theme.text }}>
                    {new Date(testData.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Time:</span>
                  <span className="font-medium" style={{ color: theme.text }}>
                    {new Date(testData.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Character Statistics */}
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
                Character Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Correct Characters:</span>
                  <span className="font-medium" style={{ color: theme.correct }}>{testData.correct_chars}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Incorrect Characters:</span>
                  <span className="font-medium" style={{ color: theme.incorrect }}>{testData.incorrect_chars}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Total Characters:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.chars_total || (testData.correct_chars + testData.incorrect_chars)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Errors:</span>
                  <span className="font-medium" style={{ color: theme.incorrect }}>{testData.errors}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Error Rate:</span>
                  <span className="font-medium" style={{ color: theme.text }}>
                    {testData.chars_total ? ((testData.errors / testData.chars_total) * 100).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Information */}
          {testData.device_meta && (
            <div 
              className="p-6 rounded-lg mb-8"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
                Device Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Platform:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.device_meta.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>Browser Language:</span>
                  <span className="font-medium" style={{ color: theme.text }}>{testData.device_meta.language}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span style={{ color: theme.textMuted }}>User Agent:</span>
                  <span className="font-medium text-right max-w-md text-xs" style={{ color: theme.text }}>
                    {testData.device_meta.userAgent}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Raw Data (JSON) */}
          <div 
            className="p-6 rounded-lg"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
              Raw Data (JSON)
            </h2>
            <pre 
              className="text-xs overflow-x-auto p-4 rounded"
              style={{ 
                backgroundColor: theme.bg,
                color: theme.textSecondary 
              }}
            >
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
