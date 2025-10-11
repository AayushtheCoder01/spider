import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabase-client';
import Login from './components/Login';
import Signup from './components/Signup';
import TypingTest from './components/TypingTest';
import Settings from './components/Settings';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(null); // null = main app, 'login' or 'signup'

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuth(null); // Close auth modal when logged in
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-16 w-16 border-4"
            style={{ 
              borderColor: theme.border,
              borderTopColor: theme.accent 
            }}
          ></div>
          <p 
            className="mt-4 text-lg font-medium"
            style={{ color: theme.textSecondary }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show auth modals
  if (showAuth === 'login') {
    return (
      <div className="relative">
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAuth(null)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowAuth(null)}
              className="absolute -top-4 -right-4 bg-gray-800 text-gray-300 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10"
            >
              ✕
            </button>
            <Login 
              onToggleForm={() => setShowAuth('signup')} 
              onLoginSuccess={setUser}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showAuth === 'signup') {
    return (
      <div className="relative">
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowAuth(null)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowAuth(null)}
              className="absolute -top-4 -right-4 bg-gray-800 text-gray-300 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 z-10"
            >
              ✕
            </button>
            <Signup onToggleForm={() => setShowAuth('login')} />
          </div>
        </div>
      </div>
    );
  }

  // Main app with routing
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="relative">
              {/* Top right auth buttons */}
              <div className="absolute top-4 right-8 z-10 flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg text-sm transition"
                      style={{
                        backgroundColor: theme.incorrect,
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAuth('login')}
                      className="px-4 py-2 rounded-lg text-sm transition"
                      style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.text
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowAuth('signup')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition"
                      style={{
                        backgroundColor: theme.accent,
                        color: theme.bg
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme.accentHover}
                      onMouseLeave={(e) => e.target.style.backgroundColor = theme.accent}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              <TypingTest user={user} />
            </div>
          } 
        />
        <Route path="/settings" element={<Settings user={user} />} />
      </Routes>
    </>
  );
}

export default App;
