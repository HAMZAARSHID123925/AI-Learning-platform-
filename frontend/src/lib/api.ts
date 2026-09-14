/**
 * PPAcademia — src/lib/api.ts
 *
 * Central API utility with automatic JWT token refresh.
 * All pages should use fetchWithAuth() instead of raw fetch().
 */

const API_BASE = 'http://localhost:8000/api/v1';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function tryRefreshToken(): Promise<string | null> {
  const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      window.location.href = '/login';
      return null;
    }
    const data = await res.json();
    const newToken = data.access_token;
    localStorage.setItem('access_token', newToken);
    return newToken;
  } catch {
    return null;
  }
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('access_token');

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
