"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, MotionConfig } from 'framer-motion';
import { StudentNavigation } from './StudentNavigation';
import { LearningProvider } from '../contexts/LearningContext';
import { easeOutStrong } from '../utils/motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <LearningProvider>
        <div className="min-h-screen w-full bg-canvas text-ink font-sans">
          <StudentNavigation />
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: easeOutStrong }}
            className="pb-28 md:pb-16"
          >
            {children}
          </motion.main>
        </div>
      </LearningProvider>
    </MotionConfig>
  );
}