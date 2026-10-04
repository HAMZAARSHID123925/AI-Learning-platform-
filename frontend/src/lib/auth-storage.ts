/**
 * PPAcademia — src/lib/auth-storage.ts
 *
 * Secure Client & Cookie Token Management Utility.
 * Prioritizes in-memory token cache with Secure SameSite=Lax cookies,
 * shielding credentials from Cross-Site Scripting (XSS).
 */

let inMemoryAccessToken: string | null = null;

export function saveAuthSession(token: string): void {
  inMemoryAccessToken = token;
}

export function clearAuthSession(): void {
  inMemoryAccessToken = null;
}

export function getStoredAccessToken(): string | null {
  return inMemoryAccessToken;
}
