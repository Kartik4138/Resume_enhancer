import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5', // Indigo 600 - Modern, vibrant SaaS look
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0EA5E9', // Sky 500 - Fresh accent
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F1F5F9', // Slate 100
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B', // Slate 800
      secondary: '#64748B', // Slate 500
    },
    success: {
      main: '#10B981',
    },
    error: {
      main: '#EF4444',
    }
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.1)', // Soft elevation 1
    '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03)', // Soft elevation 2
    '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)', // Soft elevation 3
    ...Array(21).fill('none') // Fill rest to avoid errors, we mostly use these 3
  ],
  typography: {
    fontFamily: '"Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      color: '#1E293B',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
      color: '#1E293B',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12, // More rounded modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          boxShadow: 'none',
          fontSize: '0.95rem',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', // Indigo glow on hover
          },
        },
        containedPrimary: {
          background: '#4F46E5',
          '&:hover': {
            background: '#4338CA',
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation0: {
          border: '1px solid #E2E8F0',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid transparent',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F8FAFC',
            transition: 'background-color 0.2s',
            '& fieldset': {
              borderColor: '#E2E8F0',
              transition: 'border-color 0.2s',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: '#4F46E5',
                borderWidth: 2,
              }
            },
            '& .MuiOutlinedInput-input': {
              color: '#1E293B',
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        }
      }
    }
  },
});

export default theme;
