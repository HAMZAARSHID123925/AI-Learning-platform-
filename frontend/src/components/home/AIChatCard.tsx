import React, { useEffect, useRef, useState } from 'react';
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
            <h2 id="assistant-title" className="text-lg sm:text-xl font-bold tracking-tight text-ink md:text-2xl">
              Need help, {name}? Ask me! 🤖
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-muted">I am your helper for Math, Science, English &amp; Computer.</p>
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
            {messages.map((m) =>
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: easeOutStrong }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
                <p
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed md:max-w-[70%] ${
              m.role === 'user' ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md bg-canvas text-ink'}`
              }>
              
                  {m.text}
                </p>
              </motion.div>
          )}
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
          placeholder="Ask something…"
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-line bg-canvas pl-5 pr-16 text-base text-ink placeholder:text-subtle transition-colors duration-150 focus:border-primary focus:bg-white focus:outline-none" />
        
        <button
          type="submit"
          disabled={!draft.trim() || isTyping}
          aria-label="Send"
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-xl bg-primary text-white transition-colors duration-150 hover:bg-primary-strong disabled:bg-line disabled:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {chips.length > 0 &&
      <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) =>
        <button
          key={chip}
          type="button"
          onClick={() => submit(chip)}
          className="h-10 whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          
              {chip}
            </button>
        )}
        </div>
      }
    </section>);

}