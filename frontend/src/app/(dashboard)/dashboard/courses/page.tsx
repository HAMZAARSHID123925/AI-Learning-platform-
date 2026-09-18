"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Search, Sparkles, CheckCircle2, Play, 
  Clock, Award, Star, ArrowUpRight, Check
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { toast } from "@/components/ToastProvider";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  level: string;
  duration_weeks: number;
  total_lessons: number;
  instructor_name: string;
  instructor_title: string;
  rating: number;
  reviews_count: number;
  description: string;
  features: string[];
}

const MULTI_SUBJECT_CATALOG: CourseItem[] = [
  {
    id: "cs-python",
    title: "Introduction to Computer Science & Python Programming",
    category: "Computer Science",
    level: "Beginner to Intermediate",
    duration_weeks: 6,
    total_lessons: 24,
    instructor_name: "Dr. Alex Vance",
    instructor_title: "Senior Software Engineer & Lecturer",
    rating: 4.95,
    reviews_count: 850,
    description: "Learn fundamental computational thinking, Python syntax, data structures, algorithms, and real-world project development from scratch.",
    features: [
      "Interactive code exercises with instant execution",
      "Python data structures, loops, and object-oriented programming",
      "Real-world mini projects (Game dev, Data parsing)",
      "Certificate of Completion upon final test"
    ]
  },
  {
    id: "eng-academic",
    title: "English Mastery: Grammar, Vocabulary & Academic Writing",
    category: "English & Languages",
    level: "All Levels",
    duration_weeks: 5,
    total_lessons: 20,
    instructor_name: "Sarah Jenkins",
    instructor_title: "Head of Applied Linguistics",
    rating: 4.92,
    reviews_count: 1140,
    description: "Build exceptional English fluency, master complex sentence structures, expand vocabulary, and write high-scoring academic essays.",
    features: [
      "AI sentence improvement & grammar drills",
      "Spaced-repetition vocabulary expansion",
      "Clear paragraph synthesis and structure techniques",
      "Weekly live speech and conversational workshops"
    ]
  },
  {
    id: "math-algebra",
    title: "Mathematics & Problem Solving: Foundations to Advanced",
    category: "Mathematics",
    level: "Intermediate",
    duration_weeks: 6,
    total_lessons: 28,
    instructor_name: "Prof. David Kumar",
    instructor_title: "Professor of Applied Mathematics",
    rating: 4.88,
    reviews_count: 620,
    description: "Conquer algebra, geometry, functions, and logical problem solving with clear step-by-step visual lessons and quizzes.",
    features: [
      "Step-by-step mathematical proofs and equation solvers",
      "Practice drills with instant AI hint generation",
      "Geometry visual proofs and algebraic methods",
      "Timed practice quizzes to build exam speed"
    ]
  },
  {
    id: "sci-physics",
    title: "General Science & Physics: How the Universe Works",
    category: "Science",
    level: "Beginner",
    duration_weeks: 4,
    total_lessons: 18,
    instructor_name: "Elena Rostova",
    instructor_title: "Science Educator & Researcher",
    rating: 4.94,
    reviews_count: 490,
    description: "Explore the core concepts of physics, chemistry, and environmental science through engaging visual demonstrations and practical experiments.",
    features: [
      "Interactive physics simulations (Forces, Energy, Space)",
      "Chemistry basics and real-life scientific application",
      "Interactive flashcards and revision quizzes",
      "End-of-module science project"
    ]
  },
  {
    id: "web-dev",
    title: "Modern Web Development (HTML, CSS & JavaScript)",
    category: "Computer Science",
    level: "Beginner",
    duration_weeks: 6,
    total_lessons: 26,
    instructor_name: "Marcus Chen",
    instructor_title: "Full-Stack Web Architect",
    rating: 4.96,
    reviews_count: 980,
    description: "Build clean, responsive, and beautiful websites from scratch using modern HTML5, CSS3, Tailwind, and JavaScript fundamentals.",
    features: [
      "Build 4 real responsive website projects",
      "Modern CSS flexbox, grid, and animations",
      "JavaScript interactivity and DOM manipulation",
      "Deploy your website live to the internet"
    ]
  },
  {
    id: "biz-comm",
    title: "Professional Business Communication & Leadership",
    category: "Business",
    level: "Intermediate",
    duration_weeks: 4,
    total_lessons: 16,
    instructor_name: "Clara Oswald",
    instructor_title: "Executive Coach & Communications Director",
    rating: 4.91,
    reviews_count: 410,
    description: "Master executive presentations, impactful email writing, negotiations, and leadership communication skills for global workplace success.",
    features: [
      "Professional email and proposal templates",
      "Public speaking and confidence conditioning",
      "Diplomatic negotiation and conflict resolution techniques",
      "Live mock presentation feedback"
    ]
  }
];

const CATEGORIES = [
  { id: "all", label: "All Subjects" },
  { id: "Computer Science", label: "💻 Computer Science" },
  { id: "English & Languages", label: "📖 English & Languages" },
  { id: "Mathematics", label: "📐 Mathematics" },
  { id: "Science", label: "🔬 Science" },
  { id: "Business", label: "💼 Business & Leadership" }
];

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>(MULTI_SUBJECT_CATALOG);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(["cs-python"]);

  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleEnroll = (courseId: string, title: string) => {
    if (enrolledCourses.includes(courseId)) {
      toast.info("Already Enrolled", "You are already actively enrolled in this course.");
      return;
    }
    setEnrolledCourses(prev => [...prev, courseId]);
    toast.success("Enrolled Successfully! 🎉", `You are now enrolled in "${title}".`);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#027FFF] border border-blue-200 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">Course Catalog</h1>
              <p className="text-xs text-slate-500 font-medium">Explore and enroll in courses across multiple subjects</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {/* Search & Category Filter Bar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search courses, skills, or subjects (e.g. Python, Algebra, Grammar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#027FFF] transition-colors shadow-xs"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#027FFF] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course.id);
              return (
                <div
                  key={course.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5 group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#027FFF] border border-blue-200 uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {course.rating}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {course.duration_weeks} Weeks
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {course.total_lessons} Lessons
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isEnrolled ? (
                      <Link
                        href={`/courses/${course.id}`}
                        className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all shadow-xs"
                      >
                        <Check className="w-4 h-4" /> Enrolled • Open Course
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id, course.title)}
                        className="w-full py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        + Enroll in Course
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
