'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/login' }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // If student tries to access admin or teacher, redirect to their own dashboard
      if (user.role === 'student') {
        router.replace('/dashboard');
      } else if (user.role === 'teacher') {
        router.replace('/instructor');
      } else {
        router.replace('/admin');
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-bold text-ink-muted">Verifying permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
