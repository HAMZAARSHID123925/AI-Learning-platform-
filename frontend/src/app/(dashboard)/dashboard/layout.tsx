'use client';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ClassesProvider } from '@/contexts/ClassesContext';
import StudentTopNav from '@/components/student/StudentTopNav';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthProvider>
      <ProgressProvider>
        <ClassesProvider>
          <StudentTopNav />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 md:pb-16"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </ClassesProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
