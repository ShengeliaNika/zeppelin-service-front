const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface AuthHandlers {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  onAuthFailure: () => void;
}

let authHandlers: AuthHandlers | null = null;

// Called once by AuthProvider on mount - keeps this module decoupled from
// React so plain fetch helpers can still attach/refresh the JWT.
export function configureAuth(handlers: AuthHandlers) {
  authHandlers = handlers;
}

interface FetchOptions extends RequestInit {
  // Set by login/refresh/logout calls themselves to avoid an infinite loop
  // of refreshing in response to their own 401s.
  skipAuthRetry?: boolean;
}

export async function apiFetch<T>(path: string, init?: FetchOptions): Promise<T> {
  const { skipAuthRetry, ...requestInit } = init ?? {};
  const response = await sendRequest(path, requestInit);

  if (response.status === 401 && !skipAuthRetry && authHandlers) {
    try {
      await authHandlers.refreshAccessToken();
    } catch {
      authHandlers.onAuthFailure();
      throw new ApiError(401, `Request to ${path} failed with status 401`);
    }

    const retryResponse = await sendRequest(path, requestInit);
    return parseResponse<T>(path, retryResponse);
  }

  return parseResponse<T>(path, response);
}

function sendRequest(path: string, init?: RequestInit): Promise<Response> {
  const token = authHandlers?.getAccessToken();
  // FormData bodies (file uploads) must let the browser set its own
  // multipart Content-Type (with boundary) - forcing application/json here
  // would break the upload.
  const isFormData = init?.body instanceof FormData;

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

async function parseResponse<T>(path: string, response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// For authenticated binary downloads (e.g. attachments) where a plain <a
// href> can't carry the Authorization header.
export async function apiFetchBlob(path: string): Promise<Blob> {
  let response = await sendRequest(path);

  if (response.status === 401 && authHandlers) {
    try {
      await authHandlers.refreshAccessToken();
    } catch {
      authHandlers.onAuthFailure();
      throw new ApiError(401, `Request to ${path} failed with status 401`);
    }
    response = await sendRequest(path);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with status ${response.status}`);
  }

  return response.blob();
}
