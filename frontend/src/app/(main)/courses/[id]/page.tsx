"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  BookOpen, Clock, Award, Star, CheckCircle2, PlayCircle, 
  Sparkles, FileText, ArrowRight, ArrowLeft, Check, Users, 
  HelpCircle, ChevronDown, ChevronUp, Layers, Play, Video
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "@/components/ToastProvider";

interface LessonItem {
  id: string;
  title: string;
  sequence_order: number;
  estimated_minutes: number;
  type: 'video' | 'pdf' | 'quiz' | 'code';
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
  subject: string;
  category: string;
  level: string;
  duration_weeks: number;
  instructor_name: string;
  instructor_title: string;
  rating: number;
  reviews_count: number;
  description: string;
  modules: ModuleItem[];
  features: string[];
}

const FALLBACK_CATALOG: Record<string, CourseDetail> = {
  "cs-101": {
    id: "cs-101",
    title: "Full-Stack Computer Science & Python Mastery",
    slug: "cs-python",
    subject: "Computer Science",
    category: "Computer Science",
    level: "Beginner to Intermediate",
    duration_weeks: 6,
    instructor_name: "Dr. Alan Turing",
    instructor_title: "Distinguished AI & Computer Systems Researcher",
    rating: 4.96,
    reviews_count: 850,
    description: "Master computational logic, Python syntax, core data structures, algorithms, and real-world software architecture from ground up.",
    features: [
      "Interactive code exercises with instant execution",
      "Python data structures, loops, and object-oriented programming",
      "Real-world mini projects (Game dev, Data parsing)",
      "Cryptographically verified Certificate of Completion"
    ],
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Computational Logic & Python Foundations",
        description: "Variables, standard data types, arithmetic operators, and terminal scripting.",
        sequence_order: 1,
        lessons: [
          { id: "les-1", title: "Introduction to Computational Thinking & Python", sequence_order: 1, estimated_minutes: 12, type: "video", status: "completed" },
          { id: "les-2", title: "Python Core Data Types & Syntax Reference Guide", sequence_order: 2, estimated_minutes: 8, type: "pdf", status: "unlocked" },
          { id: "les-3", title: "Conditional Logic & For/While Loops", sequence_order: 3, estimated_minutes: 16, type: "video", status: "unlocked" },
          { id: "les-4", title: "Module 1 Checkpoint: Python Basics & Logic Quiz", sequence_order: 4, estimated_minutes: 10, type: "quiz", status: "unlocked" },
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Data Structures, Lists & Dictionaries",
        description: "Master linear data collections, hash maps, slicing, and memory efficiency.",
        sequence_order: 2,
        lessons: [
          { id: "les-5", title: "Lists, Tuples & Mutable Sequences", sequence_order: 1, estimated_minutes: 15, type: "video", status: "unlocked" },
          { id: "les-6", title: "Hash Maps & Dictionaries in Practice", sequence_order: 2, estimated_minutes: 18, type: "video", status: "unlocked" },
          { id: "les-7", title: "Directory Search Mini-Project", sequence_order: 3, estimated_minutes: 25, type: "code", status: "unlocked" }
        ]
      },
      {
        id: "mod-3",
        title: "Module 3: Algorithms, Recursion & Complexity",
        description: "Big-O notation, binary search, sorting algorithms, and recursive trees.",
        sequence_order: 3,
        lessons: [
          { id: "les-8", title: "Big-O Analysis & Algorithmic Scalability", sequence_order: 1, estimated_minutes: 20, type: "video", status: "unlocked" },
          { id: "les-9", title: "Binary Search Trees & Traversal", sequence_order: 2, estimated_minutes: 22, type: "video", status: "unlocked" },
          { id: "les-10", title: "Capstone Capstone Exam & Certification", sequence_order: 3, estimated_minutes: 30, type: "quiz", status: "unlocked" }
        ]
      }
    ]
  },
  "eng-201": {
    id: "eng-201",
    title: "English Grammar, Academic Writing & Fluency",
    slug: "eng-academic",
    subject: "English & Languages",
    category: "English & Languages",
    level: "All Levels",
    duration_weeks: 5,
    instructor_name: "Prof. Eleanor Vance",
    instructor_title: "Head of Academic Linguistics",
    rating: 4.92,
    reviews_count: 1140,
    description: "Build fluent English articulation, master complex sentence clauses, expand academic vocabulary, and write high-scoring essays.",
    features: [
      "AI sentence enhancement & grammar feedback",
      "Spaced-repetition academic vocabulary bank",
      "Cohesion and paragraph structure techniques",
      "Weekly live conversational masterclasses"
    ],
    modules: [
      {
        id: "mod-eng-1",
        title: "Module 1: Advanced Grammar & Syntactic Range",
        description: "Subordinate clauses, passive voice precision, and complex grammatical structures.",
        sequence_order: 1,
        lessons: [
          { id: "les-eng-1", title: "Complex Clause Construction & Coordination", sequence_order: 1, estimated_minutes: 14, type: "video", status: "unlocked" },
          { id: "les-eng-2", title: "Academic Collocations & Lexical Resource Guide", sequence_order: 2, estimated_minutes: 10, type: "pdf", status: "unlocked" },
          { id: "les-eng-3", title: "Grammar & Punctuation Checkpoint Quiz", sequence_order: 3, estimated_minutes: 12, type: "quiz", status: "unlocked" }
        ]
      },
      {
        id: "mod-eng-2",
        title: "Module 2: Essay Architecture & Argumentation",
        description: "Thesis formulation, topic sentence transitions, and persuasive evidence.",
        sequence_order: 2,
        lessons: [
          { id: "les-eng-4", title: "Structuring 4-Paragraph Academic Essays", sequence_order: 1, estimated_minutes: 18, type: "video", status: "unlocked" },
          { id: "les-eng-5", title: "Peer-Reviewed Essay Breakdown", sequence_order: 2, estimated_minutes: 15, type: "pdf", status: "unlocked" }
        ]
      }
    ]
  },
  "math-301": {
    id: "math-301",
    title: "Algebra & Problem Solving Masterclass",
    slug: "math-algebra",
    subject: "Mathematics",
    category: "Mathematics",
    level: "Intermediate",
    duration_weeks: 6,
    instructor_name: "Dr. Alex Vance",
    instructor_title: "Senior Mathematics Lecturer",
    rating: 4.89,
    reviews_count: 620,
    description: "Conquer linear equations, quadratic polynomials, systems of equations, and logical problem-solving through interactive visual proofs.",
    features: [
      "Step-by-step mathematical proofs and equation solvers",
      "Practice drills with instant AI hint generation",
      "Geometry visual proofs and algebraic methods",
      "Timed practice quizzes to build speed"
    ],
    modules: [
      {
        id: "mod-math-1",
        title: "Module 1: Linear Equations & Systems",
        description: "Two-step linear equations, elimination methods, and graphing slope-intercept forms.",
        sequence_order: 1,
        lessons: [
          { id: "les-math-1", title: "Solving Multi-Step Linear Equations", sequence_order: 1, estimated_minutes: 16, type: "video", status: "unlocked" },
          { id: "les-math-2", title: "Algebraic Systems Practice Sheet", sequence_order: 2, estimated_minutes: 10, type: "pdf", status: "unlocked" },
          { id: "les-math-3", title: "Equations Mastery Checkpoint", sequence_order: 3, estimated_minutes: 15, type: "quiz", status: "unlocked" }
        ]
      }
    ]
  }
};

