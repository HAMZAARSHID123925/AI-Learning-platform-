'use client';
import React, { useEffect, useState } from 'react';
import { PizzaVisual } from '../visuals/PizzaVisual';
import type { InteractionProps } from './types';

export function PizzaShade({ slices, target, solved, onSolved }: InteractionProps & {slices: number;target: number;}) {
  const [shaded, setShaded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!solved && shaded.size === target) onSolved();
  }, [shaded, target, solved, onSolved]);

  const toggle = (i: number) =>
  setShaded((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i);else
    next.add(i);
    return next;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <PizzaVisual slices={slices} shaded={shaded} onToggle={toggle} disabled={solved} />
      <p className="rounded-full bg-white px-4 py-1.5 text-base font-black text-ink shadow-card" aria-live="polite">
        {shaded.size}/{slices} shaded
      </p>
    </div>);

}