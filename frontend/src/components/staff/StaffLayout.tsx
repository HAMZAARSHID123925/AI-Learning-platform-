'use client';
import type { LucideIcon } from 'lucide-react';

import React from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { LogOutIcon } from "lucide-react";
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { initials } from '@/utils/subjects';

export interface StaffNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface StaffLayoutProps {
  roleLabel: string;
  children?: React.ReactNode;
  nav: StaffNavItem[];
  secondaryTitle?: string;
  secondary?: StaffNavItem[];
}

export default function StaffLayout({
  roleLabel,
  children,
  nav,
  secondaryTitle,
  secondary
}: StaffLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const all = [...nav, ...(secondary ?? [])];

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  const getLinkClass = (to: string, end?: boolean) => {
    const isActive = end ? pathname === to : pathname.startsWith(to);
    return `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-[15px] font-extrabold transition-colors duration-150 ${
      isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:text-ink'
    }`;
  };

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line p-5 lg:flex">
        <Logo />
        <p className="mt-1 pl-10 text-xs font-extrabold text-ink-muted">{roleLabel}</p>
        <nav aria-label="Main" className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link key={item.to} href={item.to} className={getLinkClass(item.to, item.end)}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        {secondary && secondary.length > 0 && (
          <div className="mt-8">
            <p className="px-3 text-xs font-extrabold text-ink-muted">{secondaryTitle}</p>
            <nav aria-label={secondaryTitle} className="mt-2 space-y-1">
              {secondary.map((item) => (
                <Link key={item.to} href={item.to} className={getLinkClass(item.to, item.end)}>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-surface p-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-black text-white">
            {initials(user?.name ?? '')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-xl text-ink-muted transition-colors duration-150 hover:bg-white hover:text-ink"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
        <div className="flex h-14 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-muted hover:text-ink"
          >
            <LogOutIcon className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-2">
          {all.map((item) => (
            <Link key={item.to} href={item.to} className={getLinkClass(item.to, item.end)}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
      >
        {children}
      </motion.main>
    </div>
  );
}