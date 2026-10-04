'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClassesProvider } from '@/contexts/ClassesContext';
import { AdminProvider } from '@/contexts/AdminContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClassesProvider>
        <AdminProvider>
          <div className="min-h-screen w-full bg-white text-ink antialiased">
            {children}
          </div>
        </AdminProvider>
      </ClassesProvider>
    </AuthProvider>
  );
}
