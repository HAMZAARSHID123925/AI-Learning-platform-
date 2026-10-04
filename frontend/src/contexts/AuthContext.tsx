'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import type { Grade, Role, User } from '@/types';
import { fetchWithAuth, API_BASE } from '@/lib/api';
import { saveAuthSession, clearAuthSession } from '@/lib/auth-storage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  setGrade: (grade: Grade) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetchWithAuth('/users/me');
      if (res.ok) {
        const data = await res.json();
        const newUser: User = {
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          role: (data.roles && data.roles[0]) as Role || 'student',
          grade: data.grade,
          status: data.status,
        };
        setUser(newUser);
        return newUser;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!loginRes.ok) {
        const errorData = await loginRes.json().catch(() => null);
        throw new Error(errorData?.message || 'Invalid email or password');
      }

      const data = await loginRes.json();
      if (data.access_token) {
        saveAuthSession(data.access_token);
      }
      return await fetchUser();
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const setGrade = useCallback((grade: Grade) => {
    // Note: For full M1, this would call a backend endpoint to update grade.
    // For now we update local state.
    if (user) setUser({ ...user, grade });
  }, [user]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, setGrade, signOut }),
    [user, isLoading, signIn, setGrade, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}