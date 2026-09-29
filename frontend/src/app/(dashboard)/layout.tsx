"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import AIStudyBuddy from '@/components/AIStudyBuddy';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isElarionCorePage =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/courses') ||
    pathname === '/dashboard/you';

  const isLessonLearnPage = pathname.includes('/learn');

  if (isElarionCorePage) {
    if (isLessonLearnPage) {
      return (
        <div className="min-h-screen bg-canvas text-ink antialiased selection:bg-primary selection:text-white relative">
          {children}
        </div>
      );
    }
    return <AppLayout>{children}</AppLayout>;
  }

  // Secondary studio tools (AI Exam, Simulator, Live, etc.) retain their full-width layout and AI Study Buddy
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 antialiased selection:bg-[#027FFF] selection:text-white relative">
      {children}
      <AIStudyBuddy />
    </div>
  );
}
