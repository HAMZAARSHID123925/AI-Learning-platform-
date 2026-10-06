'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { courses } from '@/data/courses';
import { subjectStyles } from '@/utils/subjects';
import type { Grade } from '@/types';

const grades: Grade[] = [1, 2, 3, 4, 5];

export default function ChooseGrade() { return <AuthProvider><ChooseGradeInner /></AuthProvider>; }
function ChooseGradeInner() {
  const { user, loading, setGrade } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Grade | null>(user?.grade ?? null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'student') {
      router.replace(user.role === 'teacher' ? '/instructor' : '/admin');
    }
  }, [user, loading, router]);

  const preview = selected ? courses.filter((c) => c.grade === selected) : [];

  const handleContinue = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    try { await setGrade(selected); router.push('/dashboard'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save your grade.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen w-full bg-white px-6 py-8 sm:px-12">
      <Logo />
      <main className="mx-auto max-w-3xl py-14 text-center">
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl">Choose your Grade</h1>
        <p className="mt-3 text-lg text-ink-soft">We’ll pick lessons that are just right for you.</p>

        <div role="radiogroup" aria-label="Grade" className="mt-10 grid grid-cols-5 gap-3 sm:gap-4">
          {grades.map((g) => {
            const active = g === selected;
            return (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(g)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-3xl border-2 transition-[border-color,background-color,transform,box-shadow] duration-150 ease-out active:scale-[0.97] ${
                active ? 'border-ink bg-ink text-white shadow-[0_4px_0_0_#000]' : 'border-line bg-white text-ink shadow-[0_4px_0_0_#E8E9EE] hover:border-ink/30'}`
                }>
                
                {active &&
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-science-500">
                    <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
                  </span>
                }
                <span className={`text-xs font-bold sm:text-sm ${active ? 'text-white/70' : 'text-ink-muted'}`}>Grade</span>
                <span className="text-3xl font-black sm:text-5xl">{g}</span>
              </button>);

          })}
        </div>

        <div className="min-h-[132px]">
          <AnimatePresence mode="wait">
            {selected &&
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mt-10">
              
                <p className="text-sm font-bold text-ink-muted">You’ll explore</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-2">
                  {preview.map((c) => {
                  const s = subjectStyles[c.subject];
                  return (
                    <li key={c.id} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold ${s.bg} ${s.text}`}>
                        <s.icon className="h-4 w-4" aria-hidden="true" />
                        {c.title}
                      </li>);

                })}
                </ul>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
        <Button size="lg" className="mt-4 w-full max-w-xs" disabled={loading || saving || !selected} onClick={handleContinue}>
          Let’s go <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </main>
    </div>);

}