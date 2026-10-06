'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Grade, Role, User } from '@/types';
import type { BackendProfile } from '@/types/backend';
import { registerAccount } from '@/lib/signup';
import { API_BASE, fetchWithAuth } from '@/lib/api';
import { saveAuthSession, clearAuthSession, getStoredAccessToken } from '@/lib/auth-storage';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string, role?: Role) => Promise<boolean>;
  signUp: (account: { name: string; email: string; password: string; role: Role }) => Promise<{ success: boolean; error?: string; accountCreated?: boolean }>;
  setGrade: (grade: Grade) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
function backendUser(data: BackendProfile): User {
  const roles = data.roles || [];
  return {
    id: data.id, name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Learner',
    email: data.email,
    role: roles.includes('Admin') ? 'admin' : roles.includes('Instructor') ? 'teacher' : 'student',
    grade: data.grade || undefined,
  };
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    // Remove legacy plaintext account caches. The server is the identity authority.
    localStorage.removeItem('elarion-accounts-v1');
    localStorage.removeItem('elarion-user');
    const verifySession = async () => {
      if (!getStoredAccessToken()) return;
      const res = await fetchWithAuth('/users/me');
      if (!res.ok) throw new Error('Session unavailable');
      const data = await res.json();
      if (active) setUser(backendUser(data));
    };
    void verifySession()
      .catch(() => { if (active) { clearAuthSession(); setUser(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const signIn = useCallback(async (email: string, password?: string, role?: Role) => {
    if (!password) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.access_token) return false;
      saveAuthSession(data.access_token);
      const me = await fetchWithAuth('/users/me');
      if (!me.ok) { clearAuthSession(); return false; }
      const identity = backendUser(await me.json());
      if (role && identity.role !== role) { clearAuthSession(); return false; }
      setUser(identity);
      return true;
    } catch { clearAuthSession(); setUser(null); return false; }
  }, []);
  const signUp = useCallback(async (account: { name: string; email: string; password: string; role: Role }) => {
    try {
      const registration = await registerAccount(account);
      if (!registration.success) return registration;
      const success = await signIn(account.email, account.password);
      return { success, accountCreated: true, error: success ? undefined : 'Your account was created. Please sign in; email verification may be required.' };
    } catch { return { success: false, error: 'Cannot reach authentication server.' }; }
  }, [signIn]);
  const setGrade = useCallback(async (grade: Grade) => {
    const res = await fetchWithAuth('/users/me', { method: 'PATCH', body: JSON.stringify({ grade }) });
    if (!res.ok) throw new Error('Could not save your grade.');
    setUser(backendUser(await res.json()));
  }, []);
  const signOut = useCallback(async () => {
    try { await fetchWithAuth('/auth/logout', { method: 'POST' }); }
    finally { clearAuthSession(); setUser(null); }
  }, []);
  const value = useMemo(() => ({ user, loading, signIn, signUp, setGrade, signOut }), [user, loading, signIn, signUp, setGrade, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
