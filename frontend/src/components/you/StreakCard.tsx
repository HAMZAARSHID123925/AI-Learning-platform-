import React from 'react';
import { Check, Flame } from 'lucide-react';
import { WeekDay } from '../../types/student';

interface StreakCardProps {
  days: number;
  week: WeekDay[];
}

export function StreakCard({ days, week }: StreakCardProps) {
  return (
    <section aria-labelledby="streak-title" className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card md:p-8">
      <h2 id="streak-title" className="text-lg font-semibold">Streak</h2>
      <p className="mt-4 flex items-center gap-2 text-4xl font-semibold tracking-tight">
        <Flame className="h-9 w-9 text-streak" aria-hidden="true" />
        {days} days
      </p>

      <ol className="mt-auto grid grid-cols-7 gap-2 pt-8" aria-label="This week">
        {week.map((d) =>
        <li key={d.short} className="flex flex-col items-center gap-2">
            <span
            className={`grid h-10 w-10 place-items-center rounded-full ${
            d.done ? 'bg-streak text-white' : 'border-2 border-line bg-white'} ${
            d.isToday ? 'ring-2 ring-ink ring-offset-2' : ''}`}
            aria-label={`${d.short}: ${d.done ? 'learned' : 'no activity'}${d.isToday ? ', today' : ''}`}>
            
              {d.done && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
            </span>
            <span className={`text-xs ${d.isToday ? 'font-semibold text-ink' : 'text-muted'}`}>{d.short}</span>
          </li>
        )}
      </ol>
    </section>);

}