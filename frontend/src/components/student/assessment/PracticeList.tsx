'use client';
import React from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ImageIcon, TargetIcon, ZapIcon, BoxIcon } from "lucide-react";
import { PracticeItem, PracticeMode } from "@/types/learning";
const modeIcons: Record<PracticeMode, {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  tile: string;
  label: string;
}> = {
  skill: {
    icon: TargetIcon,
    tile: 'bg-danger-50 text-danger-700',
    label: 'Practice'
  },
  visual: {
    icon: ImageIcon,
    tile: 'bg-math-50 text-math-700',
    label: 'See & solve'
  },
  challenge: {
    icon: ZapIcon,
    tile: 'bg-computer-50 text-computer-700',
    label: 'Stretch'
  }
};
interface PracticeListProps {
  courseId: string;
  items: PracticeItem[];
  done: (key: string) => boolean;
}
function practiceHref(courseId: string, item: PracticeItem): string {
  const base = `/dashboard/courses/${courseId}/practice/${item.mode}`;
  return item.skill ? `${base}?skill=${encodeURIComponent(item.skill)}` : base;
}
export function PracticeList({
  courseId,
  items,
  done
}: PracticeListProps) {
  return <ol className="divide-y divide-line rounded-[28px] border-2 border-line">
      {items.map((item) => {
      const m = modeIcons[item.mode];
      const isDone = done(item.key);
      return <li key={item.key}>
            <Link href={practiceHref(courseId, item)} className="group flex items-center gap-4 p-5 transition-colors duration-150 first:rounded-t-[26px] last:rounded-b-[26px] hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-100 sm:p-6">
              
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isDone ? 'bg-science-500 text-white' : m.tile}`} aria-hidden="true">
                {isDone ? <CheckIcon className="h-6 w-6" strokeWidth={3} /> : <m.icon className="h-6 w-6" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-ink-muted">
                  {m.label} · {item.questionCount} questions{isDone ? ' · Done' : ''}
                </span>
                <span className="mt-0.5 block text-lg font-black text-ink">{item.title}</span>
                <span className="mt-0.5 block text-sm text-ink-soft">{item.reason}</span>
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-sm font-extrabold text-ink transition-colors duration-150 group-hover:text-brand-500 sm:inline-flex">
                {isDone ? 'Again' : 'Start'} <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>;
    })}
    </ol>;
}