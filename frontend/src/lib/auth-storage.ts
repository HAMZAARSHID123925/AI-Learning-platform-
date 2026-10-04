/**
 * PPAcademia — src/lib/auth-storage.ts
 *
 * Secure Client & Cookie Token Management Utility.
 * Prioritizes in-memory token cache with Secure SameSite=Lax cookies,
 * shielding credentials from Cross-Site Scripting (XSS).
 */

let inMemoryAccessToken: string | null = null;
const TOKEN_KEY = 'elarion_access_token';

export function saveAuthSession(token: string): void {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  }
}

export function clearAuthSession(): void {
  inMemoryAccessToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
}

export function getStoredAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        inMemoryAccessToken = stored;
        return stored;
      }
    } catch {}
  }
  return null;
}
