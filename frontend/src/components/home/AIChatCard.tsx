import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, RotateCcw, Sparkles } from 'lucide-react';
import { useAssistantChat } from '../../hooks/useAssistantChat';
import { assistantSuggestions } from '../../data/assistant';
import { easeOutStrong } from '../../utils/motion';

export function AIChatCard({ name }: { name: string }) {
  const { messages, isTyping, send, reset } = useAssistantChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = (text: string) => {
    send(text);
    setDraft('');
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const chips = messages.length === 0 ? assistantSuggestions : isTyping ? [] : lastAssistant?.followUps ?? [];

  return (
    <section aria-labelledby="assistant-title" className="rounded-3xl border border-line bg-white p-5 sm:p-6 md:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="assistant-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-ink md:text-2xl flex items-center gap-2">
              <span>Ask AI Buddy</span>
              <span className="text-xl sm:text-2xl">🤖</span>
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-muted font-medium">
              Ask anything about your lessons or tap a question below!
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-9 sm:h-10 shrink-0 self-end sm:self-auto items-center gap-1.5 rounded-xl px-3 text-xs sm:text-sm font-medium text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>New chat</span>
          </button>
        )}
      </div>

      {messages.length > 0 &&
      <div ref={listRef} aria-live="polite" className="mt-6 max-h-80 space-y-3 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: easeOutStrong }}
                className={`flex flex-col gap-2.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* 1. Main Text Bubble */}
                <div
                  className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm sm:text-base leading-relaxed md:max-w-[75%] ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-primary text-white font-medium shadow-xs'
                      : 'rounded-bl-md bg-canvas/90 text-ink border border-line shadow-2xs'
                  }`}
                >
                  {m.text}
                </div>

                {/* 2. Secondary Explanation Bubble (exact match to screenshot) */}
                {m.secondaryText && (
                  <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-canvas/90 text-ink px-5 py-3.5 text-sm sm:text-base leading-relaxed md:max-w-[75%] border border-line shadow-2xs">
                    {m.secondaryText}
                  </div>
                )}

                {/* 3. Recommended Course Card (exact 1:1 match to screenshot media_1790697968358.png) */}
                {m.recommendation && (
                  <div className="w-full max-w-[540px] rounded-3xl border-2 border-purple-300 bg-white p-5 sm:p-6 shadow-md shadow-purple-500/5 my-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {m.recommendation.tag && (
                          <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 block mb-1">
                            {m.recommendation.tag}
                          </span>
                        )}
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {m.recommendation.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                          {m.recommendation.subtitle}
                        </p>
                      </div>

                      {/* Purple Python/Course Illustration Art */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl sm:text-4xl shrink-0 border border-purple-100 shadow-2xs">
                        {m.recommendation.icon || '🐍'}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3.5 mb-5">
                      {m.recommendation.description}
                    </p>

                    <Link
                      href={m.recommendation.courseId ? `/dashboard/courses/${m.recommendation.courseId}/learn` : '/dashboard/courses'}
                      className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-center block text-sm sm:text-base shadow-sm hover:shadow transition-all active:scale-[0.99]"
                    >
                      {m.recommendation.buttonText || 'Start'}
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping &&
          <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex">
                <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-canvas px-4 py-4" aria-label="Thinking">
                  {[0, 1, 2].map((i) =>
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-subtle"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'linear' }} />

              )}
                </span>
              </motion.div>
          }
          </AnimatePresence>
        </div>
      }

      <form
        className="relative mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}>
        
        <label htmlFor="assistant-input" className="sr-only">
          Ask something
        </label>
        <input
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask here..."
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-line bg-canvas pl-5 pr-16 text-sm sm:text-base text-ink placeholder:text-subtle transition-colors duration-150 focus:border-primary focus:bg-white focus:outline-none" />
        
        <button
          type="submit"
          disabled={!draft.trim() || isTyping}
          aria-label="Send"
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-xl bg-primary text-white transition-colors duration-150 hover:bg-primary-strong disabled:bg-line disabled:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted mr-1">Quick ideas:</span>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => submit(chip)}
              className="h-9 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 hover:bg-white px-3.5 text-xs sm:text-sm font-semibold text-slate-700 transition-all duration-150 hover:border-primary hover:text-primary shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
            >
              💬 {chip}
            </button>
          ))}
        </div>
      )}
    </section>);

}