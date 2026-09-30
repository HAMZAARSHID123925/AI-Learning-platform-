'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { StateMessage } from '@/components/student/StateMessage';
import { subjectStyles } from '@/utils/student/subjects';
import type { Recommendation } from '@/types/student/learning';

interface AiRecommendationProps {
  items: Recommendation[] | undefined;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function AiRecommendation({ items, loading, error, onRetry }: AiRecommendationProps) {
  const [primary, ...rest] = items ?? [];
  return (
    <section aria-labelledby="rec-title">
      <div className="mb-4 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-brand-500" aria-hidden="true" />
        <h2 id="rec-title" className="text-2xl font-black text-ink">Recommended for you</h2>
      </div>

      {loading &&
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]" aria-busy="true" aria-label="Loading recommendations">
          <div className="h-44 animate-pulse rounded-[28px] bg-surface" />
          <div className="grid gap-4">
            <div className="h-20 animate-pulse rounded-3xl bg-surface" />
            <div className="h-20 animate-pulse rounded-3xl bg-surface" />
          </div>
        </div>
      }

      {error && <StateMessage kind="error" message="Elo couldn’t load suggestions right now." onRetry={onRetry} />}

      {!loading && !error && !primary &&
      <p className="rounded-3xl bg-surface p-6 font-bold text-ink-soft">You’re all caught up. Pick any course to keep exploring!</p>
      }

      {!loading && !error && primary &&
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} className="relative flex flex-col rounded-[28px] bg-ink p-7 text-white">
            <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-white/70">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" /> Elo suggests · {subjectStyles[primary.subject].label}
            </p>
            <h3 className="mt-3 text-3xl font-black tracking-tight">{primary.title}</h3>
            <p className="mt-2 max-w-md text-base text-white/80">{primary.reason}</p>
            <Link
            href={primary.to}
            className="mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-extrabold text-ink shadow-[0_3px_0_0_#C9CBD3] transition-[transform,box-shadow] duration-100 after:absolute after:inset-0 after:rounded-[28px] active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100">
            
              {primary.cta} <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </motion.div>

          {rest.length > 0 &&
        <ul className="flex flex-col gap-3">
              {rest.map((r) => {
            const s = subjectStyles[r.subject];
            return (
              <li key={r.id} className="flex-1">
                    <Link
                  href={r.to}
                  className="group flex h-full items-center gap-4 rounded-3xl border-2 border-line bg-white p-4 transition-[border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-ink/20">
                  
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${s.bg}`} aria-hidden="true">
                        <s.icon className={`h-6 w-6 ${s.text}`} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-black text-ink">{r.title}</span>
                        <span className="mt-0.5 line-clamp-2 block text-sm text-ink-soft">{r.reason}</span>
                      </span>
                      <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </li>);

          })}
            </ul>
        }
        </div>
      }
    </section>);

}