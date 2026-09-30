'use client';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { liveClasses as seed } from '@/data/student/liveClasses';
import type { LiveClass } from '@/types/student';

interface ClassesContextValue {
  classes: LiveClass[];
  addClass: (c: Omit<LiveClass, 'id'>) => void;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

export function ClassesProvider({ children }: {children: React.ReactNode;}) {
  const [classes, setClasses] = useState<LiveClass[]>(seed);

  const addClass = useCallback((c: Omit<LiveClass, 'id'>) => {
    setClasses((prev) => [...prev, { ...c, id: `lc-${Date.now()}` }]);
  }, []);

  const value = useMemo(() => ({ classes, addClass }), [classes, addClass]);
  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses(): ClassesContextValue {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used inside ClassesProvider');
  return ctx;
}