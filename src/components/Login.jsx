import { useState } from 'react';
import { supabase } from '../supabase-client';
import { useTheme } from '../contexts/ThemeContext';

export default function Login({ onToggleForm, onLoginSuccess }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });
      
      if (error) {
        console.error('Login error:', error);
        // Show user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please verify your email address first.' });
        } else {
          setErrors({ general: error.message });
        }
      } else if (data?.user) {
        // Clear form and notify success
        setEmail('');
        setPassword('');
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setErrors({ general: 'Unable to login. Please check your connection and try again.' });
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
            $ ./practice --typing --speed
          </p>
          <div className="space-y-4 font-mono text-lg" style={{ color: theme.textMuted }}>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Track your WPM progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Practice with code snippets</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Earn XP and level up</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: theme.correct }}>✓</span>
              <span>Terminal-style interface</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              <span className="text-xs font-mono" style={{ color: theme.correct }}>~/login</span>
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
              <span style={{ color: theme.text }}>./authenticate --mode=login</span>
            </div>
            <div className="text-xs" style={{ color: theme.textMuted }}>
              # Sign in to your SpiderType account
            </div>
          </div>

          <div className="text-center mx-8">
            <h2 className="text-3xl font-bold font-mono" style={{ color: theme.accent }}>
              $ login
            </h2>
            <p className="mt-2 text-sm font-mono" style={{ color: theme.textMuted }}>
              // Enter your credentials
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
              <label htmlFor="password" className="block text-sm font-mono font-medium mb-2" style={{ color: theme.textMuted }}>
                <span style={{ color: theme.accent }}>$</span> --password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
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
              <span>{loading ? 'authenticating...' : 'execute login'}</span>
              {!loading && <span>→</span>}
            </button>
          </div>

          <div 
            className="text-center pt-4 mt-4"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <p className="text-sm font-mono" style={{ color: theme.textMuted }}>
              <span>// No account? </span>
              <button
                type="button"
                onClick={onToggleForm}
                className="font-bold transition"
                style={{ color: theme.accent }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                $ signup
              </button>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
