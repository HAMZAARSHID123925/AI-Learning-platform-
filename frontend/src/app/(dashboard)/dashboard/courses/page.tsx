"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Search, Filter, Sparkles, CheckCircle2, Play, 
  Clock, Award, Star, ArrowLeft, ArrowUpRight, ChevronRight,
  Flame, ShieldCheck, Video, GraduationCap, X, Layers
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "@/components/ToastProvider";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  target_band: string;
  cefr_level: string;
  duration_weeks: number;
  total_lessons: number;
  instructor_name: string;
  instructor_title: string;
  rating: number;
  reviews_count: number;
  description: string;
  features: string[];
  syllabus: { module_title: string; lessons: string[] }[];
  status?: string;
  price?: string;
}

const DEFAULT_CATALOG: CourseItem[] = [
  {
    id: "ielts-mastery",
    title: "IELTS Academic Writing & Speaking Masterclass",
    category: "IELTS Academic",
    target_band: "Band 8.0+",
    cefr_level: "C1 / C2",
    duration_weeks: 6,
    total_lessons: 28,
    instructor_name: "Dr. Michael Vance",
    instructor_title: "Former Senior British Council Examiner",
    rating: 4.96,
    reviews_count: 1420,
    description: "Master Cambridge 2026 Band 8.5 Task 2 essay architecture, lexical inversion, and Part 2 speaking fluency with automated rubric telemetry.",
    features: [
      "Task 1 & Task 2 Syntax Heatmaps",
      "Real-time Speaking Simulator with AI feedback",
      "Examiner-calibrated Model Essay Bank",
      "Spaced-repetition C2 Lexical Flashcards"
    ],
    syllabus: [
      {
        module_title: "Module 1: Academic Writing Architecture",
        lessons: [
          "Band 8.5 Task 2 Argumentation & Position Formulation",
          "Advanced Complex Sentence Synthesis & Inversion",
          "Task 1 Data Synthesis for Line Graphs & Multi-Charts",
          "Lexical Precision: Avoiding Clichés & Register Lapses"
        ]
      },
      {
        module_title: "Module 2: Speaking Fluency & Phonetic Calibration",
        lessons: [
          "Part 2 Cue Card Mastery (3-Stage Structured Note-taking)",
          "Part 3 Abstract Question Expansion & Discourse Markers",
          "Phonetic Connected Speech & Intonation Control",
          "Mock Video Exam with AI Telemetry Analysis"
        ]
      }
    ]
  },
  {
    id: "ielts-general",
    title: "IELTS General Training Complete Fast-Track",
    category: "IELTS General",
    target_band: "Band 7.5+",
    cefr_level: "B2 / C1",
    duration_weeks: 4,
    total_lessons: 20,
    instructor_name: "Emma Linwood",
    instructor_title: "IDP Lead Evaluator",
    rating: 4.92,
    reviews_count: 980,
    description: "Focused training for immigration and express entry candidates targeting CLB 9 & 10. Covers formal/informal letters and general reading speed.",
    features: [
      "Task 1 Formal, Semi-Formal & Informal Letter Templates",
      "General Section 3 Long-text Rapid Scanning Drills",
      "Speaking Simulator with Pronunciation Scoring",
      "Mock Exam Series with instant Band Calibration"
    ],
    syllabus: [
      {
        module_title: "Module 1: General Task 1 Correspondence",
        lessons: [
          "Purpose Identification and Tone Calibration",
          "Complaint, Inquiry, and Apology Letter Frameworks",
          "Bullet Point Coverage and Paragraph Staging"
        ]
      },
      {
        module_title: "Module 2: Workplace & Social Fluency",
        lessons: [
          "Workplace English Colloquialisms vs Formal Register",
          "Speaking Part 1 Personal Storytelling Confidence"
        ]
      }
    ]
  },
  {
    id: "spoken-fluency",
    title: "Executive Spoken English & Accent Neutralization",
    category: "Spoken English",
    target_band: "C1 Fluency",
    cefr_level: "C1",
    duration_weeks: 5,
    total_lessons: 24,
    instructor_name: "James Sterling",
    instructor_title: "Oxford Phonetics Specialist",
    rating: 4.95,
    reviews_count: 750,
    description: "Develop effortless conversational rhythm, reduce hesitation pauses, and build natural British/American connected speech patterns.",
    features: [
      "Real-time Spectrogram & Pronunciation Feedback",
      "Stress-timed English Rhythm & Thought Groups",
      "Business Presentation & Impromptu Debate Drills",
      "AI Speech Buddy Conversational Practice 24/7"
    ],
    syllabus: [
      {
        module_title: "Module 1: Rhythm and Phonetics",
        lessons: [
          "Schwa Vowel Reduction and Natural Weak Forms",
          "Consonant Clusters and Linking Sounds",
          "Thought Group Chunking to eliminate Pauses"
        ]
      },
      {
        module_title: "Module 2: Professional Discourse",
        lessons: [
          "Diplomatic Disagreement & Persuasive Framing",
          "Storytelling and Impromptu Speech Execution"
        ]
      }
    ]
  },
  {
    id: "grammar-c2",
    title: "C2 Grammar Mastery & Syntactic Inversion",
    category: "Grammar & Vocabulary",
    target_band: "Band 9.0",
    cefr_level: "C2 Mastery",
    duration_weeks: 3,
    total_lessons: 16,
    instructor_name: "Dr. Michael Vance",
    instructor_title: "Former Senior British Council Examiner",
    rating: 4.98,
    reviews_count: 610,
    description: "Eliminate repetitive sentence structures. Learn conditional inversion, cleft sentences, nominalization, and cohesive participle clauses.",
    features: [
      "Inversion Sentence Transformation Engine",
      "Academic Nominalization Drills",
      "Interactive Syntax Error Detection Matrix",
      "Automated Grammar Radar Calibration"
    ],
    syllabus: [
      {
        module_title: "Module 1: Advanced Complex Syntax",
        lessons: [
          "Inverted Conditionals (Had I known, Were it not for)",
          "Negative Adverbial Fronting (Seldom, Rarely, Under no circumstances)",
          "Cleft Sentences for Thematic Emphasis (It is... What makes...)"
        ]
      },
      {
        module_title: "Module 2: High-Register Academic Style",
        lessons: [
          "Nominalization for Scientific & Academic Density",
          "Participle Clauses for Sentence Conciseness"
        ]
      }
    ]
  }
];

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledMap, setEnrolledMap] = useState<Record<string, any>>({});
  const [selectedCourseForPreview, setSelectedCourseForPreview] = useState<CourseItem | null>(null);

  // Load enrolled courses from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("student_enrolled_courses");
        if (raw) {
          const parsed = JSON.parse(raw);
          const map: Record<string, any> = {};
          parsed.forEach((c: any) => {
            map[c.course_id || c.course_title] = c;
            map[c.course_title] = c;
          });
          setEnrolledMap(map);
        } else {
          // Default enrollment
          setEnrolledMap({
            "ielts-mastery": {
              course_id: "ielts-mastery",
              course_title: "IELTS Academic Writing & Speaking Masterclass",
              total_lessons: 28,
              completed_lessons: 19,
              percentage: 68
            }
          });
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch published courses from API and merge with admin courses
  useEffect(() => {
    async function loadAllCourses() {
      try {
        let localCreated: any[] = [];
        if (typeof window !== "undefined") {
          const savedAdmin = localStorage.getItem("admin_courses");
          if (savedAdmin) {
            localCreated = JSON.parse(savedAdmin).filter((c: any) => c.status === "published");
          }
        }

        const res = await fetchWithAuth("/courses?page_size=50");
        let remoteItems: any[] = [];
        if (res.ok) {
          const data = await res.json();
          remoteItems = (data.items || []).filter((c: any) => c.status === "published");
        }

        // Format and merge
        const combined = [...DEFAULT_CATALOG];
        [...localCreated, ...remoteItems].forEach((item: any) => {
          if (!combined.some(c => c.id === item.id || c.title === item.title)) {
            combined.push({
              id: item.id || "c-" + Math.random().toString(36).substring(2, 7),
              title: item.title,
              category: item.category || "IELTS Academic",
              target_band: item.target_band || "Band 7.5+",
              cefr_level: item.cefr_level || "C1",
              duration_weeks: item.duration_weeks || 4,
              total_lessons: item.total_lessons || 18,
              instructor_name: item.instructor_name || "Academic Faculty",
              instructor_title: item.instructor_title || "PPAcademia Lead Evaluator",
              rating: item.rating || 4.9,
              reviews_count: item.reviews_count || 120,
              description: item.description || "Comprehensive syllabus tailored to examiner criteria.",
              features: item.features || [
                "AI Telemetry & Rubric Scoring",
                "Spaced-repetition Flashcards",
                "Examiner Guided Lessons"
              ],
              syllabus: item.syllabus || [
                {
                  module_title: "Module 1: Foundation & Core Concepts",
                  lessons: ["Introduction & Diagnostic Benchmark", "Grammar & Syntactic Frameworks", "Evaluator Criteria Deep-Dive"]
                }
              ]
            });
          }
        });

        setCourses(combined);
      } catch {
        // keep default catalog
      }
    }
    loadAllCourses();
  }, []);

  const handleEnroll = (course: CourseItem) => {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("student_enrolled_courses") || "[]");
      if (!existing.some((c: any) => c.course_title === course.title || c.course_id === course.id)) {
        const newEnrollment = {
          course_id: course.id,
          course_title: course.title,
          total_lessons: course.total_lessons,
          completed_lessons: 0,
          percentage: 0
        };
        const updated = [newEnrollment, ...existing];
        localStorage.setItem("student_enrolled_courses", JSON.stringify(updated));
        setEnrolledMap((prev) => ({
          ...prev,
          [course.id]: newEnrollment,
          [course.title]: newEnrollment
        }));
        toast.success("Enrolled Successfully!", `You are now enrolled in "${course.title}".`);
      } else {
        toast.info("Already Enrolled", `You are already enrolled in this course track.`);
      }
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === "all" ||
      (selectedCategory === "enrolled" && (enrolledMap[c.id] || enrolledMap[c.title])) ||
      c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* PERSISTENT DASHBOARD SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F0F4F8]">
        {/* TOP BANNER */}
        <div className="bg-[#0F172A] text-white px-6 lg:px-10 py-8 border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <Link href="/dashboard" className="hover:text-white flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-[#5BC0EB]">Curriculum Catalog</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-[#027FFF]" />
                Student Course Catalog & Specialization Tracks
              </h1>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Cambridge & IDP calibrated programs with AI simulator integration, personalized telemetry, and instant spaced-repetition drills.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-2 border border-white/10"
              >
                My Active Progress
              </Link>
              <Link
                href="/dashboard/adaptive"
                className="px-4 py-2.5 rounded-xl bg-[#027FFF] hover:bg-[#0066CC] text-white text-xs font-bold transition-all shadow-lg shadow-[#027FFF]/30 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive AI Engine
              </Link>
            </div>
          </div>
        </div>

        {/* CONTENT WRAPPER */}
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, skills, or target band..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#027FFF] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Programs" },
                { id: "enrolled", label: "My Enrolled Tracks" },
                { id: "ielts", label: "IELTS" },
                { id: "spoken", label: "Spoken English" },
                { id: "grammar", label: "Grammar & C2" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === tab.id
                      ? "bg-[#027FFF] text-white shadow-md shadow-[#027FFF]/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* COURSE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const enrolled = enrolledMap[course.id] || enrolledMap[course.title];
              const progressPct = enrolled ? enrolled.percentage || 0 : 0;
              const completedLessons = enrolled ? enrolled.completed_lessons || 0 : 0;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Badge Strip */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase bg-blue-50 text-[#027FFF] border border-blue-100">
                          {course.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {course.target_band}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          CEFR {course.cefr_level}
                        </span>
                      </div>

                      {enrolled ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enrolled
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">
                          Included
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#027FFF] transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Instructor & Rating Row */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-[10px] border border-slate-200">
                          {course.instructor_name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{course.instructor_name}</p>
                          <p className="text-[10px] text-slate-400">{course.instructor_title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{course.rating.toFixed(1)}</span>
                        <span className="text-slate-400 text-[10px]">({course.reviews_count})</span>
                      </div>
                    </div>

                    {/* Progress Bar (If Enrolled) */}
                    {enrolled && (
                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-700">Course Progress</span>
                          <span className="text-[#027FFF]">{progressPct}% ({completedLessons}/{course.total_lessons} Lessons)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#027FFF] to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, progressPct)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Key Highlights */}
                    <div className="mt-4 space-y-1.5">
                      {course.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedCourseForPreview(course)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      View Syllabus
                    </button>

                    {enrolled ? (
                      <Link
                        href="/dashboard/lesson"
                        className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-[#0066CC] text-white text-xs font-bold transition-all shadow-md shadow-[#027FFF]/20 flex items-center gap-2 group-hover:scale-105"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#027FFF] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enroll in Track
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No courses match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting &quot;All Programs&quot;.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* SYLLABUS PREVIEW DRAWER / MODAL */}
      {selectedCourseForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-[#0F172A] text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#027FFF] text-white">
                    {selectedCourseForPreview.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    Target {selectedCourseForPreview.target_band}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  {selectedCourseForPreview.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Instructor: {selectedCourseForPreview.instructor_name} ({selectedCourseForPreview.instructor_title})
                </p>
              </div>

              <button
                onClick={() => setSelectedCourseForPreview(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Syllabus Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Course Overview</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedCourseForPreview.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Syllabus Breakdown ({selectedCourseForPreview.total_lessons} Lessons total)
                </h4>

                <div className="space-y-4">
                  {selectedCourseForPreview.syllabus.map((mod, mIdx) => (
                    <div key={mIdx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      <h5 className="text-xs font-black text-slate-900 mb-2.5 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-[#027FFF] text-[10px] font-black flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        {mod.module_title}
                      </h5>

                      <ul className="space-y-2 pl-7">
                        {mod.lessons.map((lesson, lIdx) => (
                          <li key={lIdx} className="text-xs text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span>{lesson}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal Action */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCourseForPreview(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEnroll(selectedCourseForPreview);
                    setSelectedCourseForPreview(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-[#0066CC] text-white text-xs font-bold transition-all shadow-md shadow-[#027FFF]/30 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Enroll in Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
