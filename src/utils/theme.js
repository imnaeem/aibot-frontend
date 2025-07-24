import { createTheme } from "@mui/material/styles";

// Clean, minimal theme inspired by Google/Facebook with enhanced details
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
    },
    divider: "#e8eaed",
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h6: {
      fontWeight: 500,
      fontSize: "1.125rem",
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.2,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // Global scrollbar styling
    MuiCssBaseline: {
      styleOverrides: {
        "*::-webkit-scrollbar": {
          width: "4px",
          height: "4px",
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#f0f0f0",
          borderRadius: "2px",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        },
        "*::-webkit-scrollbar-corner": {
          backgroundColor: "transparent",
        },
        // Firefox scrollbar
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#f0f0f0 transparent",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f8f9fa",
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: "#e0e0e0",
            },
            "&:hover fieldset": {
              borderColor: "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          backgroundColor: "#1976d2",
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          transition: "all 0.2s ease",
          "&.Mui-selected": {
            backgroundColor: "#e3f2fd",
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          },
          "&:hover": {
            backgroundColor: "#f5f5f5",
            transform: "translateX(2px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&:hover .message-actions": {
            opacity: 1,
          },
        },
      },
    },
  },
});

export default theme;
