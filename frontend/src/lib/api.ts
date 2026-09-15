/**
 * PPAcademia — src/lib/api.ts
 *
 * Central API utility with automatic JWT token refresh.
 * All pages should use fetchWithAuth() instead of raw fetch().
 */

import { getStoredAccessToken, saveAuthSession } from './auth-storage';

const API_BASE = 'http://localhost:8000/api/v1';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function tryRefreshToken(): Promise<string | null> {
  const token = getStoredAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const newToken = data.access_token;
    if (newToken) {
      localStorage.setItem('access_token', newToken);
    }
    return newToken;
  } catch {
    return null;
  }
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredAccessToken();

  const makeRequest = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers || {}),
      },
    });

  let response = await makeRequest(token);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await tryRefreshToken();
      isRefreshing = false;
      refreshQueue.forEach((cb) => cb(newToken || ''));
      refreshQueue = [];

      if (newToken) {
        response = await makeRequest(newToken);
      }
    } else {
      // Queue this request until the refresh completes
      await new Promise<void>((resolve) => {
        refreshQueue.push(() => resolve());
      });
      const refreshedToken = localStorage.getItem('access_token');
      response = await makeRequest(refreshedToken);
    }
  }

  return response;
}

export { API_BASE };
