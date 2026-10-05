'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Grade, Role, User } from '@/types';
import { API_BASE, fetchWithAuth } from '@/lib/api';
import { saveAuthSession, clearAuthSession } from '@/lib/auth-storage';

interface RegisteredAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
  grade?: Grade;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password?: string, role?: Role) => Promise<boolean> | boolean;
  signUp: (account: { name: string; email: string; password: string; role: Role }) => Promise<{ success: boolean; error?: string }>;
  setGrade: (grade: Grade) => void;
  signOut: () => Promise<void> | void;
}

const STORAGE_KEY = 'elarion-user';
const ACCOUNTS_KEY = 'elarion-accounts-v1';

const defaultAccounts: RegisteredAccount[] = [
  { name: 'Alex Johnson', email: 'student@elarion.com', password: 'Student123!', role: 'student', grade: 5 },
  { name: 'Mr Ahmed', email: 'instructor@elarion.com', password: 'Instructor123!', role: 'teacher' },
  { name: 'Nadia Rahman', email: 'admin@elarion.com', password: 'Admin123!', role: 'admin' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const getAccounts = useCallback((): RegisteredAccount[] => {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) {
        return JSON.parse(raw) as RegisteredAccount[];
      }
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    } catch {
      return defaultAccounts;
    }
  }, []);

  const persist = useCallback((next: User | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // Check /api/v1/auth/me or /api/v1/users/me on mount if session exists
  useEffect(() => {
    async function verifyBackendUser() {
      try {
        const res = await fetchWithAuth('/users/me');
        if (res.ok) {
          const data = await res.json();
          const primaryRole = (data.roles && data.roles[0]) ? data.roles[0].toLowerCase() as Role : 'student';
          const updatedUser: User = {
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || user?.name || 'Student',
            email: data.email,
            role: primaryRole,
            grade: (data.grade || user?.grade || 5) as Grade,
          };
          persist(updatedUser);
        }
      } catch {}
    }
    verifyBackendUser();
  }, []);

  const signUp = useCallback(
    async (account: { name: string; email: string; password: string; role: Role }): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = account.email.trim().toLowerCase();
      const parts = account.name.trim().split(' ');
      const firstName = parts[0] || 'User';
      const lastName = parts.slice(1).join(' ') || 'Student';

      // 1. Try real backend register endpoint
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: account.password,
            first_name: firstName,
            last_name: lastName,
            role: account.role,
          }),
        });

        if (res.ok) {
          // Immediately login on backend to retrieve JWT token
          const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: cleanEmail,
              password: account.password,
            }),
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();
            if (loginData.access_token) {
              saveAuthSession(loginData.access_token);
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const message = errData.message || (Array.isArray(errData.detail) ? errData.detail[0]?.msg : errData.detail) || 'Failed to create account in database';
          return { success: false, error: message };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Cannot reach authentication server.' };
      }

      // 2. Local fallback sync
      const existing = getAccounts();
      const filtered = existing.filter((a) => a.email.toLowerCase() !== cleanEmail);
      const newAccount: RegisteredAccount = {
        name: account.name.trim(),
        email: cleanEmail,
        password: account.password,
        role: account.role,
      };
      const updated = [...filtered, newAccount];
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
      } catch {}

      persist({
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
      });

      return { success: true };
    },
    [getAccounts, persist]
  );

  const signIn = useCallback(
    async (email: string, password?: string, role?: Role): Promise<boolean> => {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Try real backend login
      if (password) {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: cleanEmail,
              password: password,
            }),
          });

          if (res.ok) {
            const data = await loginResJson(res);
            if (data.access_token) {
              saveAuthSession(data.access_token);
            }
            const backendRole = data.user?.roles?.[0]?.toLowerCase() as Role || role || 'student';
            const userObj: User = {
              name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim() || 'Learner',
              email: data.user?.email || cleanEmail,
              role: backendRole,
              grade: (data.user?.grade || 5) as Grade,
            };
            persist(userObj);
            return true;
          }
        } catch (backendErr) {
          console.warn('Backend login connection failed, checking local accounts:', backendErr);
        }
      }

      // 2. Fallback to local accounts
      const accounts = getAccounts();
      const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

      if (!match) {
        return false;
      }

      if (password && match.password !== password) {
        return false;
      }

      if (role && match.role !== role) {
        return false;
      }

      persist({
        name: match.name,
        email: match.email,
        role: match.role,
        grade: match.grade,
      });
      return true;
    },
    [getAccounts, persist]
  );

  const setGrade = useCallback(
    async (grade: Grade) => {
      if (user) {
        const next = { ...user, grade };
        persist(next);
        // Also sync with backend /api/v1/users/me
        try {
          await fetchWithAuth('/users/me', {
            method: 'PATCH',
            body: JSON.stringify({ grade }),
          });
        } catch {}

        try {
          const accounts = getAccounts().map((a) =>
            a.email.toLowerCase() === user.email.toLowerCase() ? { ...a, grade } : a
          );
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        } catch {}
      }
    },
    [persist, user, getAccounts]
  );

  const signOut = useCallback(async () => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {}
    clearAuthSession();
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, signIn, signUp, setGrade, signOut }),
    [user, signIn, signUp, setGrade, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function loginResJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}