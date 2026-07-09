import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { getTheme, type AccentKey } from "../theme";

const STORAGE_KEY = "zeppelin_theme_mode";
const ACCENT_STORAGE_KEY = "zeppelin_accent_color";

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialAccent(): AccentKey {
  return (localStorage.getItem(ACCENT_STORAGE_KEY) as AccentKey) || "default";
}

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
  accent: AccentKey;
  setAccent: (accent: AccentKey) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>(getInitialMode);
  const [accent, setAccentState] = useState<AccentKey>(getInitialAccent);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  }, [accent]);

  const setMode = (next: PaletteMode) => setModeState(next);
  const toggleMode = () => setModeState((m) => (m === "light" ? "dark" : "light"));
  const setAccent = (next: AccentKey) => setAccentState(next);

  const theme = useMemo(() => getTheme(mode, accent), [mode, accent]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, setMode, accent, setAccent }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
