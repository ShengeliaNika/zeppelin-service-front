import { apiFetch } from "./client";
import type { AuthResponse } from "./types";

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRetry: true,
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRetry: true,
  });
}

export function logout(refreshToken: string) {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRetry: true,
  });
}
