"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

interface LessonItem {
  id: string;
  title: string;
  sequence_order: number;
  estimated_minutes: number;
  status: string;
}

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  sequence_order: number;
  lessons: LessonItem[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  version: number;
  modules: ModuleItem[];
  created_at: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:8000/api/v1/courses/${courseId}`);
        if (!res.ok) {
          throw new Error("Course not found or unable to load details.");
        }
        const data = await res.json();
        setCourse(data);
        // Expand all modules by default
        const initialExpand: Record<string, boolean> = {};
        (data.modules || []).forEach((m: ModuleItem) => {
          initialExpand[m.id] = true;
        });
        setExpandedModules(initialExpand);
      } catch (err: any) {
        setError(err.message || "Failed to load course details.");
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEnroll = async () => {
    if (!course) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/courses/${course.id}`)}`);
      return;
    }

    try {
      setEnrolling(true);
      const res = await fetchWithAuth("/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: course.id }),
      });
      if (res.ok || res.status === 409) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('courseTrack', 'ielts');
        }
        router.push("/dashboard");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to enroll. Please try again.");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      router.push("/dashboard");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium text-sm">Loading course syllabus...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">error</span>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Course Unavailable</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "We could not find the requested course."}</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
          >
            &larr; Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = (course.modules || []).reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const totalMinutes = (course.modules || []).reduce(
    (acc, m) => acc + (m.lessons || []).reduce((sum, l) => sum + (l.estimated_minutes || 15), 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Header */}
      <section className="bg-[#001F3F] text-white py-16 px-4 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <Link href="/courses" className="hover:text-white transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-blue-300 font-medium">{course.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300 mb-3 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Official Curriculum
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
                {course.title}
              </h1>
              <p className="text-base text-slate-200 leading-relaxed max-w-2xl">
                {course.description || "Master core concepts through structured interactive modules, real-time assessments, and adaptive AI telemetry."}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-lg">view_module</span>
                  <span>{course.modules?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">play_lesson</span>
                  <span>{totalLessons} Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-lg">schedule</span>
                  <span>~{Math.round(totalMinutes / 60)} Hours Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400 text-lg">verified</span>
                  <span>Verified S3 Stream & AI Telemetry</span>
                </div>
              </div>
            </div>

            {/* Enroll CTA Box */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col gap-4 min-w-[280px]">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Tuition</span>
                <span className="text-3xl font-extrabold text-white">Free Access</span>
              </div>
              <p className="text-xs text-slate-300">
                Full syllabus access, automated quizzes, and MinIO S3 media streaming included.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enrolling in Database...</span>
                  </>
                ) : (
                  <>
                    <span>Enroll Now</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus Breakdown */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Curriculum & Syllabus</h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore the modules and lesson objectives included in this course.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {course.modules?.length || 0} Modules • {totalLessons} Lessons
          </span>
        </div>

        {course.modules && course.modules.length > 0 ? (
          <div className="flex flex-col gap-4">
            {course.modules.map((mod, modIdx) => {
              const isExpanded = expandedModules[mod.id] ?? true;
              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                        {modIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                        {mod.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500">
                        {mod.lessons?.length || 0} lessons
                      </span>
                      <span className="material-symbols-outlined text-slate-400 text-xl transition-transform duration-200">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 px-6 py-2">
                      {mod.lessons && mod.lessons.length > 0 ? (
                        mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="py-3 flex items-center justify-between text-sm group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors text-lg">
                                play_circle
                              </span>
                              <span className="text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                                {modIdx + 1}.{lIdx + 1} {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {lesson.estimated_minutes || 15} mins
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                                {lesson.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-xs text-slate-400 italic">
                          No lessons added to this module yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">library_books</span>
            <h3 className="text-base font-bold text-slate-700">No syllabus modules published yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              The instructor is currently authoring the curriculum for this course.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
