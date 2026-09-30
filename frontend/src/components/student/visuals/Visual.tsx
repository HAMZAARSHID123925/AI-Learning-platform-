'use client';
import React from 'react';
import { BalanceVisual } from './BalanceVisual';
import { DecimalGridVisual } from './DecimalGridVisual';
import { FlowVisual } from './FlowVisual';
import { FractionBarsVisual } from './FractionBarsVisual';
import { NumberLineVisual } from './NumberLineVisual';
import { PassageVisual } from './PassageVisual';
import { PizzaVisual } from './PizzaVisual';
import { ShapesVisual } from './ShapesVisual';
import { WordsVisual } from './WordsVisual';
import { subjectStyles } from '@/utils/student/subjects';
import type { Subject } from '@/types/student';
import type { Visual as VisualSpec } from '@/types/student/learning';

export function Visual({ visual, subject }: {visual: VisualSpec;subject: Subject;}) {
  const tone = subjectStyles[subject];
  switch (visual.type) {
    case 'pizza':
      return <PizzaVisual slices={visual.slices} shaded={new Set(Array.from({ length: visual.shaded }, (_, i) => i))} />;
    case 'fractionBars':
      return <FractionBarsVisual bars={visual.bars} tone={tone} />;
    case 'decimalGrid':
      return <DecimalGridVisual shaded={visual.shaded} tone={tone} />;
    case 'numberLine':
      return <NumberLineVisual {...visual} toneHex={tone.hex} />;
    case 'shapes':
      return <ShapesVisual items={visual.items} toneHex={tone.hex} softHex={tone.softHex} />;
    case 'balance':
      return <BalanceVisual left={visual.left} right={visual.right} toneHex={tone.hex} />;
    case 'flow':
      return <FlowVisual nodes={visual.nodes} tone={tone} />;
    case 'words':
      return <WordsVisual tokens={visual.tokens} highlight={visual.highlight} tone={tone} />;
    case 'passage':
      return <PassageVisual text={visual.text} highlight={visual.highlight} tone={tone} />;
  }
}

export function VisualStage({ subject, children }: {subject: Subject;children: React.ReactNode;}) {
  return <div className={`grid min-h-[220px] place-items-center rounded-[28px] px-5 py-8 sm:px-8 ${subjectStyles[subject].bg}`}>{children}</div>;
}