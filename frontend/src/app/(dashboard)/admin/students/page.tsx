'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { useAdmin } from '@/contexts/AdminContext';
import { courses as catalog } from '@/data/courses';
import { initials, performanceLabel, subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

const gradeFilters: (Grade | 'all')[] = ['all', 1, 2, 3, 4, 5];

export default function AdminStudents() {
  const { students, addStudent } = useAdmin();
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState<Grade | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState<Grade>(1);
  const [nameError, setNameError] = useState(false);

  const visible = students.filter((s) => (grade === 'all' || s.grade === grade) && s.name.toLowerCase().includes(query.toLowerCase()));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return setNameError(true);
    addStudent(newName.trim(), newGrade);
    toast.success(`${newName.trim()} enrolled in Grade ${newGrade}`);
    setAddOpen(false);
    setNewName('');
    setNameError(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ink">Students</h1>
          <p className="mt-1 text-lg text-ink-soft">Search, check progress and enroll new learners.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" /> Add student
        </Button>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <label htmlFor="student-search" className="sr-only">Search students</label>
          <input
            id="student-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name"
            className="h-12 w-full rounded-2xl border-2 border-line pl-11 pr-4 text-base outline-none transition-colors duration-150 focus:border-ink" />
          
        </div>
        <div role="tablist" aria-label="Filter by grade" className="flex flex-wrap gap-2">
          {gradeFilters.map((g) =>
          <button
            key={g}
            role="tab"
            aria-selected={grade === g}
            onClick={() => setGrade(g)}
            className={`h-10 rounded-full px-4 text-sm font-extrabold transition-colors duration-150 ${grade === g ? 'bg-ink text-white' : 'bg-surface text-ink-soft hover:text-ink'}`}>
            
              {g === 'all' ? 'All' : `Grade ${g}`}
            </button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-line">
        {visible.length === 0 && <li className="rounded-3xl bg-surface p-8 text-center font-bold text-ink-soft">No students found.</li>}
        {visible.map((st) => {
          const perf = performanceLabel(st.avgScore);
          const open = expanded === st.id;
          const enrolled = catalog.filter((c) => st.courseIds.includes(c.id));
          const isNew = st.avgScore === 0;
          return (
            <li key={st.id}>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : st.id)}
                aria-expanded={open}
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left md:grid-cols-[auto_1.2fr_0.6fr_1fr_auto_auto]">
                
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">{initials(st.name)}</span>
                <span className="min-w-0">
                  <span className="block truncate font-black text-ink">{st.name}</span>
                  <span className="block text-sm text-ink-muted md:hidden">Grade {st.grade} · {enrolled.length} courses</span>
                </span>
                <span className="hidden text-sm font-bold text-ink-soft md:block">Grade {st.grade} · {enrolled.length} courses</span>
                <span className="hidden items-center gap-3 md:flex">
                  <ProgressBar value={st.progress} barClassName="bg-brand-500" label={`${st.name} progress`} />
                  <span className="w-10 shrink-0 text-sm font-extrabold text-ink-soft">{st.progress}%</span>
                </span>
                <span className={`hidden rounded-full px-2.5 py-1 text-xs font-extrabold md:inline-block ${isNew ? 'bg-surface text-ink-muted' : perf.className}`}>
                  {isNew ? 'New' : perf.label}
                </span>
                <ChevronDownIcon className={`h-5 w-5 text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              <AnimatePresence initial={false}>
                {open &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden">
                  
                    <div className="mb-4 grid gap-6 rounded-3xl bg-surface p-5 md:grid-cols-[1.5fr_1fr]">
                      <div>
                        <p className="text-xs font-extrabold text-ink-muted">Courses</p>
                        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                          {enrolled.map((c) => {
                          const s = subjectStyles[c.subject];
                          return (
                            <li key={c.id} className="flex items-center gap-2 rounded-2xl bg-white p-3">
                                <s.icon className={`h-4 w-4 ${s.text}`} aria-hidden="true" />
                                <span className="text-sm font-extrabold text-ink">{c.title}</span>
                              </li>);

                        })}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="font-bold text-ink-soft">Overall progress</span><span className="font-black text-ink">{st.progress}%</span></div>
                        <div className="flex justify-between text-sm"><span className="font-bold text-ink-soft">Average score</span><span className="font-black text-ink">{isNew ? '—' : `${st.avgScore}%`}</span></div>
                        <div className="flex justify-between text-sm"><span className="font-bold text-ink-soft">Last active</span><span className="font-black text-ink">{st.lastActive}</span></div>
                        {st.weakAreas.length > 0 &&
                      <p className="text-sm text-ink-soft">
                            <span className="font-bold">Working on:</span> {st.weakAreas.join(', ')}
                          </p>
                      }
                      </div>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </li>);

        })}
      </ul>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a student" description="They’ll be enrolled in every course for their grade.">
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div>
            <label htmlFor="new-name" className="mb-1.5 block text-sm font-bold text-ink">Full name</label>
            <input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              aria-invalid={nameError}
              className="h-12 w-full rounded-2xl border-2 border-line px-4 text-base outline-none transition-colors duration-150 focus:border-ink aria-[invalid=true]:border-danger-500" />
            
            {nameError && <p className="mt-1.5 text-sm font-semibold text-danger-700">Enter the student’s name</p>}
          </div>
          <div>
            <label htmlFor="new-grade" className="mb-1.5 block text-sm font-bold text-ink">Grade</label>
            <select
              id="new-grade"
              value={newGrade}
              onChange={(e) => setNewGrade(Number(e.target.value) as Grade)}
              className="h-12 w-full rounded-2xl border-2 border-line bg-white px-4 text-base outline-none focus:border-ink">
              
              {[1, 2, 3, 4, 5].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit">Add student</Button>
          </div>
        </form>
      </Modal>
    </div>);

}