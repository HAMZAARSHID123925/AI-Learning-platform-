'use client';
import React, { useEffect, useState } from 'react';
import { NumberLineVisual, formatTick } from '../visuals/NumberLineVisual';
import type { InteractionProps } from './types';

interface NumberLineSlideProps extends InteractionProps {
  min: number;
  max: number;
  step: number;
  target: number;
  labelAs?: 'decimal' | 'fraction' | 'integer';
  den?: number;
}

export function NumberLineSlide({ min, max, step, target, labelAs, den, solved, onSolved, tone }: NumberLineSlideProps) {
  const [value, setValue] = useState(min);

  useEffect(() => {
    if (!solved && Math.abs(value - target) < 1e-6) onSolved();
  }, [value, target, solved, onSolved]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <NumberLineVisual min={min} max={max} step={step} labelAs={labelAs} den={den} value={value} toneHex={tone.hex} />
      <p className="rounded-full bg-white px-4 py-1.5 text-xl font-black tabular-nums text-ink shadow-card" aria-live="polite">
        {formatTick(value, labelAs, den)}
      </p>
      <label className="w-full max-w-xl px-6">
        <span className="sr-only">Marker position</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={solved}
          onChange={(e) => setValue(Number(e.target.value))}
          className="elarion-range w-full" />
        
      </label>
    </div>);

}