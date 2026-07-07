import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { configureAuth } from "../api/client";
import * as authApi from "../api/auth";
import type { AuthResponse, UserSummary } from "../api/types";

const REFRESH_TOKEN_STORAGE_KEY = "zeppelin.refreshToken";

interface AuthContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const applyAuthResponse = useCallback((data: AuthResponse) => {
    accessTokenRef.current = data.accessToken;
    setUser(data.user);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
  }, []);

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null;
    setUser(null);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }, []);

  const performRefresh = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!stored) {
      throw new Error("No refresh token available");
    }

    const data = await authApi.refresh(stored);
    applyAuthResponse(data);
    return data.accessToken;
  }, [applyAuthResponse]);

  useEffect(() => {
    configureAuth({
      getAccessToken: () => accessTokenRef.current,
      refreshAccessToken: performRefresh,
      onAuthFailure: clearAuth,
    });
  }, [performRefresh, clearAuth]);

  useEffect(() => {
    performRefresh()
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
    // Only run once on mount - performRefresh/clearAuth are stable via useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      applyAuthResponse(data);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(async () => {
    const stored = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        await authApi.logout(stored);
      } catch {
        // Best-effort server-side revocation; clear local state regardless.
      }
    }
    clearAuth();
  }, [clearAuth]);

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
