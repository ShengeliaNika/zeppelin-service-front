import { createTheme, lighten, type PaletteMode } from "@mui/material/styles";

// Accent color presets (Indigo/Blue/Green/Red/Gray swatches). "Default" keeps
// this app's original blue exactly as it was before this existed, so nobody's
// view changes unless they opt in. Other presets use one canonical hex and
// get auto-lightened for dark mode rather than hand-tuning a second hex each.
export const ACCENT_OPTIONS: { key: string; label: string; hex: string }[] = [
  { key: "default", label: "Default", hex: "#2563eb" },
  { key: "indigo", label: "Indigo", hex: "#7b58cf" },
  { key: "blue", label: "Blue", hex: "#1f75cb" },
  { key: "green", label: "Green", hex: "#108548" },
  { key: "red", label: "Red", hex: "#dd2b0e" },
  { key: "gray", label: "Gray", hex: "#737278" },
];

export type AccentKey = (typeof ACCENT_OPTIONS)[number]["key"];

function accentBaseHex(accent: AccentKey): string {
  if (accent === "default") return "#2563eb";
  return ACCENT_OPTIONS.find((a) => a.key === accent)?.hex ?? ACCENT_OPTIONS[0].hex;
}

function resolveAccent(mode: PaletteMode, accent: AccentKey): string {
  const isDark = mode === "dark";
  if (accent === "default") return isDark ? "#60a5fa" : "#2563eb";
  return isDark ? lighten(accentBaseHex(accent), 0.25) : accentBaseHex(accent);
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// A single accent glow shared by the header and sidebar, anchored at the sidebar's bottom-left
// corner (the resting point - stays plain/dark) and ramping up to full color moving away from it.
// Must be applied to both surfaces with `backgroundAttachment: "fixed"` alongside it - that ties
// the gradient's coordinate space to the *viewport* rather than each element's own box, so the
// header's slice and the sidebar's slice are two windows onto one continuous painted plane instead
// of two independently-anchored gradients that visibly seam where they meet.
// "Default" returns a plain paper color so nobody sees a glow unless they opt into a theme.
export function getChromeGlow(mode: PaletteMode, accent: AccentKey): string {
  const isDark = mode === "dark";
  const paper = isDark ? "#262c38" : "#ffffff";
  if (accent === "default") return paper;
  const glow = hexToRgba(accentBaseHex(accent), isDark ? 0.22 : 0.16);
  return `radial-gradient(ellipse farthest-corner at 0% 100%, ${paper} 0%, ${glow} 65%)`;
}

export function getTheme(mode: PaletteMode, accent: AccentKey = "default") {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: { main: resolveAccent(mode, accent) },
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
      // A slim, track-less scrollbar everywhere instead of the browser default, applied
      // globally via CssBaseline so every scrollable area matches, not just one spot.
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)"} transparent`,
          },
          "*::-webkit-scrollbar": { width: 10, height: 10 },
          "*::-webkit-scrollbar-track": { background: "transparent" },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
            borderRadius: 8,
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor: isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)",
          },
        },
      },
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
            transition: "box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
            "&:hover": {
              borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.14)",
              boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.32)" : "0 4px 16px rgba(15,23,42,0.08)",
            },
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
