'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FlameIcon, HouseIcon, UserRoundIcon, VideoIcon, ZapIcon, BookOpenIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useProgress } from '@/contexts/student/ProgressContext';
import { studentAvatar } from '@/data/student/illustrations';
import { profileStats } from '@/data/student/profile';

const nav = [
  { to: '/dashboard', label: 'Home', icon: HouseIcon, exact: true },
  { to: '/dashboard/courses', label: 'Courses', icon: BookOpenIcon, exact: false },
  { to: '/dashboard/live', label: 'Live', icon: VideoIcon, exact: false },
  { to: '/dashboard/you', label: 'You', icon: UserRoundIcon, exact: false }
];

export default function StudentTopNav() {
  const pathname = usePathname();
  const { xpEarned } = useProgress();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/dashboard" aria-label="ELARION home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] font-extrabold transition-colors duration-150 ${
                    isActive ? 'bg-surface text-ink' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-streak-50 px-3 py-1.5 text-sm font-extrabold text-streak-700" title="Day streak">
              <FlameIcon className="h-4 w-4 fill-streak-500 text-streak-500" aria-hidden="true" />
              {profileStats.streak}
              <span className="sr-only">day streak</span>
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-extrabold text-brand-700 sm:inline-flex" title="Total XP">
              <ZapIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" />
              {(profileStats.xp + xpEarned).toLocaleString()}
              <span className="sr-only">XP</span>
            </span>
            <Link href="/dashboard/you" aria-label="Your profile" className="ml-1">
              <img src={studentAvatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
            </Link>
          </div>
        </div>
      </header>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {nav.map((item) => {
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-xs font-extrabold transition-colors duration-150 ${
                    isActive ? 'text-brand-500' : 'text-ink-muted'
                  }`}
                >
                  <item.icon className="h-6 w-6" aria-hidden="true" />
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