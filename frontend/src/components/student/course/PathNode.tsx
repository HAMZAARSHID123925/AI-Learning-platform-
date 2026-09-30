'use client';
import React from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, LockIcon, BoxIcon } from "lucide-react";
export type PathNodeState = 'completed' | 'current' | 'locked';
interface PathNodeProps {
  state: PathNodeState;
  href?: string;
  to?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  meta: string;
  title: string;
  note?: string;
  cta?: string;
  solidClass: string;
  ringClass: string;
  offsetClass: string;
}
export function PathNode({
  state,
  href,
  to,
  icon: Icon,
  meta,
  title,
  note,
  cta,
  solidClass,
  ringClass,
  offsetClass
}: PathNodeProps) {
  const circle = state === 'locked' ? 'bg-surface text-ink-muted shadow-[0_5px_0_0_#E8E9EE]' : state === 'current' ? `${solidClass} text-white shadow-[0_5px_0_0_rgba(22,24,29,0.28)] ring-8 ${ringClass}` : `${solidClass} text-white shadow-[0_5px_0_0_rgba(22,24,29,0.22)]`;
  const content = <>
      <span className={`grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full transition-transform duration-150 ease-out group-active:translate-y-[4px] ${circle}`} aria-hidden="true">
        {state === 'completed' ? <CheckIcon className="h-8 w-8" strokeWidth={3} /> : state === 'locked' ? <LockIcon className="h-7 w-7" /> : <Icon className="h-8 w-8" />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-extrabold text-ink-muted">{meta}</span>
        <span className={`block text-lg font-black leading-tight ${state === 'locked' ? 'text-ink-muted' : 'text-ink'}`}>{title}</span>
        {note && <span className="mt-0.5 block text-sm font-bold text-ink-soft">{note}</span>}
        {state === 'current' && cta && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-sm font-extrabold text-white">
            {cta} <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </span>}
      </span>
    </>;
  return <li className={offsetClass}>
      {state === 'locked' ? <div className="flex items-center gap-5" aria-disabled="true">
          {content}
          <span className="sr-only">Locked</span>
        </div> : <Link href={href || to || '#'} className="group inline-flex items-center gap-5 rounded-3xl pr-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100">
          {content}
        </Link>}
    </li>;
}