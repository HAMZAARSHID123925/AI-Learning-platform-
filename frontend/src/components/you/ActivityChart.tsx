import React from 'react';
import { motion } from 'framer-motion';
import { DayAverage } from '../../types/student';
import { easeOutStrong } from '../../utils/motion';

export function ActivityChart({ days }: {days: DayAverage[];}) {
  const max = Math.max(...days.map((d) => d.lessons));
  const top = days.reduce((a, b) => b.lessons > a.lessons ? b : a, days[0]);

  return (
    <section aria-labelledby="activity-title" className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-card md:p-8">
      <h2 id="activity-title" className="text-lg font-semibold">Your most active day</h2>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{top.day}</p>
      <p className="text-muted">{top.lessons} lessons</p>

      <div
        className="mt-auto flex h-36 items-stretch gap-2 pt-8"
        role="img"
        aria-label={`Lessons per day: ${days.map((d) => `${d.short} ${d.lessons}`).join(', ')}`}>
        
        {days.map((d, i) => {
          const isTop = d.short === top.short;
          return (
            <div key={d.short} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end justify-center">
                <motion.div
                  className={`w-full max-w-[36px] rounded-lg ${isTop ? 'bg-primary' : 'bg-line'}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${d.lessons / max * 100}%` }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: easeOutStrong }} />
                
              </div>
              <span className={`text-xs ${isTop ? 'font-semibold text-ink' : 'text-muted'}`}>{d.short}</span>
            </div>);

        })}
      </div>
    </section>);

}