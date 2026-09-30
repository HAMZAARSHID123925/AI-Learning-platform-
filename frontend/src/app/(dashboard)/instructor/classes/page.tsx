'use client';

import React, { useState } from 'react';
import { CalendarPlusIcon, RadioIcon } from 'lucide-react';
import { Button } from '@/components/all_dashbord/Button';
import { ClassList } from '@/components/all_dashbord/teacher/ClassList';
import { ScheduleClassModal } from '@/components/all_dashbord/teacher/ScheduleClassModal';
import { useTeacher } from '@/hooks/all_dashbord/useTeacher';

export default function TeacherClasses() {
  const { teacher, myCourses, myClasses } = useTeacher();
  const [modal, setModal] = useState<null | 'schedule' | 'now'>(null);
  const live = myClasses.filter((c) => c.isLive);
  const upcoming = myClasses.filter((c) => !c.isLive);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Live classes</h1>
          <p className="mt-1 text-lg text-ink-soft">Only students in your courses can see and join these.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModal('schedule')}>
            <CalendarPlusIcon className="h-4 w-4" aria-hidden="true" /> Schedule
          </Button>
          <Button variant="brand" onClick={() => setModal('now')}>
            <RadioIcon className="h-4 w-4" aria-hidden="true" /> Go live
          </Button>
        </div>
      </header>

      {live.length > 0 &&
      <section aria-labelledby="live-title" className="rounded-[28px] bg-danger-50 px-6 py-2">
          <h2 id="live-title" className="sr-only">Live now</h2>
          <ClassList classes={live} emptyText="" />
        </section>
      }

      <section aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="text-xl font-black text-ink">Upcoming</h2>
        <div className="mt-2">
          <ClassList classes={upcoming} emptyText="Nothing scheduled yet." />
        </div>
      </section>

      <ScheduleClassModal
        open={modal !== null}
        onClose={() => setModal(null)}
        courses={myCourses.map((m) => m.course)}
        teacherName={teacher.name}
        defaultMode={modal ?? 'schedule'} />
      
    </div>);

}