import React from 'react';
import { CourseModule } from './CourseModule';
import { LessonItem } from './LessonItem';
import { RailLine } from './PathRow';
import { CourseModule as CourseModuleData, Lesson } from '../../types/learning';

interface LearningPathProps {
  modules: CourseModuleData[];
  courseId: string;
}

type Entry =
{kind: 'module';module: CourseModuleData;reached: boolean;} |
{kind: 'lesson';lesson: Lesson;reached: boolean;};

const isReached = (l: Lesson) => l.status === 'completed' || l.status === 'current';

export function LearningPath({ modules, courseId }: LearningPathProps) {
  const entries: Entry[] = [];
  modules.forEach((m) => {
    if (!m.isFinal) entries.push({ kind: 'module', module: m, reached: m.lessons.length > 0 && isReached(m.lessons[0]) });
    m.lessons.forEach((l) => entries.push({ kind: 'lesson', lesson: l, reached: isReached(l) }));
  });

  const lineFor = (entry: Entry | undefined): RailLine => !entry ? 'none' : entry.reached ? 'reached' : 'pending';

  return (
    <ol aria-label="Learning path">
      {entries.map((entry, i) => {
        const top: RailLine = i === 0 ? 'none' : lineFor(entry);
        const bottom: RailLine = i === entries.length - 1 ? 'none' : lineFor(entries[i + 1]);
        return entry.kind === 'module' ?
        <CourseModule key={entry.module.id} module={entry.module} top={top} bottom={bottom} index={i} /> :

        <LessonItem key={entry.lesson.id} lesson={entry.lesson} courseId={courseId} top={top} bottom={bottom} index={i} />;

      })}
    </ol>);

}