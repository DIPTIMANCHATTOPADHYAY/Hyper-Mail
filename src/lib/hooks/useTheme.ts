import { useState, useEffect } from 'react';
import { Theme } from '@/types';
import { COOKIE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = storage.get(COOKIE_KEYS.THEME) as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    storage.set(COOKIE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}