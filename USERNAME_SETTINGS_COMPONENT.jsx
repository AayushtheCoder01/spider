// Add this component to your Settings.jsx file
// Place it in the settings page where you want users to set their username

import { useState } from 'react';
import { supabase } from '../supabase-client';

export function UsernameSettings({ user, theme, currentUsername }) {
  const [username, setUsername] = useState(currentUsername || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveUsername = async () => {
    // Validation
    if (!username || username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 50) {
      setError('Username must be less than 50 characters');
      return;
    }

    // Only allow alphanumeric and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (updateError) {
        if (updateError.code === '23505') {
          // Unique constraint violation
          setError('Username already taken. Please choose another.');
        } else {
          setError('Failed to save username: ' + updateError.message);
        }
      } else {
        setMessage('Username saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="p-6 rounded-lg mb-6"
      style={{ 
        backgroundColor: theme.bgSecondary,
        border: `1px solid ${theme.border}`
      }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: theme.accent }}>
        Username Settings
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm mb-2" style={{ color: theme.textMuted }}>
          Display Name (shown on leaderboard)
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          maxLength={50}
          className="w-full px-4 py-2 rounded font-mono"
          style={{
            backgroundColor: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.border}`
          }}
        />
        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
          3-50 characters. Letters, numbers, and underscores only.
        </p>
      </div>

      {error && (
        <div 
          className="mb-4 p-3 rounded"
          style={{ 
            backgroundColor: theme.incorrect + '20',
            color: theme.incorrect,
            border: `1px solid ${theme.incorrect}`
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div 
          className="mb-4 p-3 rounded"
          style={{ 
            backgroundColor: theme.correct + '20',
            color: theme.correct,
            border: `1px solid ${theme.correct}`
          }}
        >
          {message}
        </div>
      )}

      <button
        onClick={handleSaveUsername}
        disabled={saving}
        className="px-6 py-2 rounded font-medium transition"
        style={{
          backgroundColor: saving ? theme.border : theme.accent,
          color: theme.bg,
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? 'Saving...' : 'Save Username'}
      </button>
    </div>
  );
}

// ============================================
// HOW TO ADD TO SETTINGS.JSX:
// ============================================

/*
1. Import at the top of Settings.jsx:
   import { UsernameSettings } from './UsernameSettings';

2. Add state to track username in Settings component:
   const [username, setUsername] = useState('');

3. Fetch username in useEffect where you fetch user_profiles:
   const { data: profileData } = await supabase
     .from('user_profiles')
     .select('tier, premium_until, xp, username')  // Add username here
     .eq('id', user.id)
     .single();
   
   setUsername(profileData?.username || '');

4. Add the component in your JSX where you want it to appear:
   <UsernameSettings 
     user={user} 
     theme={theme} 
     currentUsername={username}
   />
*/
