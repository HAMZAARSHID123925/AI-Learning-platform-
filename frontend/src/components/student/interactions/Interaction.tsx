'use client';
import React from 'react';
import { BalanceSolve } from './BalanceSolve';
import { FlowReveal } from './FlowReveal';
import { GridShade } from './GridShade';
import { NumberLineSlide } from './NumberLineSlide';
import { PizzaShade } from './PizzaShade';
import { WordTap } from './WordTap';
import { subjectStyles } from '@/utils/subjects';
import type { Subject } from '@/types';
import type { Interaction as InteractionSpec } from '@/types/learning';

interface InteractionViewProps {
  interaction: InteractionSpec;
  subject: Subject;
  solved: boolean;
  onSolved: () => void;
}

export function Interaction({ interaction, subject, solved, onSolved }: InteractionViewProps) {
  const base = { tone: subjectStyles[subject], solved, onSolved };
  switch (interaction.type) {
    case 'pizzaShade':
      return <PizzaShade {...base} slices={interaction.slices} target={interaction.target} />;
    case 'gridShade':
      return <GridShade {...base} target={interaction.target} />;
    case 'numberLineSlide':
      return <NumberLineSlide {...base} {...interaction} />;
    case 'balanceSolve':
      return <BalanceSolve {...base} op={interaction.op} a={interaction.a} b={interaction.b} max={interaction.max} />;
    case 'flowReveal':
      return <FlowReveal {...base} nodes={interaction.nodes} />;
    case 'wordTap':
      return <WordTap {...base} tokens={interaction.tokens} targets={interaction.targets} />;
  }
}