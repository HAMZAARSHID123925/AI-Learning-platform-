'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Grade, Role, User } from '@/types';

interface RegisteredAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
  grade?: Grade;
}

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, password?: string, role?: Role) => boolean;
  signUp: (account: { name: string; email: string; password: string; role: Role }) => boolean;
  setGrade: (grade: Grade) => void;
  signOut: () => void;
}

const STORAGE_KEY = 'elarion-user';
const ACCOUNTS_KEY = 'elarion-accounts-v1';

const defaultAccounts: RegisteredAccount[] = [
  { name: 'Alex Johnson', email: 'student@elarion.com', password: 'Student123!', role: 'student', grade: 5 },
  { name: 'Mr Ahmed', email: 'instructor@elarion.com', password: 'Instructor123!', role: 'teacher' },
  { name: 'Nadia Rahman', email: 'admin@elarion.com', password: 'Admin123!', role: 'admin' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as User : null;
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

  const signUp = useCallback((account: { name: string; email: string; password: string; role: Role }): boolean => {
    const cleanEmail = account.email.trim().toLowerCase();
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
    return true;
  }, [getAccounts, persist]);

  const signIn = useCallback((email: string, password?: string, role?: Role): boolean => {
    const cleanEmail = email.trim().toLowerCase();
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
  }, [getAccounts, persist]);

  const setGrade = useCallback(
    (grade: Grade) => {
      if (user) {
        const next = { ...user, grade };
        persist(next);
        // Also update stored account
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

  const signOut = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({ user, signIn, signUp, setGrade, signOut }), [user, signIn, signUp, setGrade, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}