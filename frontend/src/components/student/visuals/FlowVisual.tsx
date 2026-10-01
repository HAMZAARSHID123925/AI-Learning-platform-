'use client';
import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { flowIcons } from './flowIcons';
import type { IconKey } from '@/types/learning';
import type { SubjectStyle } from '@/utils/subjects';

interface FlowVisualProps {
  nodes: {icon: IconKey;label: string;}[];
  tone: SubjectStyle;
}

export function FlowVisual({ nodes, tone }: FlowVisualProps) {
  return (
    <ol className="flex flex-wrap items-start justify-center gap-x-2 gap-y-5" aria-label={nodes.map((n) => n.label).join(' then ')}>
      {nodes.map((n, i) => {
        const Icon = flowIcons[n.icon];
        return (
          <li key={`${n.label}-${i}`} className="flex items-start gap-2">
            <div className="flex w-24 flex-col items-center gap-2 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-[0_4px_0_0_rgba(22,24,29,0.08)]">
                <Icon className={`h-8 w-8 ${tone.text}`} aria-hidden="true" />
              </span>
              <span className="text-sm font-extrabold leading-tight text-ink">{n.label}</span>
            </div>
            {i < nodes.length - 1 && <ArrowRightIcon className="mt-5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />}
          </li>);

      })}
    </ol>);

}