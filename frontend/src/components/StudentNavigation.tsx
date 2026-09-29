"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CircleUserRound, Flame, House, LucideIcon } from "lucide-react";
import { student } from "../data/student";
import { easeOutStrong } from "../utils/motion";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
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
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-2 items-center px-5 md:grid-cols-3 md:px-8">
          <Link
            href="/dashboard"
            className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="h-8 w-8 rounded-lg bg-white p-0.5 flex items-center justify-center border border-line shadow-xs">
              <img 
                src="/logo.png" 
                alt="PPAcademia" 
                className="h-6 w-auto object-contain" 
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">PPAcademia</span>
          </Link>

          <nav aria-label="Main" className="hidden justify-center md:flex">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      href={item.to}
                      className={`relative flex h-11 items-center gap-2 rounded-xl px-4 text-[15px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active ? 'text-primary' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl bg-primary-soft"
                          transition={{
                            duration: 0.25,
                            ease: easeOutStrong,
                          }}
                        />
                      )}
                      <IconComponent className="relative h-5 w-5" aria-hidden="true" />
                      <span className="relative">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex justify-end items-center gap-3">
            <span
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-streak-soft px-3 text-sm font-semibold text-streak"
              aria-label={`${streakCount} day streak`}
            >
              <Flame className="h-4 w-4" aria-hidden="true" />
              {streakCount}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid h-[72px] grid-cols-3">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const IconComponent = item.icon;
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 ${
                    active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <IconComponent className="h-6 w-6" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}