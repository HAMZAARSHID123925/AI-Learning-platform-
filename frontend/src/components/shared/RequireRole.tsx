'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

export function RequireRole({ role, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      router.replace(user.role === 'student' ? '/dashboard' : user.role === 'teacher' ? '/instructor' : '/admin');
      return;
    }

    if (allowedRoles.includes('student') && user.role === 'student' && !user.grade) {
      router.replace('/onboarding/grade');
    }
  }, [user, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink border-t-transparent" />
      </div>
    );
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!user || !allowedRoles.includes(user.role) || (user.role === 'student' && !user.grade)) {
    return null;
  }

  return <>{children}</>;
}