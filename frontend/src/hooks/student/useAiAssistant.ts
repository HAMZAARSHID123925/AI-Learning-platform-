'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Grade } from '@/types/student';

export interface ChatMessage {
  id: string;
  from: 'ai' | 'user';
  text: string;
}

export function useAiAssistant(name: string, grade?: Grade) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || thinking) return;
      setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'user', text: trimmed }]);
      setThinking(true);
      timer.current = window.setTimeout(() => {
        setMessages((m) => [...m, { id: `a-${Date.now()}`, from: 'ai', text: replyFor(trimmed, name, grade) }]);
        setThinking(false);
      }, 900);
    },
    [thinking, name, grade]
  );

  return { messages, thinking, send };
}

function replyFor(text: string, name: string, grade?: Grade): string {
  const q = text.toLowerCase();
  if (q.includes('fraction')) {
    return `Great pick, ${name}! Imagine a pizza cut into 4 equal slices. If you eat 1 slice, you ate 1/4 of the pizza. The bottom number tells how many equal parts there are, and the top number tells how many you have. Want to try one? What fraction is left if you eat 3 slices?`;
  }
  if (q.includes('photosynthesis') || q.includes('plant')) {
    return `Plants are tiny food factories! They take in sunlight through their leaves, water through their roots, and a gas called carbon dioxide from the air. With those, they make sugar for energy — and give us oxygen to breathe. Pretty cool trade, right?`;
  }
  if (q.includes('challenge')) {
    return grade && grade <= 2 ?
    `Challenge time! I’m thinking of a number. If you add 5 to it, you get 12. What’s my number?` :
    `Challenge time! A baker has 24 cookies and puts them into boxes of 6. Then she eats one whole box. How many cookies are left? Take your time — tell me how you figured it out!`;
  }
  return `Ooh, good question! Let’s figure it out together. Can you tell me what you already know about it? I’ll build on that step by step.`;
}