import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getThemeClasses } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeConfig: typeof themes[Theme];
  themeClasses: ReturnType<typeof getThemeClasses>;
  availableThemes: Array<{ id: Theme; name: string; description: string }>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'default';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Apply CSS custom properties for the theme
    const root = document.documentElement;
    const config = themes[newTheme];
    
    root.style.setProperty('--theme-primary', config.colors.primary);
    root.style.setProperty('--theme-secondary', config.colors.secondary);
    root.style.setProperty('--theme-background', config.colors.background);
    root.style.setProperty('--theme-foreground', config.colors.foreground);
    root.style.setProperty('--theme-card', config.colors.card);
    root.style.setProperty('--theme-border', config.colors.border);
    root.style.setProperty('--theme-muted', config.colors.muted);
  };

  useEffect(() => {
    // Apply theme on mount
    setTheme(theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeConfig: themes[theme],
    themeClasses: getThemeClasses(theme),
    availableThemes: Object.entries(themes).map(([id, config]) => ({
      id: id as Theme,
      name: config.name,
      description: config.description,
    })),
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className={`min-h-screen transition-all duration-500`}
        style={{
          backgroundColor: themes[theme].colors.background,
          color: themes[theme].colors.foreground,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}