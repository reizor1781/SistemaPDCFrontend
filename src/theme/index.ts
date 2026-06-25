import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseTokens = {
  green: {
    dark: '#1a3a14',
    medium: '#2d5a27',
    main: '#3d7a35',
    light: '#4a9640',
    pale: '#a8d5a2',
  },
  yellow: {
    dark: '#b8920e',
    main: '#f5c518',
    light: '#fad352',
    pale: '#fef3c7',
  },
  earth: {
    dark: '#4a3210',
    main: '#8b6914',
    light: '#c49a3c',
    pale: '#f5e6c8',
    cream: '#f5f0e8',
  },
  neutral: {
    900: '#111827',
    800: '#1f2937',
    700: '#374151',
    600: '#4b5563',
    500: '#6b7280',
    400: '#9ca3af',
    300: '#d1d5db',
    200: '#e5e7eb',
    100: '#f3f4f6',
    50: '#f9fafb',
  },
};

const sharedOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 12,
  },
};

export const lightTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: 'light',
    primary: {
      main: baseTokens.green.main,
      dark: baseTokens.green.dark,
      light: baseTokens.green.light,
      contrastText: '#ffffff',
    },
    secondary: {
      main: baseTokens.yellow.main,
      dark: baseTokens.yellow.dark,
      light: baseTokens.yellow.light,
      contrastText: '#1a1a00',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: baseTokens.neutral[900],
      secondary: baseTokens.neutral[600],
    },
    divider: baseTokens.neutral[200],
    success: { main: '#2e7d32', light: '#66bb6a' },
    warning: { main: '#ed6c02', light: '#ffa726' },
    error: { main: '#d32f2f', light: '#ef5350' },
    info: { main: '#0288d1', light: '#29b6f6' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${baseTokens.neutral[300]} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: baseTokens.neutral[300],
            borderRadius: 10,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${baseTokens.green.main}, ${baseTokens.green.dark})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${baseTokens.green.light}, ${baseTokens.green.main})`,
            boxShadow: `0 4px 14px ${baseTokens.green.pale}`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: baseTokens.green.light,
      dark: baseTokens.green.main,
      light: baseTokens.green.pale,
      contrastText: '#ffffff',
    },
    secondary: {
      main: baseTokens.yellow.main,
      dark: baseTokens.yellow.dark,
      light: baseTokens.yellow.light,
      contrastText: '#1a1a00',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e8f0e8',
      secondary: baseTokens.neutral[300],
    },
    divider: 'rgba(255,255,255,0.08)',
    success: { main: '#4caf50', light: '#66bb6a' },
    warning: { main: '#ffa726', light: '#ffcc80' },
    error: { main: '#f44336', light: '#ef9a9a' },
    info: { main: '#29b6f6', light: '#80d8ff' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${baseTokens.neutral[600]} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: baseTokens.neutral[600],
            borderRadius: 10,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#1e1e1e',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          background: '#232323',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          background: '#282828',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${baseTokens.green.light}, ${baseTokens.green.main})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${baseTokens.green.pale}, ${baseTokens.green.light})`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          background: '#1e1e1e',
        },
      },
    },
  },
});
