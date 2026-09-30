'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Grade, Role, User } from '@/types/all_dashbord/index';

interface AuthContextValue {
  user: User | null;
  signIn: (email: string, role: Role) => void;
  setGrade: (grade: Grade) => void;
  signOut: () => void;
}

const STORAGE_KEY = 'elarion-user';
const namesByRole: Record<Role, string> = {
  student: 'Alex',
  teacher: 'Mr Ahmed',
  admin: 'Nadia Rahman'
};

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

  const persist = useCallback((next: User | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));else
      localStorage.removeItem(STORAGE_KEY);
    } catch {

      /* storage unavailable */}
  }, []);

  const signIn = useCallback(
    (email: string, role: Role) => persist({ email, role, name: namesByRole[role] }),
    [persist]
  );

  const setGrade = useCallback(
    (grade: Grade) => {
      if (user) persist({ ...user, grade });
    },
    [persist, user]
  );

  const signOut = useCallback(() => persist(null), [persist]);

  const value = useMemo(() => ({ user, signIn, setGrade, signOut }), [user, signIn, setGrade, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}