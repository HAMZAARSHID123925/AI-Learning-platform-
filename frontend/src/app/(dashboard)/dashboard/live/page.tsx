'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BellIcon, BellRingIcon, ClockIcon, UsersIcon, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/all_dashbord/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/contexts/ClassesContext';
import { subjectImages } from '@/data/all_dashbord/illustrations';
import { courseName, subjectStyles } from '@/utils/all_dashbord/subjects';
import { dateFromOffset, relativeDayLabel, timeToMinutes } from '@/utils/all_dashbord/dates';

const week = Array.from({ length: 7 }, (_, i) => i);

export default function Live() {
  const { user } = useAuth();
  const grade = user?.grade ?? 5;
  const { classes } = useClasses();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [joined, setJoined] = useState<string | null>(null);

  const mine = classes.filter((c) => c.grade === grade);
  const liveNow = mine.find((c) => c.isLive);
  const upcoming = useMemo(
    () =>
    mine.
    filter((c) => !c.isLive && c.dayOffset >= 0).
    sort((a, b) => a.dayOffset - b.dayOffset || timeToMinutes(a.time) - timeToMinutes(b.time)),
    [mine]
  );
  const visible = selectedDay === null ? upcoming : upcoming.filter((c) => c.dayOffset === selectedDay);
  const days = Array.from(new Set(visible.map((c) => c.dayOffset)));

  const toggleReminder = (id: string, title: string) => {
    setReminders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else
      {
        next.add(id);
        toast.success(`We’ll remind you before “${title}”`);
      }
      return next;
    });
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Live classes</h1>
        <p className="mt-2 text-lg text-ink-soft">Learn together with your teachers and classmates.</p>
      </header>

      {liveNow ?
      <section aria-labelledby="live-now" className={`grid overflow-hidden rounded-[28px] ${subjectStyles[liveNow.subject].bg} md:grid-cols-[1.2fr_1fr]`}>
          <div className="p-7 sm:p-9">
            <p id="live-now" className="inline-flex items-center gap-2 rounded-full bg-danger-500 px-3 py-1 text-sm font-extrabold text-white">
              <span className="relative flex h-2 w-2">
                <motion.span className="absolute inline-flex h-full w-full rounded-full bg-white" animate={{ scale: [1, 2], opacity: [0.8, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live now
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">{liveNow.title}</h2>
            <dl className="mt-4 space-y-1.5 text-base">
              <div className="flex gap-2"><dt className="font-bold text-ink-soft">Teacher</dt><dd className="font-extrabold text-ink">{liveNow.teacher}</dd></div>
              <div className="flex gap-2"><dt className="font-bold text-ink-soft">Course</dt><dd className="font-extrabold text-ink">{courseName(liveNow.grade, liveNow.subject)}</dd></div>
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button
              size="lg"
              variant={joined === liveNow.id ? 'secondary' : 'primary'}
              onClick={() => {
                setJoined(liveNow.id);
                toast.success(`Joining ${liveNow.teacher}’s class…`);
              }}>
              
                <VideoIcon className="h-5 w-5" aria-hidden="true" />
                {joined === liveNow.id ? 'Joined' : 'Join class'}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft">
                <UsersIcon className="h-4 w-4" aria-hidden="true" /> {liveNow.attendees} classmates here
              </span>
            </div>
          </div>
          <img src={subjectImages[liveNow.subject]} alt="" className="order-first h-48 w-full object-cover md:order-none md:h-full" />
        </section> :

      <section className="rounded-[28px] border-2 border-dashed border-line p-8 text-center">
          <p className="text-lg font-extrabold text-ink">No class is live right now</p>
          <p className="mt-1 text-ink-soft">Check the schedule below for your next one.</p>
        </section>
      }

      <section aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="text-2xl font-black text-ink">Upcoming classes</h2>

        <div role="tablist" aria-label="Pick a day" className="mt-5 grid grid-cols-7 gap-2">
          {week.map((d) => {
            const date = dateFromOffset(d);
            const count = upcoming.filter((c) => c.dayOffset === d).length;
            const active = selectedDay === d;
            return (
              <button
                key={d}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDay(active ? null : d)}
                className={`flex flex-col items-center rounded-2xl border-2 py-3 transition-[border-color,background-color,transform] duration-150 active:scale-[0.97] ${
                active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/30'}`
                }>
                
                <span className={`text-xs font-bold ${active ? 'text-white/70' : 'text-ink-muted'}`}>{format(date, 'EEE')}</span>
                <span className="text-xl font-black">{format(date, 'd')}</span>
                <span className="mt-1 flex h-1.5 gap-0.5" aria-label={`${count} classes`}>
                  {Array.from({ length: count }, (_, i) =>
                  <span key={i} className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-brand-500'}`} />
                  )}
                </span>
              </button>);

          })}
        </div>

        <div className="mt-8 space-y-8">
          {days.length === 0 && <p className="rounded-3xl bg-surface p-8 text-center font-bold text-ink-soft">No classes on this day. Enjoy the break!</p>}
          {days.map((d) =>
          <div key={d} className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <div>
                <p className="text-lg font-black text-ink">{relativeDayLabel(d)}</p>
                <p className="text-sm font-bold text-ink-muted">{format(dateFromOffset(d), 'MMM d')}</p>
              </div>
              <ul className="space-y-3">
                {visible.
              filter((c) => c.dayOffset === d).
              map((c) => {
                const s = subjectStyles[c.subject];
                const on = reminders.has(c.id);
                return (
                  <li key={c.id} className="flex items-center gap-4 rounded-3xl border-2 border-line bg-white p-4 sm:p-5">
                        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${s.bg}`} aria-hidden="true">
                          <s.icon className={`h-6 w-6 ${s.text}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-black text-ink">{c.title}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-soft">
                            <span className="inline-flex items-center gap-1 font-bold text-ink"><ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />{c.time}</span>
                            <span>{c.teacher}</span>
                            <span className={`font-bold ${s.text}`}>{courseName(c.grade, c.subject)}</span>
                          </p>
                        </div>
                        <button
                      type="button"
                      onClick={() => toggleReminder(c.id, c.title)}
                      aria-pressed={on}
                      aria-label={on ? 'Remove reminder' : 'Remind me'}
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors duration-150 ${on ? 'bg-brand-500 text-white' : 'bg-surface text-ink-soft hover:text-ink'}`}>
                      
                          {on ? <BellRingIcon className="h-5 w-5" /> : <BellIcon className="h-5 w-5" />}
                        </button>
                      </li>);

              })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>);

}