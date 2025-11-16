import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'base' | 'lg' | 'xl';
  setFontSize: (size: 'base' | 'lg' | 'xl') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('base');

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') as 'base' | 'lg' | 'xl' || 'base';

    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);

    // Apply initial theme
    updateTheme(savedHighContrast);
    updateFontSize(savedFontSize);
  }, []);

  const updateTheme = (isHighContrast: boolean) => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.setAttribute('data-theme', 'contrast');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  const updateFontSize = (size: 'base' | 'lg' | 'xl') => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', size);
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    updateTheme(newValue);
    localStorage.setItem('highContrast', String(newValue));
  };

  const handleSetFontSize = (size: 'base' | 'lg' | 'xl') => {
    setFontSize(size);
    updateFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const value: ThemeContextType = {
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize: handleSetFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
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