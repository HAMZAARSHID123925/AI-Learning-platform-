import React from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { Course } from '../types/learning';
import { easeOutStrong } from '../utils/motion';

interface CourseGridProps {
  courses: Course[];
  columns?: 3 | 4;
}

export function CourseGrid({ courses, columns = 3 }: CourseGridProps) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {courses.map((course, i) =>
      <motion.li
        key={course.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: Math.min(i * 0.04, 0.2), ease: easeOutStrong }}>
        
          <CourseCard course={course} />
        </motion.li>
      )}
    </ul>);

}