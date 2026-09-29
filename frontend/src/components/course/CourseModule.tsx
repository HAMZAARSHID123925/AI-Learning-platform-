import React from 'react';
import { PathRow, RailLine } from './PathRow';
import { CourseModule as CourseModuleData } from '../../types/learning';

interface CourseModuleProps {
  module: CourseModuleData;
  top: RailLine;
  bottom: RailLine;
  index: number;
}

export function CourseModule({ module, top, bottom, index }: CourseModuleProps) {
  const done = module.lessons.every((l) => l.status === 'completed');
  const completedCount = module.lessons.filter((l) => l.status === 'completed').length;

  return (
    <PathRow
      index={index}
      top={top}
      bottom={bottom}
      node={<span className={`block h-3.5 w-3.5 rounded-full ring-4 ring-canvas ${done || top === 'reached' || bottom === 'reached' ? 'bg-success' : 'bg-line'}`} />}>
      
      <div className="flex items-baseline justify-between gap-3 pb-1 pt-4">
        <div>
          <p className="text-sm text-muted">{module.label}</p>
          <h3 className="text-lg font-semibold tracking-tight">{module.title}</h3>
        </div>
        <span className="shrink-0 text-sm tabular-nums text-muted">
          {completedCount}/{module.lessons.length}
        </span>
      </div>
    </PathRow>);

}