import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'sspro-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemePreference = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDarkMode, theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    isDarkMode,
    toggleTheme,
  };
};
