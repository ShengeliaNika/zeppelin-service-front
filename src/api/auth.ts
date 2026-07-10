import { apiFetch } from "./client";
import type { AuthResponse, RegisterRequest, RegisterResponse } from "./types";

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuthRetry: true,
  });
}

export function register(request: RegisterRequest) {
  return apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
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
