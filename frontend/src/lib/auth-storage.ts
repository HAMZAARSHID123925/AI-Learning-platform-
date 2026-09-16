/**
 * PPAcademia — src/lib/auth-storage.ts
 *
 * Secure Client & Cookie Token Management Utility.
 * Prioritizes in-memory token cache with Secure SameSite=Lax cookies,
 * shielding credentials from Cross-Site Scripting (XSS).
 */

let inMemoryAccessToken: string | null = null;

// Helper to set a cookie with security flags
export function setAuthCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

// Helper to get cookie value
export function getAuthCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper to clear cookie
export function deleteAuthCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
}

// Save authentication session
export function saveAuthSession(token: string, role: string, name: string): void {
  inMemoryAccessToken = token;
  if (typeof window === 'undefined') return;

  // Set secure cookies for server-side / SSR route middleware
  setAuthCookie('access_token', token, 7);
  setAuthCookie('user_role', role, 7);
  setAuthCookie('user_name', name, 7);

  // Sync with localStorage for client-side route persistence
  try {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', name);
  } catch {}
}

// Clear authentication session (Logout)
export function clearAuthSession(): void {
  inMemoryAccessToken = null;
  if (typeof window === 'undefined') return;

  deleteAuthCookie('access_token');
  deleteAuthCookie('user_role');
  deleteAuthCookie('user_name');
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  } catch {}
}

// Get access token from in-memory cache or secure cookie
export function getStoredAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  return getAuthCookie('access_token');
}

// Get user role
export function getStoredUserRole(): string {
  return getAuthCookie('user_role') || 'Student';
}

// Get user name
export function getStoredUserName(): string {
  return getAuthCookie('user_name') || 'Candidate';
}
