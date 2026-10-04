'use client';
import React, { useEffect, useState } from 'react';
import { BalanceVisual } from '../visuals/BalanceVisual';
import type { InteractionProps } from './types';

interface BalanceSolveProps extends InteractionProps {
  op: '+' | '×';
  a: number;
  b: number;
  max: number;
}

export function BalanceSolve({ op, a, b, max, solved, onSolved, tone }: BalanceSolveProps) {
  const [x, setX] = useState(0);
  const left = op === '+' ? x + a : a * x;
  const tilt = Math.max(-14, Math.min(14, (b - left) * 3));

  useEffect(() => {
    if (!solved && left === b) onSolved();
  }, [left, b, solved, onSolved]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <BalanceVisual left={op === '+' ? `${x} + ${a}` : `${a} × ${x}`} right={String(b)} tilt={tilt} toneHex={tone.hex} />
      <p className="rounded-full bg-white px-4 py-1.5 text-xl font-black tabular-nums text-ink shadow-card" aria-live="polite">
        x = {x}
      </p>
      <label className="w-full">
        <span className="sr-only">Value of x</span>
        <input
          type="range"
          min={0}
          max={max}
          value={x}
          disabled={solved}
          onChange={(e) => setX(Number(e.target.value))}
          className="elarion-range w-full" />
        
      </label>
    </div>);

}