// Aliases for compatibility
FALLBACK_CATALOG["cs-python"] = FALLBACK_CATALOG["cs-101"];
FALLBACK_CATALOG["eng-academic"] = FALLBACK_CATALOG["eng-201"];
FALLBACK_CATALOG["math-algebra"] = FALLBACK_CATALOG["math-301"];

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "cs-101";

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      // Try backend endpoint first
      try {
        const res = await fetch(`http://localhost:8000/api/v1/courses/${rawId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped: CourseDetail = {
            id: data.id || rawId,
            title: data.title || "Course Syllabus",
            slug: data.slug || rawId,
            subject: data.subject || "General",
            category: data.category || "General",
            level: data.level || "All Levels",
            duration_weeks: data.duration_weeks || 4,
            instructor_name: data.instructor_name || "Faculty Lead",
            instructor_title: data.instructor_title || "Course Instructor",
            rating: 4.94,
            reviews_count: 320,
            description: data.description || "Master core concepts through structured interactive modules.",
            modules: (data.modules || []).map((m: any, mIdx: number) => ({
              id: m.id || `m-${mIdx}`,
              title: m.title || `Module ${mIdx + 1}`,
              description: m.description || "",
              sequence_order: m.sequence_order || mIdx + 1,
              lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
                id: l.id || `l-${lIdx}`,
                title: l.title || `Lesson ${lIdx + 1}`,
                sequence_order: l.sequence_order || lIdx + 1,
                estimated_minutes: l.estimated_minutes || 15,
                type: "video",
                status: "unlocked"
              }))
            })),
            features: [
              "Interactive exercises with instant feedback",
              "Syllabus synchronized with student progress tracking",
              "Verified Certificate of Completion upon finishing"
            ]
          };
          setCourse(mapped);
          const initialExpand: Record<string, boolean> = {};
          mapped.modules.forEach(m => { initialExpand[m.id] = true; });
          setExpandedModules(initialExpand);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to local rich multi-subject catalog
      }

      // Local Fallback resolution
      const fallback = FALLBACK_CATALOG[rawId] || FALLBACK_CATALOG["cs-101"];
      setCourse(fallback);
      const initialExpand: Record<string, boolean> = {};
      fallback.modules.forEach(m => { initialExpand[m.id] = true; });
      setExpandedModules(initialExpand);
      setLoading(false);
    }

    loadCourse();
  }, [rawId]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);

    try {
      await fetchWithAuth("/enrollments", {
        method: "POST",
        body: JSON.stringify({ course_id: course.id }),
      });
    } catch (e) {
      // Continue client-side
    }

    setIsEnrolled(true);
    setEnrolling(false);
    toast.success("Enrolled in Course! 🎉", `"${course.title}" is ready in your learning studio.`);
    router.push(`/dashboard/lesson?courseId=${course.id}`);
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-bold text-xs">Loading course syllabus...</span>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((sum, l) => sum + (l.estimated_minutes || 15), 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pt-20">
      
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-16 px-6 md:px-12 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#027FFF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard/courses" className="hover:text-white transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-cyan-300 truncate max-w-xs">{course.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-400/15 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-cyan-400/20">
                  <Sparkles className="w-3 h-3 text-amber-300" /> {course.subject} Track
                </span>
                <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.rating} ({course.reviews_count} reviews)
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span><strong>{course.modules.length}</strong> Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-emerald-400" />
                  <span><strong>{totalLessons}</strong> Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>~<strong>{Math.round(totalMinutes / 60)}</strong> Hours Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Instructor: <strong className="text-white">{course.instructor_name}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="bg-white/10 backdrop-blur-md p-7 rounded-3xl border border-white/20 flex flex-col gap-4 min-w-[300px] shadow-xl">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300 uppercase tracking-wider font-extrabold">Tuition Access</span>
                <span className="text-2xl font-black text-white">Full Free Access</span>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Includes full video curriculum, interactive quiz engine, and downloadable study guides.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 px-6 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {enrolling ? (
                    <span>Enrolling in Studio...</span>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Learning Now</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/dashboard/lesson?courseId=${course.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Layers className="w-3.5 h-3.5" /> Preview Player Direct
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. AI DIAGNOSTIC PLACEMENT BANNER */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-8">
        <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-500/30">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI Adaptive Placement &amp; Diagnostic
            </span>
            <h3 className="text-lg font-black text-white">Assess Your Baseline for {course.subject}</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Take a 5-minute automated diagnostic exam to identify weak topics and skip foundational modules you already know.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`/dashboard/ai-exam?courseId=${course.id}&mode=diagnostic`}
              className="px-5 py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Take Diagnostic Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SYLLABUS ACCORDION DECK */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Curriculum &amp; Syllabus</h2>
            <p className="text-xs text-slate-500">Explore modules and lesson learning objectives</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#027FFF] rounded-full border border-blue-200">
            {course.modules.length} Modules • {totalLessons} Lessons
          </span>
        </div>

        <div className="space-y-4">
          {course.modules.map((mod, modIdx) => {
            const isExpanded = expandedModules[mod.id] ?? true;
            return (
              <div 
                key={mod.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 rounded-2xl bg-blue-100 text-[#027FFF] font-black text-sm flex items-center justify-center shrink-0">
                      {modIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      {mod.lessons.length} lessons
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-slate-100 px-6 py-2">
                    {mod.lessons.map((lesson, lIdx) => (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/lesson?courseId=${course.id}&id=${lesson.id}`}
                        className="py-3 px-3 rounded-2xl flex items-center justify-between text-xs group hover:bg-blue-50/60 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {lesson.type === 'video' ? (
                            <Video className="w-4 h-4 text-slate-400 group-hover:text-[#027FFF] transition-colors" />
                          ) : lesson.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#027FFF] transition-colors" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-purple-500" />
                          )}
                          <span className="text-slate-800 font-bold group-hover:text-[#027FFF] transition-colors">
                            {modIdx + 1}.{lIdx + 1} {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-medium">
                            {lesson.estimated_minutes} mins
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-slate-100 group-hover:bg-[#027FFF] group-hover:text-white text-slate-600 font-bold text-[10px] uppercase transition-all flex items-center gap-1">
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
