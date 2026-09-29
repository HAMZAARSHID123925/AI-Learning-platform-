"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CircleUserRound, Flame, House, Video, LogOut, LucideIcon } from "lucide-react";
import { student } from "../data/student";
import { easeOutStrong } from "../utils/motion";
import { clearAuthSession } from "@/lib/auth-storage";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: House,
    exact: true,
  },
  {
    to: '/dashboard/courses',
    label: 'Courses',
    icon: BookOpen,
  },
  {
    to: '/dashboard/live',
    label: 'Live Class',
    icon: Video,
    badge: 'Live',
  },
  {
    to: '/dashboard/you',
    label: 'You',
    icon: CircleUserRound,
  },
];

export function StudentNavigation() {
  const pathname = usePathname();
  const [streakCount, setStreakCount] = useState<number>(student.streakDays);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStreak = localStorage.getItem('streak_data');
        if (storedStreak) {
          const parsed = JSON.parse(storedStreak);
          if (parsed && typeof parsed.count === 'number') {
            setStreakCount(parsed.count);
          }
        }
      } catch (e) {
        // fallback to default student.streakDays
      }
    }
  }, []);

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.to;
    }
    return pathname.startsWith(item.to);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          
          {/* Logo Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 p-1 flex items-center justify-center border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <img 
                src="/logo.png" 
                alt="PPAcademia" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                PPAcademia
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">
                Primary Academy
              </span>
            </div>
          </Link>

          {/* Desktop Single-Row Navigation */}
          <nav aria-label="Main" className="hidden items-center justify-center md:flex">
            <ul className="flex items-center gap-1.5 flex-nowrap bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
              {navItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;
                return (
                  <li key={item.to} className="shrink-0">
                    <Link
                      href={item.to}
                      className={`relative flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active 
                          ? 'text-primary' 
                          : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl bg-white shadow-xs border border-slate-200/80"
                          transition={{
                            duration: 0.22,
                            ease: easeOutStrong,
                          }}
                        />
                      )}
                      <IconComponent className={`relative h-4.5 w-4.5 shrink-0 transition-colors ${active ? 'text-primary' : 'text-slate-500'}`} aria-hidden="true" />
                      <span className="relative whitespace-nowrap">{item.label}</span>
                      {item.badge && (
                        <span className="relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider leading-none shrink-0 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right Streak Counter & Logout */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            <span
              className="inline-flex h-10 items-center gap-2 rounded-full bg-amber-50/90 border border-amber-200/80 px-3.5 text-sm font-black text-amber-700 shadow-xs whitespace-nowrap"
              aria-label={`${streakCount} day streak`}
            >
              <Flame className="h-4.5 w-4.5 fill-amber-500 text-amber-500 animate-pulse" aria-hidden="true" />
              <span>{streakCount}</span>
            </span>

            <button
              type="button"
              onClick={() => {
                clearAuthSession();
                window.location.href = '/login';
              }}
              title="Log out of your account"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/90 bg-white hover:bg-red-50 hover:border-red-200 px-4 text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 transition-all duration-150 shadow-xs active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid h-[72px] grid-cols-4">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const IconComponent = item.icon;
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 relative ${
                    active ? 'text-primary font-bold' : 'text-muted'
                  }`}
                >
                  <div className="relative">
                    <IconComponent className="h-5 w-5" aria-hidden="true" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}