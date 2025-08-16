import React, { useEffect, useState, createContext, useContext } from 'react';
// Define theme types
type ThemeType = 'light' | 'dark' | 'cosmic' | 'system';
type ColorScheme = 'indigo' | 'blue' | 'green' | 'purple' | 'amber';
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  chartColors: string[];
  glassOpacity: string;
  buttonStyle: string;
}
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
  themeColors: ThemeColors;
}
// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  colorScheme: 'indigo',
  setColorScheme: () => {},
  themeColors: {
    primary: 'from-indigo-500 to-purple-600',
    secondary: 'from-amber-500 to-yellow-600',
    accent: 'bg-indigo-500',
    background: 'bg-gray-900',
    cardBackground: 'bg-gray-800/50',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    chartColors: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
    glassOpacity: 'bg-white/5',
    buttonStyle: 'bg-gradient-to-r'
  }
});
// Get theme-specific colors based on theme and color scheme
const getThemeColors = (theme: ThemeType, colorScheme: ColorScheme): ThemeColors => {
  // Base color schemes
  const colorSchemes: Record<ColorScheme, Record<string, string>> = {
    indigo: {
      primaryGradient: 'from-indigo-500 to-purple-600',
      secondaryGradient: 'from-amber-500 to-yellow-600',
      accentColor: 'bg-indigo-500',
      primarySolid: 'bg-indigo-500',
      primaryLight: 'bg-indigo-300',
      primaryDark: 'bg-indigo-700',
      primaryPastel: 'bg-indigo-200'
    },
    blue: {
      primaryGradient: 'from-blue-500 to-cyan-600',
      secondaryGradient: 'from-amber-500 to-yellow-600',
      accentColor: 'bg-blue-500',
      primarySolid: 'bg-blue-500',
      primaryLight: 'bg-blue-300',
      primaryDark: 'bg-blue-700',
      primaryPastel: 'bg-blue-200'
    },
    green: {
      primaryGradient: 'from-emerald-500 to-green-600',
      secondaryGradient: 'from-blue-500 to-indigo-600',
      accentColor: 'bg-emerald-500',
      primarySolid: 'bg-emerald-500',
      primaryLight: 'bg-emerald-300',
      primaryDark: 'bg-emerald-700',
      primaryPastel: 'bg-emerald-200'
    },
    purple: {
      primaryGradient: 'from-purple-500 to-violet-600',
      secondaryGradient: 'from-pink-500 to-rose-600',
      accentColor: 'bg-purple-500',
      primarySolid: 'bg-purple-500',
      primaryLight: 'bg-purple-300',
      primaryDark: 'bg-purple-700',
      primaryPastel: 'bg-purple-200'
    },
    amber: {
      primaryGradient: 'from-amber-500 to-orange-600',
      secondaryGradient: 'from-blue-500 to-indigo-600',
      accentColor: 'bg-amber-500',
      primarySolid: 'bg-amber-500',
      primaryLight: 'bg-amber-300',
      primaryDark: 'bg-amber-700',
      primaryPastel: 'bg-amber-200'
    }
  };
  // Chart colors for each scheme
  const chartColorSets: Record<ColorScheme, string[]> = {
    indigo: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
    blue: ['#3b82f6', '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    green: ['#10b981', '#059669', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'],
    purple: ['#8b5cf6', '#a855f7', '#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'],
    amber: ['#f59e0b', '#f97316', '#3b82f6', '#6366f1', '#10b981', '#ef4444', '#8b5cf6']
  };
  const scheme = colorSchemes[colorScheme];
  const chartColors = chartColorSets[colorScheme];
  // Theme-specific styles
  switch (theme) {
    case 'light':
      return {
        primary: scheme.primaryGradient,
        secondary: scheme.secondaryGradient,
        accent: scheme.accentColor,
        background: 'bg-gray-50',
        cardBackground: 'bg-white/80',
        text: 'text-gray-800',
        textSecondary: 'text-gray-600',
        chartColors,
        glassOpacity: 'bg-black/5',
        buttonStyle: 'bg-gradient-to-r'
      };
    case 'cosmic':
      return {
        primary: scheme.primaryGradient,
        secondary: scheme.secondaryGradient,
        accent: scheme.accentColor,
        background: 'bg-black',
        cardBackground: 'bg-gray-900/30',
        text: 'text-white',
        textSecondary: 'text-gray-300',
        chartColors,
        glassOpacity: 'bg-white/10',
        buttonStyle: 'bg-gradient-to-r shadow-glow'
      };
    case 'dark':
    default:
      return {
        primary: scheme.primaryGradient,
        secondary: scheme.secondaryGradient,
        accent: scheme.accentColor,
        background: 'bg-gray-900',
        cardBackground: 'bg-gray-800/50',
        text: 'text-white',
        textSecondary: 'text-gray-400',
        chartColors,
        glassOpacity: 'bg-white/5',
        buttonStyle: 'bg-gradient-to-r'
      };
  }
};
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  // Get initial theme from local storage or default to 'dark'
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'dark';
  });
  // Get initial color scheme from local storage or default to 'indigo'
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme;
    return savedColorScheme || 'indigo';
  });
  // Get current theme colors
  const themeColors = getThemeColors(theme, colorScheme);
  // Set theme and save to local storage
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    // Update CSS variables for the theme
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.style.setProperty('--background-start', '#f9fafb');
      root.style.setProperty('--background-end', '#f3f4f6');
      root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.03)');
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.1)');
    } else if (newTheme === 'cosmic') {
      root.style.setProperty('--background-start', '#000000');
      root.style.setProperty('--background-end', '#0f0f1a');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Default dark theme
      root.style.setProperty('--background-start', '#1a1a2e');
      root.style.setProperty('--background-end', '#16213e');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--glass-shadow', 'rgba(0, 0, 0, 0.2)');
    }
  };
  // Set color scheme and save to local storage
  const setColorScheme = (newColorScheme: ColorScheme) => {
    setColorSchemeState(newColorScheme);
    localStorage.setItem('colorScheme', newColorScheme);
  };
  // Apply theme to document on theme change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
      root.classList.toggle('light', systemTheme === 'light');
      root.classList.toggle('cosmic', false);
    } else {
      root.classList.toggle('dark', theme === 'dark');
      root.classList.toggle('light', theme === 'light');
      root.classList.toggle('cosmic', theme === 'cosmic');
    }
    // Update CSS variables for the theme
    setTheme(theme);
    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        root.classList.toggle('dark', mediaQuery.matches);
        root.classList.toggle('light', !mediaQuery.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  return <ThemeContext.Provider value={{
    theme,
    setTheme,
    colorScheme,
    setColorScheme,
    themeColors
  }}>
      {children}
    </ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);