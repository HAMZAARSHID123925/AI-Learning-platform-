'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== role) {
      router.replace(user.role === 'student' ? '/dashboard' : user.role === 'teacher' ? '/instructor' : '/admin');
    } else if (role === 'student' && !user.grade) {
      router.replace('/onboarding/grade');
    }
  }, [user, role, router]);

  if (!user || user.role !== role || (role === 'student' && !user.grade)) {
    return null;
  }

  return <>{children}</>;
}