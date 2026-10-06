'use client';
import type { BackendNotification } from '@/types/backend';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FlameIcon, HouseIcon, UserRoundIcon, VideoIcon, ZapIcon, BookOpenIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useProgress } from '@/contexts/ProgressContext';
import { studentAvatar } from '@/data/illustrations';
import { profileStats } from '@/data/profile';

const nav = [
  { to: '/dashboard', label: 'Home', icon: HouseIcon, exact: true },
  { to: '/dashboard/courses', label: 'Courses', icon: BookOpenIcon, exact: false },
  { to: '/dashboard/live', label: 'Live', icon: VideoIcon, exact: false },
  { to: '/dashboard/you', label: 'You', icon: UserRoundIcon, exact: false }
];

export default function StudentTopNav() {
  const pathname = usePathname();
  const { lessons, xpEarned } = useProgress();

  const completedCount = Object.values(lessons).filter((l) => l.status === 'completed').length;
  const inProgressCount = Object.values(lessons).filter((l) => l.status === 'in_progress').length;
  const dynamicStreak = completedCount > 0 ? Math.min(completedCount, 7) : 0;
  const dynamicXp = (completedCount * 50) + (inProgressCount * 15) + (xpEarned || 0);

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
              {dynamicStreak}
              <span className="sr-only">day streak</span>
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-extrabold text-brand-700 sm:inline-flex" title="Total XP">
              <ZapIcon className="h-4 w-4 fill-brand-500 text-brand-500" aria-hidden="true" />
              {dynamicXp.toLocaleString()}
              <span className="sr-only">XP</span>
            </span>
            <NotificationBell />
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

function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const loadNotifications = React.useCallback(() => {
    import('@/utils/learningApi').then(({ learningApi }) => {
      learningApi.listNotifications()
        .then((data) => {
          if (data?.items && Array.isArray(data.items)) {
            setItems(data.items);
            setUnreadCount(data.items.filter((n: BackendNotification) => !n.read).length);
          }
        })
        .catch(() => {});
    });
  }, []);

  React.useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const handleMarkAll = async () => {
    try {
      const { learningApi } = await import('@/utils/learningApi');
      await learningApi.markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkOne = async (id: string) => {
    try {
      const { learningApi } = await import('@/utils/learningApi');
      await learningApi.markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink cursor-pointer"
        aria-label="Notifications"
      >
        <span className="sr-only">Notifications</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border-2 border-line bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface/50">
            <span className="text-sm font-black text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-line">
            {items.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-ink-muted">
                No notifications yet.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkOne(n.id)}
                  className={`p-3 transition-colors cursor-pointer ${
                    n.read ? 'bg-white opacity-60' : 'bg-brand-50/40 hover:bg-brand-50'
                  }`}
                >
                  <p className="text-xs font-extrabold text-ink">{n.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}