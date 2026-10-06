import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonLink } from '@/components/student/ButtonLink';
import { ArrowLeftIcon, PlayCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { useProgress } from '@/contexts/ProgressContext';
import type { Lesson, Course } from '@/types/learning';

interface VideoLessonPlayerProps {
  course: Course;
  lesson: Lesson;
  index: number;
  exitTo: string;
  previewMode?: boolean;
}

export function VideoLessonPlayer({ course, lesson, index, exitTo, previewMode = false }: VideoLessonPlayerProps) {
  const { completeLesson, lessons } = useProgress();
  const isCompleted = lessons[lesson.id]?.status === 'completed';

  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const handleComplete = async () => {
    if (previewMode) return true;
    if (saving) return false;
    setSaving(true);
    try {
      if (!isCompleted) await completeLesson(lesson.id, { correct: 1, total: 1 });
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save completion.');
      return false;
    } finally { setSaving(false); }
  };
  const nextHref = course.lessons[index + 1]
    ? `/dashboard/learn/${course.id}/${course.lessons[index + 1].id}`
    : `/dashboard/courses/${course.id}/challenge`;
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <ButtonLink href={exitTo} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Course
          </ButtonLink>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{course.title}</div>
            <h1 className="text-lg font-bold text-slate-900">Lesson {index + 1}: {lesson.title}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        {mediaError && <p role="alert" className="mb-4 text-red-700">Could not play this video. <button onClick={() => window.location.reload()} className="underline">Refresh the authorized playback link</button></p>}
        {/* Video Player Section */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative flex items-center justify-center">
          {lesson.videoUrl ? (
            <video
              key={lesson.videoUrl}
              src={lesson.videoUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
              autoPlay
              muted
              preload="auto"
              poster={lesson.thumbnailUrl || undefined}
              aria-label={lesson.title}
              onEnded={() => { if (!previewMode) void handleComplete(); }}
              onError={() => setMediaError(true)}
            >
              <source src={lesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-8">
              <div className="text-slate-500 mb-4 flex justify-center">
                <PlayCircleIcon className="h-16 w-16 opacity-50" />
              </div>
              <p className="text-slate-300 font-medium text-lg">Video for this lesson is not available yet.</p>
            </div>
          )}
        </div>

        {/* Lesson Details */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-900">{lesson.title}</h2>
            
            <div className="flex items-center gap-3 shrink-0">
              {lesson.durationSeconds ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">
                  {formatDuration(lesson.durationSeconds)} min
                </span>
              ) : null}

              {previewMode ? (
                <span className="text-sm font-bold text-slate-500">Preview · progress is not recorded</span>
              ) : isCompleted ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                  <CheckCircle2Icon className="w-4 h-4 mr-1.5" />
                  Completed
                </span>
              ) : (
                <button 
                  onClick={() => void handleComplete()} disabled={saving}
                  className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 text-sm font-bold border border-brand-200 transition-colors"
                >
                  Mark complete
                </button>
              )}
            </div>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transcript & Notes</h3>
            {lesson.bodyMarkdown ? (
              <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">
                {lesson.bodyMarkdown}
              </div>
            ) : (
              <p className="text-slate-500 italic">No notes available for this lesson.</p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <ButtonLink href={exitTo} variant="secondary">
              Back to course
            </ButtonLink>

            <button disabled={saving} onClick={async () => {
              if (await handleComplete()) router.push(nextHref);
            }} className="rounded-full bg-brand-500 px-6 py-3 font-extrabold text-white disabled:opacity-50">
              {saving ? 'Saving…' : course.lessons[index + 1] ? `Next lesson: ${course.lessons[index + 1].title}` : 'Take final assessment'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
