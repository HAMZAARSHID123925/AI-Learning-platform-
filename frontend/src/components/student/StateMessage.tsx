'use client';
import React from 'react';
import { AlertCircleIcon, Loader2Icon, SparklesIcon } from 'lucide-react';
import { Button } from './Button';

interface StateMessageProps {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  action?: React.ReactNode;
  onRetry?: () => void;
}

export function StateMessage({ kind, title, message, action, onRetry }: StateMessageProps) {
  if (kind === 'loading') {
    return (
      <div role="status" className="grid min-h-[40vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-ink-muted">
          <Loader2Icon className="h-7 w-7 animate-spin" aria-hidden="true" />
          <p className="text-sm font-bold">{title ?? 'Loading…'}</p>
        </div>
      </div>);

  }
  const Icon = kind === 'error' ? AlertCircleIcon : SparklesIcon;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-[28px] border-2 border-dashed border-line px-8 py-12 text-center">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${kind === 'error' ? 'bg-danger-50 text-danger-700' : 'bg-brand-50 text-brand-700'}`} aria-hidden="true">
        <Icon className="h-7 w-7" />
      </span>
      <p className="mt-4 text-lg font-black text-ink">{title ?? (kind === 'error' ? 'Something went wrong' : 'Nothing here yet')}</p>
      {message && <p className="mt-1 text-ink-soft">{message}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
        {action}
      </div>
    </div>);

}