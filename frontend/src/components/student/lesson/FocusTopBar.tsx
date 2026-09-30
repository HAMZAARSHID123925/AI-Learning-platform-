'use client';
import React from 'react';
import Link from 'next/link';
import { XIcon } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';

interface FocusTopBarProps {
  exitTo: string;
  title: string;
  subtitle?: string;
  progress: number;
  barClassName: string;
  right?: React.ReactNode;
}

export function FocusTopBar({ exitTo, title, subtitle, progress, barClassName, right }: FocusTopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-5 sm:px-8">
        <Link href={exitTo} aria-label="Exit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-ink">
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 truncate text-xs font-extrabold text-ink-soft">
            {title}
            {subtitle && <span className="text-ink-muted"> · {subtitle}</span>}
          </p>
          <ProgressBar value={progress} barClassName={barClassName} label={`${title} progress`} />
        </div>
        {right}
      </div>
    </header>);

}