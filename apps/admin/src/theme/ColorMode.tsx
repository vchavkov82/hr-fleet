import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ColorMode = 'light' | 'dark';

const ColorModeContext = createContext<{ mode: ColorMode; toggleMode: () => void }>({
  mode: 'dark',
  toggleMode: () => {},
});

const buildTheme = (mode: ColorMode) => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563EB', light: '#3b82f6', dark: '#1d4ed8' },
      secondary: { main: isDark ? '#f97316' : '#c2410c' },
      background: {
        default: isDark ? '#0b1116' : '#f7f8fb',
        paper: isDark ? '#0f1720' : '#ffffff',
      },
      divider: isDark ? '#1f2937' : '#E4E4E7',
      text: {
        primary: isDark ? '#e5e7eb' : '#18181B',
        secondary: isDark ? '#9ca3af' : '#71717A',
      },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"IBM Plex Sans", "Epilogue", system-ui, -apple-system, sans-serif',
      h1: { fontFamily: '"Epilogue", "IBM Plex Sans", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.02em' },
      h2: { fontFamily: '"Epilogue", "IBM Plex Sans", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.02em' },
      h3: { fontFamily: '"Epilogue", "IBM Plex Sans", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.01em' },
      h4: { fontFamily: '"Epilogue", "IBM Plex Sans", system-ui, sans-serif', fontWeight: 700, letterSpacing: '0.01em' },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#18181B',
            borderBottom: '2px solid #2563EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: '#ffffff',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: { minHeight: 72 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0f1720' : '#FAFAFA',
            borderRight: `1px solid ${isDark ? '#1f2937' : '#E4E4E7'}`,
            color: isDark ? '#e5e7eb' : '#18181B',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.01em',
          },
          containedPrimary: {
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(15,23,42,0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 8,
            transition: 'background-color 0.2s, transform 0.2s',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              transform: 'translateX(4px)',
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          },
        },
      },
    },
  });
};

const getInitialMode = (): ColorMode => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('hr-admin-color-mode') as ColorMode | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem('hr-admin-color-mode', mode);
    document.documentElement.setAttribute('data-color-mode', mode);
    document.body.style.backgroundColor = buildTheme(mode).palette.background.default;
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
