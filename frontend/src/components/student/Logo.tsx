'use client';
import React from 'react';
import { brand } from '@/data/brand';

interface LogoProps {
  /** Show only the school crest + ELARION wordmark (used in tight spaces). */
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-3">
      <img
        src={brand.schoolLogo}
        alt={`${brand.schoolName} ${brand.schoolSubtitle} logo`}
        className="h-10 w-10 shrink-0 rounded-full bg-white object-cover ring-1 ring-line"
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-[14px] font-black text-ink">{brand.schoolName}</span>
          <span className="mt-1 whitespace-nowrap text-[11px] font-bold text-ink-muted">{brand.schoolSubtitle}</span>
        </span>
      )}
    </span>
  );
}