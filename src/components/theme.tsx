'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme as useNextTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
    isDark: mounted ? resolvedTheme === 'dark' : false,
    isLight: mounted ? resolvedTheme === 'light' : false,
    isSystem: theme === 'system',
  };
}

/** Theme toggle component using a button that cycles through themes. */
export function ThemeButton() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant='outline' size='sm'>
        <Sun className='size-4' />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button variant='outline' size='sm' onClick={cycleTheme}>
      {theme === 'light' && <Sun className='size-4' />}
      {theme === 'dark' && <Moon className='size-4' />}
      {theme === 'system' && <Monitor className='size-4' />}
    </Button>
  );
}
