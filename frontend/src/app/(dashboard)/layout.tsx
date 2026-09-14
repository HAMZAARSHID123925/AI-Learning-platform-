"use client";

import { SSEProvider } from '@/components/SSEProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SSEProvider>
      <div className="min-h-screen bg-[#0B1221] text-slate-200">
        {children}
      </div>
    </SSEProvider>
  );
}
