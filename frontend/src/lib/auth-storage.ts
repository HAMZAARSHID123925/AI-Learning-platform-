/**
 * PPAcademia — src/lib/auth-storage.ts
 *
 * Secure Client & Cookie Token Management Utility.
 * Manages JWT access tokens and session headers with support for
 * browser cookies and local memory security.
 */

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
  if (typeof window === 'undefined') return;
  
  // Storage in localStorage
  localStorage.setItem('access_token', token);
  localStorage.setItem('user_role', role);
  localStorage.setItem('user_name', name);
  
  // Storage in secure Cookies for server-side / middleware compatibility
  setAuthCookie('access_token', token, 7);
  setAuthCookie('user_role', role, 7);
  setAuthCookie('user_name', name, 7);
}

// Clear authentication session (Logout)
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  
  deleteAuthCookie('access_token');
  deleteAuthCookie('user_role');
  deleteAuthCookie('user_name');
}

// Get access token from available stores
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || getAuthCookie('access_token');
}

// Get user role
export function getStoredUserRole(): string {
  if (typeof window === 'undefined') return 'Student';
  return localStorage.getItem('user_role') || getAuthCookie('user_role') || 'Student';
}

// Get user name
export function getStoredUserName(): string {
  if (typeof window === 'undefined') return 'Student';
  return localStorage.getItem('user_name') || getAuthCookie('user_name') || 'Candidate';
}
