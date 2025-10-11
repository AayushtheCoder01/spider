import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Settings({ user }) {
  const { theme, themeName, themes, setTheme } = useTheme();
  const navigate = useNavigate();

  const themesList = Object.entries(themes);

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
              {themesList.map(([key, themeData]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className="relative p-6 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: themeData.bgSecondary,
                    border: `2px solid ${themeName === key ? theme.accent : theme.border}`,
                    transform: themeName === key ? 'scale(1.02)' : 'scale(1)',
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
              ))}
            </div>
          </div>

          {/* Account Section */}
          {user && (
            <div 
              className="p-6 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
                Account
              </h2>
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

          {/* Info Section */}
          <div className="mt-12 text-center">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              More settings coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
