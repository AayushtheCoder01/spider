import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';
import PremiumBadge from './PremiumBadge';

export default function Premium({ user }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        // Check if premium has expired
        const now = new Date();
        const isExpired = data?.premium_until && new Date(data.premium_until) < now;
        
        // If expired, automatically downgrade to free
        if (isExpired && data?.tier === 'premium') {
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

          if (!updateError) {
            // Update auth metadata
            await supabase.auth.updateUser({
              data: {
                tier: 'free',
                premium_until: null
              }
            });
            
            // Fetch updated profile
            const { data: updatedData } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            setUserProfile(updatedData);
          } else {
            console.error('Error updating expired profile:', updateError);
            setUserProfile(data);
          }
        } else {
          setUserProfile(data);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      const now = new Date();
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);

      // Get current profile to calculate totals
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('total_payments, payment_count')
        .eq('id', user.id)
        .single();

      // First month is FREE for all users
      const paymentAmount = 0.00;
      const newTotalPayments = (currentProfile?.total_payments || 0) + paymentAmount;
      const newPaymentCount = (currentProfile?.payment_count || 0) + 1;

      // Update user profile to premium
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          tier: 'premium',
          premium_since: currentProfile?.premium_since || now.toISOString(),
          premium_until: premiumUntil.toISOString(),
          subscription_started_at: currentProfile?.subscription_started_at || now.toISOString(),
          total_payments: newTotalPayments,
          payment_count: newPaymentCount,
          last_payment_date: now.toISOString(),
          last_payment_amount: paymentAmount,
          updated_at: now.toISOString()
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        alert('Failed to upgrade. Please try again.');
        return;
      }

      // Update user metadata in auth
      await supabase.auth.updateUser({
        data: {
          tier: 'premium',
          premium_until: premiumUntil.toISOString()
        }
      });

      alert('🎉 Welcome to Premium! Your subscription is now active.');
      fetchUserProfile();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your premium subscription?')) {
      return;
    }

    setProcessing(true);

    try {
      const now = new Date();

      // Update to free tier
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          tier: 'free',
          premium_until: null,
          subscription_cancelled_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error canceling:', profileError);
        alert('Failed to cancel. Please try again.');
        return;
      }

      // Update user metadata in auth
      await supabase.auth.updateUser({
        data: {
          tier: 'free',
          premium_until: null
        }
      });

      alert('Your subscription has been cancelled.');
      fetchUserProfile();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const isPremium = userProfile?.tier === 'premium';
  const premiumUntil = userProfile?.premium_until ? new Date(userProfile.premium_until) : null;
  const isExpired = premiumUntil && premiumUntil < new Date();

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
            Premium Subscription
          </h1>
          
          <div className="w-32"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Current Status */}
          {isPremium && !isExpired && (
            <div 
              className="mb-8 p-6 rounded-lg text-center"
              style={{ 
                backgroundColor: theme.correct + '20',
                border: `2px solid ${theme.correct}`
              }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.correct }}>
                ✓ Premium Active
              </h2>
              <p style={{ color: theme.textMuted }}>
                Active until{' '}
                <strong>
                  {premiumUntil?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </strong>
              </p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div 
              className="p-6 rounded-lg"
              style={{ 
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.border}`
              }}
            >
              <h3 className="text-xl font-bold mb-1" style={{ color: theme.text }}>
                Free
              </h3>
              <div className="text-3xl font-bold mb-4" style={{ color: theme.textMuted }}>
                $0
              </div>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  Unlimited tests
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  Basic stats
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  3 themes
                </li>
              </ul>

              {(!isPremium || isExpired) && (
                <div 
                  className="px-4 py-2 rounded-lg text-center font-medium"
                  style={{ 
                    backgroundColor: theme.accent + '20',
                    color: theme.accent 
                  }}
                >
                  Current Plan
                </div>
              )}
            </div>

            {/* Premium Tier */}
            <div 
              className="p-6 rounded-lg relative"
              style={{ 
                backgroundColor: theme.bgSecondary,
                border: `2px solid ${theme.accent}`,
                boxShadow: `0 4px 20px ${theme.accent}20`
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>
                  Premium
                </h3>
                <span 
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{ 
                    backgroundColor: theme.correct,
                    color: theme.bg 
                  }}
                >
                  FREE
                </span>
              </div>
              <div className="text-3xl font-bold mb-4" style={{ color: theme.accent }}>
                $0<span className="text-sm line-through opacity-50 ml-2" style={{ color: theme.textMuted }}>$9.99</span>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.text }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  <strong>📊 Analytics Dashboard</strong>
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.text }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  <strong>🏆 Performance Insights</strong>
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.text }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  <strong>📈 Progress Tracking</strong>
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.text }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  <strong>♾️ Unlimited History</strong>
                </li>
                <li className="flex items-center gap-2" style={{ color: theme.text }}>
                  <span style={{ color: theme.correct }}>✓</span>
                  <strong>🎨 9 Premium Themes</strong>
                </li>
              </ul>

              {!isPremium || isExpired ? (
                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="w-full px-6 py-3 rounded-lg font-bold transition-all duration-300 relative overflow-hidden"
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
                  <span className="relative z-10">
                    {processing ? 'Processing...' : '✨ Get 1 Month FREE'}
                  </span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div 
                    className="px-4 py-2 rounded-lg text-center font-medium"
                    style={{ 
                      backgroundColor: theme.correct + '20',
                      color: theme.correct 
                    }}
                  >
                    ✓ Active Plan
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={processing}
                    className="w-full px-6 py-2 rounded-lg font-medium transition"
                    style={{ 
                      backgroundColor: theme.incorrect + '20',
                      color: theme.incorrect,
                      border: `1px solid ${theme.incorrect}`
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    {processing ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Premium Perks Section */}
          {!isPremium && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.text }}>
                What You Get with Premium
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dashboard */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Analytics Dashboard
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    View daily and weekly stats with detailed performance metrics
                  </p>
                </div>

                {/* Insights */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Performance Insights
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Best scores, consistency tracking, and improvement trends
                  </p>
                </div>

                {/* History */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">♾️</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Unlimited History
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Access all your past tests with detailed breakdowns
                  </p>
                </div>

                {/* Themes */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">🎨</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Premium Themes
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    9 exclusive themes: Dracula, Monokai, Tokyo Night & more
                  </p>
                </div>

                {/* Language Stats */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">💻</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Language Analytics
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    Track your most practiced languages and progress per language
                  </p>
                </div>

                {/* Progress */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ 
                    backgroundColor: theme.bgSecondary,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: theme.text }}>
                    Progress Tracking
                  </h3>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>
                    See your improvement over time with trend analysis
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Details (for premium users) */}
          {isPremium && !isExpired && userProfile && (
            <div 
              className="p-8 rounded-lg mb-12"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
                Subscription Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                    Subscription Started
                  </p>
                  <p className="font-medium" style={{ color: theme.text }}>
                    {userProfile.subscription_started_at 
                      ? new Date(userProfile.subscription_started_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                    Next Billing Date
                  </p>
                  <p className="font-medium" style={{ color: theme.text }}>
                    {premiumUntil?.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                    Total Payments
                  </p>
                  <p className="font-medium" style={{ color: theme.accent }}>
                    ${userProfile.total_payments?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div>
                  <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                    Payment Count
                  </p>
                  <p className="font-medium" style={{ color: theme.text }}>
                    {userProfile.payment_count || 0} payment{userProfile.payment_count !== 1 ? 's' : ''}
                  </p>
                </div>

                {userProfile.last_payment_date && (
                  <>
                    <div>
                      <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                        Last Payment Date
                      </p>
                      <p className="font-medium" style={{ color: theme.text }}>
                        {new Date(userProfile.last_payment_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                        Last Payment Amount
                      </p>
                      <p className="font-medium" style={{ color: theme.correct }}>
                        ${userProfile.last_payment_amount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div 
            className="p-8 rounded-lg"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: theme.accent }}>
                  How does billing work?
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  You'll be charged $9.99 every month. You can cancel anytime and your premium features will remain active until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{ color: theme.accent }}>
                  What happens to my data if I cancel?
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  Your test history is never deleted. If you cancel, you'll still have access to your last 10 tests. Upgrade again anytime to access your full history.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2" style={{ color: theme.accent }}>
                  Can I get a refund?
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  Yes! If you're not satisfied within the first 7 days, contact us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
