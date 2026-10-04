'use client';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpIcon, SparklesIcon } from 'lucide-react';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import type { Grade } from '@/types';

const suggestions = ['Help me with fractions', 'Explain photosynthesis', 'Give me a challenge'];

export function AiAssistant({ name, grade }: {name: string;grade?: Grade;}) {
  const { messages, thinking, send } = useAiAssistant(name, grade);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  return (
    <section aria-labelledby="ai-title" className="rounded-[28px] bg-brand-50 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-500 shadow-[0_4px_0_0_#2438B0]" aria-hidden="true">
          <SparklesIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-brand-700">Elo · your learning buddy</p>
          <h2 id="ai-title" className="mt-0.5 text-2xl font-black text-ink sm:text-[28px]">
            Hi {name}! What are you curious about?
          </h2>
        </div>
      </div>

      {(messages.length > 0 || thinking) &&
      <div ref={listRef} className="mt-6 max-h-72 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((m) =>
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            
                <p
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
              m.from === 'user' ? 'rounded-br-lg bg-ink text-white' : 'rounded-bl-lg bg-white text-ink shadow-card'}`
              }>
              
                  {m.text}
                </p>
              </motion.div>
          )}
          </AnimatePresence>
          {thinking &&
        <div className="flex w-fit items-center gap-1.5 rounded-3xl rounded-bl-lg bg-white px-4 py-4 shadow-card" aria-label="Elo is thinking">
              {[0, 1, 2].map((i) =>
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-brand-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'linear' }} />

          )}
            </div>
        }
        </div>
      }

      <form onSubmit={submit} className="mt-6 flex items-center gap-2 rounded-2xl border-2 border-transparent bg-white p-2 shadow-card transition-colors duration-150 focus-within:border-brand-500">
        <label htmlFor="ai-input" className="sr-only">Ask Elo anything</label>
        <input
          id="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="h-11 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink-muted" />
        
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          aria-label="Send"
          className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white transition-[background-color,transform] duration-100 hover:bg-brand-600 active:scale-95 disabled:bg-brand-100">
          
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) =>
        <button
          key={s}
          type="button"
          onClick={() => send(s)}
          disabled={thinking}
          className="rounded-full border-2 border-brand-100 bg-white px-4 py-2 text-sm font-bold text-brand-700 transition-[border-color,transform] duration-150 hover:border-brand-500 active:scale-[0.97] disabled:opacity-50">
          
            {s}
          </button>
        )}
      </div>
    </section>);

}