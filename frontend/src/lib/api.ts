import { getStoredAccessToken, saveAuthSession } from './auth-storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
let refreshRequest: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token) return null;
    saveAuthSession(data.access_token);
    return data.access_token;
  } catch { return null; }
}

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const request = (token: string | null) => {
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return fetch(`${API_BASE}${path}`, { ...options, headers, credentials: options.credentials || 'include' });
  };
  let response = await request(getStoredAccessToken());
  if (response.status === 401) {
    if (!refreshRequest) refreshRequest = refreshToken().finally(() => { refreshRequest = null; });
    const token = await refreshRequest;
    if (token) response = await request(token);
  }
  return response;
}

export { API_BASE };
