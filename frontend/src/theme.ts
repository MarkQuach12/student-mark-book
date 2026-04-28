import { createTheme, type Theme } from "@mui/material/styles";

export type Mode = "light" | "dark";

const palette = {
  light: {
    bg: "#FFFFFF",
    paper: "#FFFFFF",
    sidebar: "#F9FAFB",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textDisabled: "#9CA3AF",
    primary: "#1E3A5F",
    primaryTint: "#EEF2F7",
    divider: "#E5E7EB",
    actionHover: "rgba(17, 24, 39, 0.04)",
    statusInfo: "#2563EB",
    statusSuccess: "#16A34A",
    statusWarning: "#D97706",
    statusError: "#DC2626",
  },
  dark: {
    bg: "#0A0A0F",
    paper: "#111114",
    sidebar: "#111114",
    textPrimary: "#F3F4F6",
    textSecondary: "#9CA3AF",
    textDisabled: "#4B5563",
    primary: "#3B6FA0",
    primaryTint: "rgba(59, 111, 160, 0.10)",
    divider: "#1F2937",
    actionHover: "rgba(243, 244, 246, 0.05)",
    statusInfo: "#60A5FA",
    statusSuccess: "#4ADE80",
    statusWarning: "#FBBF24",
    statusError: "#F87171",
  },
} as const;

export function buildTheme(mode: Mode): Theme {
  const c = palette[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, contrastText: "#FFFFFF" },
      error: { main: c.statusError },
      warning: { main: c.statusWarning },
      success: { main: c.statusSuccess },
      info: { main: c.statusInfo },
      background: { default: c.bg, paper: c.paper },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      divider: c.divider,
      action: { hover: c.actionHover },
    },
    spacing: 4,
    shape: { borderRadius: 6 },
    typography: {
      fontFamily:
        "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: { fontSize: "1.75rem", fontWeight: 600, letterSpacing: "-0.02em" },
      h2: { fontSize: "1.375rem", fontWeight: 600, letterSpacing: "-0.02em" },
      h3: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.02em" },
      h4: { fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em" },
      h5: { fontSize: "0.9375rem", fontWeight: 600 },
      h6: { fontSize: "0.875rem", fontWeight: 600 },
      subtitle1: { fontSize: "0.9375rem", fontWeight: 500 },
      subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
      body1: { fontSize: "0.875rem", fontWeight: 400 },
      body2: { fontSize: "0.8125rem", fontWeight: 400 },
      caption: { fontSize: "0.75rem", fontWeight: 400 },
      button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
      overline: {
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
    },
    transitions: {
      duration: {
        shortest: 100,
        shorter: 120,
        short: 150,
        standard: 150,
        complex: 150,
        enteringScreen: 150,
        leavingScreen: 120,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: c.bg,
            color: c.textPrimary,
          },
          "code, pre, kbd, samp": {
            fontFamily:
              "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 6,
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 12,
            paddingRight: 12,
            fontSize: "0.875rem",
            fontWeight: 500,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          containedPrimary: {
            backgroundColor: c.primary,
            color: "#FFFFFF",
            "&:hover": { backgroundColor: c.primary, opacity: 0.92 },
          },
          outlined: {
            borderColor: c.divider,
            color: c.textPrimary,
            "&:hover": {
              borderColor: c.divider,
              backgroundColor: c.primaryTint,
            },
          },
          text: {
            color: c.textPrimary,
            "&:hover": { backgroundColor: c.actionHover },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            "&:hover": { backgroundColor: c.actionHover },
          },
        },
      },
      MuiCard: {
        defaultProps: { variant: "outlined" },
        styleOverrides: {
          root: {
            borderColor: c.divider,
            backgroundColor: c.paper,
            borderRadius: 8,
            boxShadow:
              mode === "light" ? "0 1px 2px rgba(17, 24, 39, 0.04)" : "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            "& fieldset": { borderColor: c.divider },
            "&:hover fieldset": { borderColor: c.textDisabled },
            "&.Mui-focused fieldset": {
              borderColor: c.primary,
              borderWidth: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: "0.875rem", fontWeight: 500 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#111827",
            color: "#F9FAFB",
            fontSize: "0.6875rem",
            fontWeight: 500,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            borderRadius: 4,
          },
          arrow: { color: "#111827" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${c.divider}`,
            backgroundImage: "none",
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
          },
        },
      },
      MuiTable: { defaultProps: { size: "small" } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontWeight: 500,
              color: c.textSecondary,
              borderBottom: `1px solid ${c.divider}`,
              backgroundColor: "transparent",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${c.divider}`,
            fontSize: "0.875rem",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: c.actionHover },
          },
        },
      },
      MuiAppBar: {
        defaultProps: { color: "default", elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: c.bg,
            borderBottom: `1px solid ${c.divider}`,
            color: c.textPrimary,
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: c.divider } },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontSize: "0.75rem",
            fontWeight: 500,
            height: 22,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: `1px solid ${c.divider}`,
            color: c.textSecondary,
            textTransform: "none",
            "&.Mui-selected": {
              backgroundColor: c.primaryTint,
              color: c.primary,
              "&:hover": { backgroundColor: c.primaryTint },
            },
          },
        },
      },
    },
  });
}

export default buildTheme("light");

export const tokens = palette;
