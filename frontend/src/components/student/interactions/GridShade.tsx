'use client';
import React, { useEffect, useState } from 'react';
import { DecimalGridVisual } from '../visuals/DecimalGridVisual';
import type { InteractionProps } from './types';

export function GridShade({ target, solved, onSolved, tone }: InteractionProps & {target: number;}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!solved && value === target) onSolved();
  }, [value, target, solved, onSolved]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <DecimalGridVisual shaded={value} tone={tone} />
      <p className="rounded-full bg-white px-4 py-1.5 text-xl font-black tabular-nums text-ink shadow-card" aria-live="polite">
        {(value / 100).toFixed(2)}
      </p>
      <label className="w-full">
        <span className="sr-only">Hundredths shaded</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          disabled={solved}
          onChange={(e) => setValue(Number(e.target.value))}
          className="elarion-range w-full" />
        
      </label>
    </div>);

}