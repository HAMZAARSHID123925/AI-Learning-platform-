'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { liveClasses as seed } from '@/data/liveClasses';
import type { LiveClass } from '@/types';

interface ClassesContextValue {
  classes: LiveClass[];
  addClass: (c: Omit<LiveClass, 'id'>) => void;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

const STORAGE_KEY = 'elarion-live-classes-v2';

export function ClassesProvider({ children }: {children: React.ReactNode;}) {
  const [classes, setClasses] = useState<LiveClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: LiveClass[] = JSON.parse(saved);
        return parsed.filter((c) => !c.id.startsWith('lc-g'));
      }
    } catch {}
    return [];
  });

  // Sync with backend live sessions
  useEffect(() => {
    async function syncBackendLiveSessions() {
      try {
        const { fetchWithAuth } = await import('@/lib/api');
        const res = await fetchWithAuth('/live-sessions');
        if (res.ok) {
          const sessions = await res.json();
          if (Array.isArray(sessions) && sessions.length > 0) {
            const mapped: LiveClass[] = sessions.map((s: any) => {
              const sched = new Date(s.scheduled_at);
              const now = new Date();
              const diffDays = Math.round((sched.getTime() - now.getTime()) / (1000 * 3600 * 24));
              const isLive = s.status === 'live';
              const hours = sched.getHours();
              const minutes = sched.getMinutes();
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
              
              return {
                id: s.id,
                grade: 5,
                subject: 'science',
                title: s.title,
                teacher: s.instructor_name || 'Instructor',
                dayOffset: Math.max(0, diffDays),
                time: formattedTime,
                duration: s.duration_minutes || 45,
                isLive,
                attendees: s.current_participants || 0
              };
            });
            setClasses((prev) => {
              const combined = [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(combined)); } catch {}
              return combined;
            });
          }
        }
      } catch {}
    }
    syncBackendLiveSessions();
  }, []);

  const addClass = useCallback((c: Omit<LiveClass, 'id'>) => {
    setClasses((prev) => {
      const updated = [{ ...c, id: `lc-${Date.now()}` }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const value = useMemo(() => ({ classes, addClass }), [classes, addClass]);
  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses(): ClassesContextValue {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used inside ClassesProvider');
  return ctx;
}