"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-600">Redirecting to Admin Portal...</p>
      </div>
    </div>
  );
}
