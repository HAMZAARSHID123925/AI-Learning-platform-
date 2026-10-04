'use client';

import React from 'react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Pen & Page Academia logo"
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line"
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-[14px] font-black text-ink">Pen & Page Academia</span>
          <span className="mt-1 whitespace-nowrap text-[11px] font-bold text-ink-muted">Junior School</span>
        </span>
      )}
    </span>
  );
}