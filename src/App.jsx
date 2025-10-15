import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabase-client';
import Login from './components/Login';
import Signup from './components/Signup';
import TypingTest from './components/TypingTest';
import Settings from './components/Settings';
import TestDetail from './components/TestDetail';
import Premium from './components/Premium';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
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
      // Clear all test data from localStorage
      localStorage.removeItem('typingResults');
      localStorage.removeItem('typingDuration');
      localStorage.removeItem('typingLanguage');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      setUser(null);
      
      console.log('Logged out and cleared all test data');
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
            <TypingTest 
              user={user} 
              onLogout={handleLogout}
              onShowLogin={() => setShowAuth('login')}
              onShowSignup={() => setShowAuth('signup')}
            />
          } 
        />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="/test/:testId" element={<TestDetail user={user} />} />
        <Route path="/premium" element={<Premium user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/leaderboard" element={<Leaderboard user={user} />} />
      </Routes>
    </>
  );
}

export default App;
