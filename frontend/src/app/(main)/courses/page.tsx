"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";

export default function CoursesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
  const [liveCourses, setLiveCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEnroll = async (courseTitle: string, courseId: string) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
        return;
      }

      try {
        const res = await fetchWithAuth('/enrollments', {
          method: 'POST',
          body: JSON.stringify({ course_id: courseId }),
        });
        if (res.ok || res.status === 409) {
          // 409 means already enrolled
          router.push('/dashboard');
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Failed to enroll in course. Please try again.');
        }
      } catch (err: any) {
        console.error("Enrollment error:", err);
        router.push('/dashboard');
      }
    }
  };

  useEffect(() => {
    async function loadPublishedCourses() {
      try {
        setLoading(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_courses');
        }

        const res = await fetch('http://localhost:8000/api/v1/courses?page_size=50');
        if (res.ok) {
          const data = await res.json();
          setLiveCourses(data.items || []);
        } else {
          setLiveCourses([]);
        }
      } catch (err) {
        console.warn("Backend catalog query error:", err);
        setLiveCourses([]);
      } finally {
        setLoading(false);
      }
    }
    loadPublishedCourses();
  }, []);

  const toggleModule = (id: number) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const expandAllModules = () => {
    setExpandedModules([1, 2, 3, 4]);
  };

  const scrollToSyllabus = () => {
    const target = document.getElementById("syllabus-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full pt-20 bg-surface">

<div className="flex flex-col w-full">
{/* 1. Premium Full-Width Header */}
<section className="relative w-full bg-[#001F3F] text-white pt-16 pb-32 overflow-hidden border-b border-white/10">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#027FFF]/20 via-transparent to-transparent"></div>
  <div className="max-w-[80rem] mx-auto px-4 relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
    
    <div className="max-w-3xl flex flex-col gap-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-white/60 mb-2">
        <span className="font-caption text-[12px] uppercase tracking-wider text-amber-400 font-bold">Catalog</span>
        <span className="font-caption text-[12px] opacity-50">/</span>
        <span className="font-caption text-[12px] font-medium">Structured Preparation Programs</span>
      </div>
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 w-fit backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="font-label-sm text-[12px] text-white font-bold tracking-wide uppercase">Examiner-Curated Curriculum</span>
      </div>
      
      <h1 className="font-display-lg text-[40px] md:text-[56px] leading-[1.1] font-bold tracking-tight text-white">
        Explore Our English & Test Prep Courses
      </h1>
      <p className="font-body-lg text-[18px] md:text-[20px] text-white/80 max-w-2xl leading-relaxed">
        Curriculum designed by former British Council & IDP English Language examiners, powered by adaptive AI diagnostic testing and real-time rubric telemetry.
      </p>
    </div>

    {/* Metric pill cluster */}
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 self-start lg:self-auto animate-fade-in-up delay-100">
      <div className="flex -space-x-3 overflow-hidden">
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#001F3F] bg-blue-600 flex items-center justify-center font-caption text-[12px] font-bold text-white shadow-lg">MV</div>
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#001F3F] bg-amber-500 flex items-center justify-center font-caption text-[12px] font-bold text-white shadow-lg">EL</div>
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-[#001F3F] bg-emerald-500 flex items-center justify-center font-caption text-[12px] font-bold text-white shadow-lg">JC</div>
      </div>
      <div className="flex flex-col">
        <span className="font-label-md text-[14px] text-white font-bold">Senior Board Evaluators</span>
        <span className="font-caption text-[12px] text-white/60">Calibrated to 2026 Band Specifications</span>
      </div>
    </div>
  </div>
</section>

{/* Search and Filter Controller (Floating) */}
<div className="max-w-[80rem] mx-auto px-4 -mt-16 relative z-20 w-full mb-12">
  <div className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl bg-surface-container-lowest shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-outline-variant/20 animate-fade-in-up delay-200">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
      {/* Search input */}
      <div className="lg:col-span-8 relative flex items-center">
        <span className="material-symbols-outlined absolute left-4 text-on-surface-variant pointer-events-none text-[24px]">search</span>
        <input className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface border-2 border-outline-variant/30 text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:border-secondary focus:bg-white transition-all" id="course-search-input" placeholder="Search topics, skills, or tasks (e.g. Writing Task 2, Speaking Fluency, Band 8.0 Collocations)..." type="text" />
      </div>
      {/* Sort dropdown selector */}
      <div className="lg:col-span-4 flex items-center justify-end gap-3">
        <label className="font-label-sm text-[14px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap" htmlFor="sort-dropdown">Sort by:</label>
        <div className="relative w-full">
          <select className="w-full appearance-none pl-4 pr-12 py-4 rounded-xl border-2 border-outline-variant/30 bg-surface text-on-surface font-label-md text-[14px] font-bold cursor-pointer focus:outline-none focus:border-secondary transition-all" id="sort-dropdown" defaultValue="Recommended for Band 7.5+">
            <option value="Recommended for Band 7.5+">Recommended for Band 7.5+</option>
            <option value="Highest Rated">Highest Rated (4.95+)</option>
            <option value="Fastest Target Completion">Fastest Target Completion</option>
            <option value="Most Intensive Diagnostic Load">Most Intensive Diagnostic Load</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
        </div>
      </div>
    </div>
    {/* Filter category tabs */}
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 no-scrollbar" id="filter-tabs-container">
      <button className={`filter-btn px-5 py-3 rounded-xl font-label-md text-[14px] font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === 'all' ? 'bg-[#027FFF] text-white shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50'}`} onClick={() => setActiveFilter('all')}>
        <span>All Courses</span>
        <span className={`px-2 py-0.5 rounded-full font-caption text-[12px] ${activeFilter === 'all' ? 'bg-white/20' : 'bg-surface-container-high'}`}>6</span>
      </button>
      <button className={`filter-btn px-5 py-3 rounded-xl font-label-md text-[14px] font-bold transition-all whitespace-nowrap ${activeFilter === 'academic' ? 'bg-[#027FFF] text-white shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50'}`} onClick={() => setActiveFilter('academic')}>
        Academic English & IELTS Prep
      </button>
      <button className={`filter-btn px-5 py-3 rounded-xl font-label-md text-[14px] font-bold transition-all whitespace-nowrap ${activeFilter === 'general' ? 'bg-[#027FFF] text-white shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50'}`} onClick={() => setActiveFilter('general')}>
        General English & Test Prep
      </button>
      <button className={`filter-btn px-5 py-3 rounded-xl font-label-md text-[14px] font-bold transition-all whitespace-nowrap ${activeFilter === 'skills' ? 'bg-[#027FFF] text-white shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50'}`} onClick={() => setActiveFilter('skills')}>
        Skill Crash Courses
      </button>
      <button className={`filter-btn px-5 py-3 rounded-xl font-label-md text-[14px] font-bold transition-all whitespace-nowrap ${activeFilter === 'advanced' ? 'bg-[#027FFF] text-white shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant/30 hover:text-on-surface hover:bg-surface-container-high hover:border-outline-variant/50'}`} onClick={() => setActiveFilter('advanced')}>
        Band 8.0+ Advanced
      </button>
    </div>
  </div>
</div>

{/* 2. Main Course Grid (3-column layout) */}
<section className="max-w-[80rem] mx-auto px-4 py-space-lg w-full">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">

{/* Real PostgreSQL Database Courses */}
{loading ? (
  <div className="col-span-full py-16 text-center text-slate-500 font-medium">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#027FFF] mb-3"></div>
    <p>Loading published courses from database...</p>
  </div>
) : liveCourses.length === 0 ? (
  <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8">
    <span className="material-symbols-outlined text-slate-400 text-5xl mb-3">school</span>
    <h3 className="text-lg font-bold text-slate-800">No Published Courses Yet</h3>
    <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
      There are currently no courses published in the database. Log into the Admin Studio to create and publish your first course.
    </p>
    <Link href="/login" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[#027FFF] text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-sm">
      Go to Admin Studio &rarr;
    </Link>
  </div>
) : (
  liveCourses.map((course) => (
    <div key={course.id} className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-[#027FFF]/30">
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-tr from-[#001F3F] to-[#027FFF] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-white text-[48px] mb-2">school</span>
          <span className="text-white font-bold text-lg line-clamp-2">{course.title}</span>
        </div>
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white font-bold text-xs shadow-sm">
            Live in DB
          </span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 text-white font-bold text-xs backdrop-blur-sm">
            {course.module_count || 0} Modules
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6 justify-between gap-4">
        <div>
          <Link href={`/courses/${course.id}`}>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors hover:underline cursor-pointer">{course.title}</h2>
          </Link>
          <p className="text-xs text-slate-600 mt-1 line-clamp-3">{course.description || 'Full examiner-curated syllabus with interactive lessons, practice tests, and AI assessments.'}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-lg font-extrabold text-slate-900">$49.00</span>
          <div className="flex items-center gap-2">
            <Link
              href={`/courses/${course.id}`}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Details
            </Link>
            <button 
              onClick={() => handleEnroll(course.title, course.id)} 
              className="px-4 py-2 rounded-lg bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              Enroll &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  ))
)}
</div>
</section>

{/* 3. Course Syllabus Interactive Preview Showcase */}
<section className="max-w-[80rem] mx-auto px-4 py-space-2xl w-full" id="syllabus-section">
<div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden">
{/* Syllabus Header Bar */}
<div className="p-space-lg md:p-space-xl bg-gradient-to-r from-surface-container-high to-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="flex flex-col gap-space-xxs">
<div className="flex items-center gap-space-xs">
<span className="px-space-xs py-0.5 rounded bg-secondary text-on-secondary font-caption text-caption font-semibold">Live Syllabus Inspection</span>
<span className="font-caption text-caption text-on-surface-variant">Self-Paced or Accelerated Cohort</span>
</div>
<h2 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              Syllabus Preview: Academic English & Test Prep Masterclass
            </h2>
<div className="flex flex-wrap items-center gap-x-space-md gap-y-space-xxs text-on-surface-variant font-body-sm text-body-sm pt-space-xxs">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                Curated by Dr. Marcus Vance, Ex-Senior Language Examiner
              </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                Approx. 36 Total Learning Hours
              </span>
<span>•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[18px] text-secondary">psychology</span>
                Adaptive AI Engine Integrated
              </span>
</div>
</div>
<div className="flex items-center gap-space-xs self-start md:self-auto">
<button className="px-space-sm py-space-xs rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface font-label-md text-label-md font-semibold transition-colors shadow-sm" onClick={expandAllModules}>
              Expand All
            </button>
<Link className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-colors shadow-sm" href="/signup">
              Claim Curriculum
            </Link>
</div>
</div>
{/* Syllabus Accordion Modules */}
<div className="p-space-md md:p-space-xl flex flex-col gap-space-md">
{/* Module 1: Diagnostic Baseline & Academic Writing Fundamentals (Expanded Default) */}
<div className="module-block rounded-xl bg-surface-container-low transition-colors">
<button className="module-trigger w-full flex items-center justify-between p-space-md text-left cursor-pointer focus:outline-none" onClick={() => toggleModule(1)}>
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md font-bold">
                  01
                </div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold">
                    Diagnostic Baseline &amp; Academic Writing Fundamentals
                  </h3>
<p className="font-caption text-caption text-on-surface-variant">3 Lessons • 1 Diagnostic Benchmark • 1 Interactive Sample Review</p>
</div>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-caption text-caption text-secondary font-semibold uppercase hidden sm:inline">Active Module</span>
<span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedModules.includes(1) ? 'rotate-180' : ''}`}>expand_more</span>
</div>
</button>
{/* Expanded Content */}
{expandedModules.includes(1) && (
<div className="px-space-md pb-space-md pt-0 flex flex-col gap-space-xs">
{/* Lesson 1.1 Unlocked Preview */}
<div className="p-space-sm rounded-lg bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface transition-colors">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">play_circle</span>
</div>
<div>
<div className="flex items-center gap-space-xs flex-wrap">
<span className="font-body-md text-body-md text-on-surface font-medium">Lesson 1.1: Task 1 Graph &amp; Process Synthesis Architecture</span>
<span className="px-space-xs py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-caption text-caption font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[12px]">visibility</span> Unlocked Preview
                      </span>
</div>
<span className="font-caption text-caption text-on-surface-variant">18 min masterclass video + interactive band comparison test</span>
</div>
</div>
<button className="px-space-sm py-space-xxs rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold hover:bg-secondary-container transition-colors whitespace-nowrap self-start sm:self-auto">
                  Watch Preview
                </button>
</div>
{/* Lesson 1.2 Locked */}
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm opacity-90">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">lock</span>
</div>
<div>
<div className="flex items-center gap-space-xs">
<span className="font-body-md text-body-md text-on-surface font-medium">Lesson 1.2: Task 2 Thesis Stance &amp; Cohesion Linking</span>
<span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption">Locked</span>
</div>
<span className="font-caption text-caption text-on-surface-variant">24 min video tutorial + 3 examiner-scored model essays</span>
</div>
</div>
<Link className="font-label-sm text-label-sm text-secondary hover:underline self-start sm:self-auto" href="/login">
                  Sign in to access ➔
                </Link>
</div>
{/* Lesson 1.3 Adaptive Checkpoint Locked */}
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm opacity-90">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">lock</span>
</div>
<div>
<div className="flex items-center gap-space-xs">
<span className="font-body-md text-body-md text-on-surface font-medium">Lesson 1.3: Adaptive Checkpoint: Lexical Resource Diagnostic</span>
<span className="px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption">AI Diagnostic</span>
</div>
<span className="font-caption text-caption text-on-surface-variant">30-minute machine-scored diagnostic predicting baseline writing band</span>
</div>
</div>
<Link className="font-label-sm text-label-sm text-secondary hover:underline self-start sm:self-auto" href="/signup">
                  Unlock Diagnostic ➔
                </Link>
</div>
</div>
)}
</div>
{/* Module 2: Advanced Reading Comprehension & Distractor Elimination (Collapsed Default) */}
<div className="module-block rounded-xl bg-surface-container-low transition-colors">
<button className="module-trigger w-full flex items-center justify-between p-space-md text-left cursor-pointer focus:outline-none" onClick={() => toggleModule(2)}>
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                  02
                </div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold">
                    Advanced Reading Comprehension &amp; Distractor Elimination
                  </h3>
<p className="font-caption text-caption text-on-surface-variant">6 Lessons • True/False/Not Given Trap Protocols • Skimming Timing Drills</p>
</div>
</div>
<span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedModules.includes(2) ? 'rotate-180' : ''}`}>expand_more</span>
</button>
{expandedModules.includes(2) && (
<div className="px-space-md pb-space-md pt-0 flex flex-col gap-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 2.1: Reverse Keyword Matching in Academic Texts</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 2.2: Heading Identification: Global Idea vs. Paragraph Detail</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 2.3: Timed Speed Simulation Test (Section 3 Focus)</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
</div>
)}
</div>
{/* Module 3: Speaking Simulator: Part 1, 2 & 3 Precision (Collapsed Default) */}
<div className="module-block rounded-xl bg-surface-container-low transition-colors">
<button className="module-trigger w-full flex items-center justify-between p-space-md text-left cursor-pointer focus:outline-none" onClick={() => toggleModule(3)}>
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                  03
                </div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold">
                    Speaking Simulator: Part 1, 2 &amp; 3 Precision
                  </h3>
<p className="font-caption text-caption text-on-surface-variant">8 Interactive AI Speaking Sessions • Pronunciation Spectrograms</p>
</div>
</div>
<span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedModules.includes(3) ? 'rotate-180' : ''}`}>expand_more</span>
</button>
{expandedModules.includes(3) && (
<div className="px-space-md pb-space-md pt-0 flex flex-col gap-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 3.1: Natural Connectors and Discourse Markers in Part 1</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 3.2: Part 2 Cue Card Mastery: The 2-Minute Spontaneous Flow Framework</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Lesson 3.3: Part 3 Abstract Hypothesis Formulation Under Pressure</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
</div>
)}
</div>
{/* Module 4: Full-Length Computer-Delivered Mock Exam & Agent Feedback (Collapsed Default) */}
<div className="module-block rounded-xl bg-surface-container-low transition-colors">
<button className="module-trigger w-full flex items-center justify-between p-space-md text-left cursor-pointer focus:outline-none" onClick={() => toggleModule(4)}>
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold">
                  04
                </div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold">
                    Full-Length Computer-Delivered Mock Exam &amp; Agent Feedback
                  </h3>
<p className="font-caption text-caption text-on-surface-variant">Official CDT Format • Full Diagnostic Report Generated in 60s</p>
</div>
</div>
<span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${expandedModules.includes(4) ? 'rotate-180' : ''}`}>expand_more</span>
</button>
{expandedModules.includes(4) && (
<div className="px-space-md pb-space-md pt-0 flex flex-col gap-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Mock Exam 1: Timed Listening, Reading, and Writing Full Suite</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface">Mock Exam 2: Live AI Conversational Examiner Evaluation</span>
<span className="font-caption text-caption text-on-surface-variant">🔒 Enroll to unlock</span>
</div>
</div>
)}
</div>
</div>
{/* Bottom Banner inside Preview */}
<div className="p-space-lg md:p-space-xl bg-surface-container-high flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm max-w-2xl">
<span className="material-symbols-outlined text-secondary text-[28px] shrink-0">lock_open</span>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              Sign in or create a free account to unlock full lesson transcripts, downloadable PDF rubrics, and diagnostic AI checkpoint quizzes.
            </p>
</div>
<div className="flex items-center gap-space-xs shrink-0">
<Link className="px-space-md py-space-xs rounded-lg text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-lowest transition-colors" href="/login">
              Sign In
            </Link>
<Link className="px-space-lg py-space-xs rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors shadow-sm" href="/signup">
              Start Free Trial
            </Link>
</div>
</div>
</div>
</section>
{/* 4. Micro-Trust & Value Guarantee Strip */}
<section className="max-w-[80rem] mx-auto px-4 pt-space-md pb-space-2xl w-full">
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-bold">100% Compliant</span>
<span className="font-caption text-caption text-on-surface-variant">British Council &amp; IDP Rubric Aligned</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary text-[22px]">neurology</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-bold">Adaptive AI Engine</span>
<span className="font-caption text-caption text-on-surface-variant">Spaced repetition personalized to weak points</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary text-[22px]">military_tech</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-bold">Score Improvement</span>
<span className="font-caption text-caption text-on-surface-variant">7-Day verifiable score gain guarantee</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary text-[22px]">public</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md text-on-surface font-bold">50,000+ Candidates</span>
<span className="font-caption text-caption text-on-surface-variant">Trained worldwide for Band 7.5+ goals</span>
</div>
</div>
</div>
</div>
</section>
</div>
    </div>
  );
}
