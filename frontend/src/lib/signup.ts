import { API_BASE } from './api';
import type { Role } from '@/types';

export function passwordError(password: string): string | null {
  if (password.length < 10) return 'Use at least 10 characters.';
  if (password.length > 128) return 'Use no more than 128 characters.';
  if (!/[A-Z]/.test(password)) return 'Add an uppercase letter (A–Z).';
  if (!/[a-z]/.test(password)) return 'Add a lowercase letter (a–z).';
  if (!/[0-9]/.test(password)) return 'Add a number (0–9).';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>/?`~';
  if (![...password].some(char => symbols.includes(char))) return 'Add a symbol such as !, @, # or $.';
  return null;
}
export async function registerAccount(account: {name: string; email: string; password: string; role: Role}): Promise<{success: boolean; error?: string}> {
  const error = passwordError(account.password);
  if (error) return {success: false, error};
  const [first_name, ...rest] = account.name.trim().split(/\s+/);
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: account.email.trim().toLowerCase(), password: account.password,
      first_name, last_name: rest.join(' ') || 'Learner', role: account.role}),
  });
  if (response.ok) return {success: true};
  if (response.status === 409) return {success: false, error: 'This email already has an account. Please sign in.'};
  const data: {message?: string; detail?: string | {msg: string}[]} = await response.json().catch(() => ({}));
  const detail = typeof data.detail === 'string' ? data.detail : data.detail?.map(item => item.msg.replace(/^Value error, /, '')).join(' ');
  return {success: false, error: data.message || detail || 'Could not create account. Please try again.'};
}
