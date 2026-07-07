import { createTheme, type PaletteMode } from "@mui/material/styles";

export function getTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? "#60a5fa" : "#2563eb" },
      secondary: { main: isDark ? "#a78bfa" : "#7c3aed" },
      background: {
        default: isDark ? "#0f1115" : "#f4f6f8",
        paper: isDark ? "#171a21" : "#ffffff",
      },
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: ['"Inter"', "system-ui", "Roboto", "Arial", "sans-serif"].join(","),
    },
    components: {
      MuiAppBar: { defaultProps: { color: "inherit", elevation: 0 } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          },
        },
      },
      MuiLink: {
        defaultProps: { underline: "hover" },
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
        },
      },
    },
  });
}
