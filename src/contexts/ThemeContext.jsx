import { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  dark: {
    name: 'Dark',
    free: true,
    bg: '#1a1a1a',
    bgSecondary: '#2a2a2a',
    text: '#d1d5db',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    accent: '#fbbf24',
    accentHover: '#f59e0b',
    correct: '#34d399',
    incorrect: '#ef4444',
    border: '#374151',
    buttonBg: '#374151',
    buttonHover: '#4b5563',
  },
  light: {
    name: 'Light',
    free: true,
    bg: '#f9fafb',
    bgSecondary: '#ffffff',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    correct: '#10b981',
    incorrect: '#ef4444',
    border: '#e5e7eb',
    buttonBg: '#e5e7eb',
    buttonHover: '#d1d5db',
  },
  nord: {
    name: 'Nord',
    free: true,
    bg: '#2e3440',
    bgSecondary: '#3b4252',
    text: '#eceff4',
    textSecondary: '#d8dee9',
    textMuted: '#4c566a',
    accent: '#88c0d0',
    accentHover: '#81a1c1',
    correct: '#a3be8c',
    incorrect: '#bf616a',
    border: '#4c566a',
    buttonBg: '#4c566a',
    buttonHover: '#5e81ac',
  },
  dracula: {
    name: 'Dracula',
    premium: true,
    bg: '#282a36',
    bgSecondary: '#44475a',
    text: '#f8f8f2',
    textSecondary: '#f8f8f2',
    textMuted: '#6272a4',
    accent: '#bd93f9',
    accentHover: '#ff79c6',
    correct: '#50fa7b',
    incorrect: '#ff5555',
    border: '#6272a4',
    buttonBg: '#44475a',
    buttonHover: '#6272a4',
  },
  monokai: {
    name: 'Monokai',
    premium: true,
    bg: '#272822',
    bgSecondary: '#3e3d32',
    text: '#f8f8f2',
    textSecondary: '#f8f8f2',
    textMuted: '#75715e',
    accent: '#66d9ef',
    accentHover: '#a6e22e',
    correct: '#a6e22e',
    incorrect: '#f92672',
    border: '#75715e',
    buttonBg: '#3e3d32',
    buttonHover: '#49483e',
  },
  gruvbox: {
    name: 'Gruvbox',
    premium: true,
    bg: '#282828',
    bgSecondary: '#3c3836',
    text: '#ebdbb2',
    textSecondary: '#d5c4a1',
    textMuted: '#928374',
    accent: '#fabd2f',
    accentHover: '#fe8019',
    correct: '#b8bb26',
    incorrect: '#fb4934',
    border: '#504945',
    buttonBg: '#3c3836',
    buttonHover: '#504945',
  },
  solarized: {
    name: 'Solarized Dark',
    premium: true,
    bg: '#002b36',
    bgSecondary: '#073642',
    text: '#839496',
    textSecondary: '#93a1a1',
    textMuted: '#586e75',
    accent: '#268bd2',
    accentHover: '#2aa198',
    correct: '#859900',
    incorrect: '#dc322f',
    border: '#073642',
    buttonBg: '#073642',
    buttonHover: '#586e75',
  },
  tokyo: {
    name: 'Tokyo Night',
    premium: true,
    bg: '#1a1b26',
    bgSecondary: '#24283b',
    text: '#c0caf5',
    textSecondary: '#a9b1d6',
    textMuted: '#565f89',
    accent: '#7aa2f7',
    accentHover: '#bb9af7',
    correct: '#9ece6a',
    incorrect: '#f7768e',
    border: '#414868',
    buttonBg: '#24283b',
    buttonHover: '#414868',
  },
  catppuccin: {
    name: 'Catppuccin',
    premium: true,
    bg: '#1e1e2e',
    bgSecondary: '#313244',
    text: '#cdd6f4',
    textSecondary: '#bac2de',
    textMuted: '#6c7086',
    accent: '#89b4fa',
    accentHover: '#cba6f7',
    correct: '#a6e3a1',
    incorrect: '#f38ba8',
    border: '#45475a',
    buttonBg: '#313244',
    buttonHover: '#45475a',
  },
  ayu: {
    name: 'Ayu Dark',
    premium: true,
    bg: '#0a0e14',
    bgSecondary: '#0d1017',
    text: '#b3b1ad',
    textSecondary: '#b3b1ad',
    textMuted: '#4d5566',
    accent: '#ffb454',
    accentHover: '#ff8f40',
    correct: '#c2d94c',
    incorrect: '#f07178',
    border: '#1f2430',
    buttonBg: '#0d1017',
    buttonHover: '#1f2430',
  },
  rose: {
    name: 'Rosé Pine',
    premium: true,
    bg: '#191724',
    bgSecondary: '#1f1d2e',
    text: '#e0def4',
    textSecondary: '#e0def4',
    textMuted: '#6e6a86',
    accent: '#c4a7e7',
    accentHover: '#ebbcba',
    correct: '#9ccfd8',
    incorrect: '#eb6f92',
    border: '#26233a',
    buttonBg: '#1f1d2e',
    buttonHover: '#26233a',
  },
  palenight: {
    name: 'Palenight',
    premium: true,
    bg: '#292d3e',
    bgSecondary: '#32364a',
    text: '#a6accd',
    textSecondary: '#959dcb',
    textMuted: '#676e95',
    accent: '#82aaff',
    accentHover: '#c792ea',
    correct: '#c3e88d',
    incorrect: '#f07178',
    border: '#3a3f58',
    buttonBg: '#32364a',
    buttonHover: '#3a3f58',
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const theme = themes[currentTheme];

  const value = {
    theme,
    themeName: currentTheme,
    themes,
    setTheme: setCurrentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
