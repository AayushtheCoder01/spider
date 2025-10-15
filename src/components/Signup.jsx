import { useState } from 'react';
import { supabase } from '../supabase-client';
import { useTheme } from '../contexts/ThemeContext';

export default function Signup({ onToggleForm }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Check username availability
  const checkUsernameAvailability = async (usernameToCheck) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Validate format
    if (!/^[a-zA-Z0-9_]+$/.test(usernameToCheck)) {
      setUsernameAvailable(false);
      setErrors({ ...errors, username: 'Only letters, numbers, and underscores allowed' });
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', usernameToCheck)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(!data);
        if (data) {
          setErrors({ ...errors, username: 'Username already taken' });
        } else {
          const newErrors = { ...errors };
          delete newErrors.username;
          setErrors(newErrors);
        }
      }
    } catch (err) {
      console.error('Username check error:', err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    
    // Basic validation
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setErrors({ username: 'Username must be 3-50 characters' });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrors({ username: 'Username can only contain letters, numbers, and underscores' });
      return;
    }

    if (usernameAvailable === false) {
      setErrors({ username: 'Username already taken' });
      return;
    }
    
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    
    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirmed: true,
            tier: 'free',
            premium_until: null
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          setErrors({ general: 'This email is already registered. Please login instead.' });
        } else {
          setErrors({ general: error.message });
        }
      } else if (data?.user) {
        // Create user profile with username
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: email.trim().toLowerCase(),
              username: username.trim(),
              tier: 'free',
              xp: 0
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (profileErr) {
          console.error('Profile creation error:', profileErr);
        }

        setSuccess('Account created successfully! Redirecting to login...');
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onToggleForm();
        }, 1500);
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setErrors({ general: 'Unable to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        backgroundColor: theme.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
      }}
    >
      {/* Left Side - Branding/Info */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12"
        style={{
          backgroundColor: theme.bgSecondary,
          borderRight: `2px solid ${theme.border}`
        }}
      >
        <div className="max-w-lg">
          <h1 className="text-6xl font-bold font-mono mb-6" style={{ color: theme.accent }}>
            🕷️ SpiderType
          </h1>
          <p className="text-2xl font-mono mb-8" style={{ color: theme.text }}>
            $ ./create-account --new-user
          </p>
          <div className="space-y-4 font-mono text-lg" style={{ color: theme.textMuted }}>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Free forever account</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Track unlimited tests</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Level up with XP system</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Premium features available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="max-w-md w-full p-0 rounded-lg overflow-hidden"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `2px solid ${theme.border}`,
            boxShadow: `0 8px 32px ${theme.accent}30`
          }}
        >
          {/* Terminal Header Bar */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{ 
              backgroundColor: theme.bg,
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
                spidertype@auth
              </span>
              <span className="text-xs" style={{ color: theme.textMuted }}>:</span>
              <span className="text-xs font-mono" style={{ color: theme.correct }}>~/signup</span>
              <span className="text-xs" style={{ color: theme.textMuted }}>$</span>
            </div>
          </div>

          {/* Terminal Prompt */}
          <div className="mx-8 mt-6 px-4 py-3 rounded-lg font-mono text-sm" style={{ 
            backgroundColor: theme.bg,
            border: `1px solid ${theme.border}`
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: theme.accent }}>$</span>
              <span style={{ color: theme.text }}>./create-account --new-user</span>
            </div>
            <div className="text-xs" style={{ color: theme.textMuted }}>
              # Register a new SpiderType account
            </div>
          </div>

          <div className="text-center mx-8">
            <h2 className="text-3xl font-bold font-mono" style={{ color: theme.accent }}>
              $ signup
            </h2>
            <p className="mt-2 text-sm font-mono" style={{ color: theme.textMuted }}>
              // Create your developer account
            </p>
          </div>
          
          <form className="space-y-5 mx-8 mb-8" onSubmit={handleSubmit}>
          {errors.general && (
            <div 
              className="px-4 py-3 rounded-lg text-sm font-mono"
              style={{
                backgroundColor: theme.incorrect + '20',
                border: `1px solid ${theme.incorrect}`,
                color: theme.incorrect
              }}
            >
              <div className="flex items-center gap-2">
                <span>✗</span>
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {success && (
            <div 
              className="px-4 py-3 rounded-lg text-sm font-mono"
              style={{
                backgroundColor: theme.correct + '20',
                border: `1px solid ${theme.correct}`,
                color: theme.correct
              }}
            >
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>{success}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-mono font-medium mb-2" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>$</span> --email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className="appearance-none relative block w-full px-4 py-3 rounded-lg focus:outline-none transition font-mono"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${errors.email ? theme.incorrect : theme.border}`,
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = errors.email ? theme.incorrect : theme.border}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm font-mono flex items-center gap-2" style={{ color: theme.incorrect }}>
                  <span>✗</span>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-mono font-medium mb-2" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>$</span> --username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUsername(value);
                    if (errors.username) {
                      const newErrors = { ...errors };
                      delete newErrors.username;
                      setErrors(newErrors);
                    }
                    // Debounce username check
                    if (value.length >= 3) {
                      setTimeout(() => checkUsernameAvailability(value), 500);
                    } else {
                      setUsernameAvailable(null);
                    }
                  }}
                  className="appearance-none relative block w-full px-4 py-3 rounded-lg focus:outline-none transition font-mono"
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    border: `2px solid ${errors.username ? theme.incorrect : usernameAvailable === true ? theme.correct : theme.border}`,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = theme.accent}
                  onBlur={(e) => e.target.style.borderColor = errors.username ? theme.incorrect : usernameAvailable === true ? theme.correct : theme.border}
                  placeholder="your_username"
                  maxLength={50}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2" style={{ 
                      borderColor: theme.border,
                      borderTopColor: theme.accent 
                    }}></div>
                  </div>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <div className="absolute right-3 top-3 text-lg" style={{ color: theme.correct }}>
                    ✓
                  </div>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <div className="absolute right-3 top-3 text-lg" style={{ color: theme.incorrect }}>
                    ✗
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="mt-2 text-sm font-mono flex items-center gap-2" style={{ color: theme.incorrect }}>
                  <span>✗</span>
                  <span>{errors.username}</span>
                </p>
              )}
              {!errors.username && usernameAvailable === true && (
                <p className="mt-2 text-sm font-mono flex items-center gap-2" style={{ color: theme.correct }}>
                  <span>✓</span>
                  <span>Username available!</span>
                </p>
              )}
              <p className="mt-2 text-xs font-mono" style={{ color: theme.textMuted }}>
                // 3-50 chars, letters, numbers, underscores only
              </p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-mono font-medium mb-2" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>$</span> --password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                className="appearance-none relative block w-full px-4 py-3 rounded-lg focus:outline-none transition font-mono"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${errors.password ? theme.incorrect : theme.border}`,
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = errors.password ? theme.incorrect : theme.border}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm font-mono flex items-center gap-2" style={{ color: theme.incorrect }}>
                  <span>✗</span>
                  <span>{errors.password}</span>
                </p>
              )}
              <p className="mt-2 text-xs font-mono" style={{ color: theme.textMuted }}>
                // Min 6 characters required
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-mono font-medium mb-2" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>$</span> --confirm-password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                className="appearance-none relative block w-full px-4 py-3 rounded-lg focus:outline-none transition font-mono"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  border: `2px solid ${errors.confirmPassword ? theme.incorrect : theme.border}`,
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? theme.incorrect : theme.border}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm font-mono flex items-center gap-2" style={{ color: theme.incorrect }}>
                  <span>✗</span>
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-mono font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg,
                border: `2px solid ${theme.accent}`,
                boxShadow: `0 4px 12px ${theme.accent}40`
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = `0 6px 16px ${theme.accent}60`)}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = `0 4px 12px ${theme.accent}40`)}
            >
              <span>$</span>
              <span>{loading ? 'creating account...' : 'execute signup'}</span>
              {!loading && <span>→</span>}
            </button>
          </div>

          <div 
            className="text-center pt-4 mt-4"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <p className="text-sm font-mono" style={{ color: theme.textMuted }}>
              <span>// Already registered? </span>
              <button
                type="button"
                onClick={onToggleForm}
                className="font-bold transition"
                style={{ color: theme.accent }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                $ login
              </button>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
