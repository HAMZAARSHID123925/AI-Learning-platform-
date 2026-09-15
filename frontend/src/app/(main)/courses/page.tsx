"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);
  const [liveCourses, setLiveCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPublishedCourses() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/api/v1/courses?page_size=50');
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          setLiveCourses(items.filter((c: any) => c.status === 'published'));
        }
      } catch (err) {
        console.warn("Using flagship catalog courses:", err);
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

{/* Live Admin-Published Courses */}
{liveCourses.map((course) => (
  <div key={course.id} className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-[#027FFF]/30">
    <div className="relative h-52 w-full overflow-hidden bg-gradient-to-tr from-[#001F3F] to-[#027FFF] flex items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined text-white text-[48px] mb-2">school</span>
        <span className="text-white font-bold text-lg">{course.title}</span>
      </div>
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white font-bold text-xs shadow-sm">
          Live &amp; Published
        </span>
        <span className="px-2.5 py-1 rounded-md bg-black/40 text-white font-bold text-xs backdrop-blur-sm">
          {course.module_count || 4} Modules
        </span>
      </div>
    </div>
    <div className="flex flex-col flex-1 p-6 justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">{course.title}</h2>
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{course.description || 'Full examiner-curated syllabus with interactive quizzes and AI assessments.'}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-lg font-extrabold text-slate-900">Included in Pro</span>
        <Link href="/signup" className="px-4 py-2 rounded-lg bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs">
          Enroll Now &rarr;
        </Link>
      </div>
    </div>
  </div>
))}

{/* Course Card 1: Academic English & Test Prep Masterclass */}
<div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
{/* Thumbnail / Visual Banner */}
<div className="relative h-52 w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Editorial close-up of a student analyzing academic charts and thesis statements on a modern slate surface desk with Cambridge rubric documents in soft natural daylight, academic prestigious tone." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxXsnnwEJopXO4z_q_-wS6_iEJ68hLZldZVIAYHBvKZvT6BEWw1i9miUB4j374zP9h3C0_tLN0VdpzYa7MI-ROo9fmgSGZi_MO-GCIEzER7s6qhcjhNfOXd8lSz4fFNOAYizt9k5ke8Bfd2spRxAVMvhhZ_l_RskGn-BUlSIT6NgYwqL_C6c1xKN7rhmHdQozEXWwgycRcUGGYdOGTWwT8JDaaE7igriMeRFlNJwvpKXUUvFBvo4XLTQ" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
{/* Badges overlay */}
<div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between gap-space-xs">
<span className="px-space-sm py-space-xxs rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm">
                Most Popular
              </span>
<span className="px-space-sm py-space-xxs rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-caption text-caption font-bold uppercase tracking-wider">
                Comprehensive
              </span>
</div>
{/* In-card preview tag */}
<div className="absolute bottom-space-sm left-space-sm flex items-center gap-space-xs text-white">
<span className="material-symbols-outlined text-[18px] text-tertiary-fixed">verified</span>
<span className="font-caption text-caption font-semibold">Standard Band 7.5 - 9.0 Track</span>
</div>
</div>
{/* Card Content Body */}
<div className="flex flex-col flex-1 p-space-lg justify-between gap-space-lg">
<div className="flex flex-col gap-space-sm">
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-secondary transition-colors">
                Academic English & Test Prep Masterclass
              </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                All-in-one immersive pathway engineered for university matriculation and medical accreditation candidates needing high band performance.
              </p>
{/* Stats Strip */}
<div className="flex items-center flex-wrap gap-x-space-xs gap-y-space-xxs py-space-xs px-space-sm rounded-lg bg-surface-container font-caption text-caption text-on-surface font-medium">
<span className="flex items-center gap-1"><span className="font-semibold text-secondary">4</span> Modules</span>
<span>•</span>
<span><span className="font-semibold text-secondary">28</span> Lessons</span>
<span>•</span>
<span><span className="font-semibold text-secondary">12</span> Adaptive Quizzes</span>
<span>•</span>
<span><span className="font-semibold text-secondary">4</span> Full Mock Tests</span>
</div>
{/* Key Topics Pill Tags */}
<div className="flex flex-col gap-space-xxs pt-space-xs">
<span className="font-caption text-caption text-on-surface-variant font-semibold uppercase tracking-wider">Core Modules Covered</span>
<div className="flex flex-wrap gap-space-xxs">
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Reading Speed Strategies</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Academic Writing Task 1 &amp; 2</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Listening Distractor Drills</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Fluency &amp; Pronunciation</span>
</div>
</div>
{/* Features Checklist */}
<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Real-time Multi-Agent Essay Evaluation</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Cambridge-aligned rubric scoring breakdown</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Automated lexical gap &amp; coherence analysis</span>
</div>
</div>
</div>
{/* Actions Row */}
<div className="flex flex-col gap-space-xs pt-space-sm">
<div className="flex items-center justify-between pb-space-xxs">
<div className="flex items-baseline gap-space-xxs">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">$149</span>
<span className="font-caption text-caption text-on-surface-variant line-through">$229</span>
</div>
<span className="font-caption text-caption text-on-tertiary-container font-semibold px-space-xs py-0.5 rounded bg-surface-container-low">Lifetime Updates</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-space-xs px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 text-center" onClick={scrollToSyllabus}>
<span>View Syllabus</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
<Link className="w-full py-space-xs px-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors text-center flex items-center justify-center" href="/signup">
                  Enroll Now
                </Link>
</div>
</div>
</div>
</div>
{/* Course Card 2: General English Fast-Track */}
<div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
{/* Thumbnail / Visual Banner */}
<div className="relative h-52 w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Modern professional workstation setup with immigration documents, high-tech microphone for speech test practice, clean minimal blue and deep slate palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGC8kn7HOrwvI_UyH-egBErdqGku9Z3s1CHgIyl_--f0XMTRgToKI6ewF9OeQ7oGlCI-dwpUg0dF3x4IiMw_HYb7MnzwVvydIRTxLSk8IDE2sd6SGWrQaT_RS5yqIdA277UG6bbOoCtlbY2hV75jDUwSD81a-_z67Ju90QqOwdfR85OHTLzdEqHK75PTzZMf7vT4HXc_fIDw-IK5Y3xyo9FJwCNsiW-Rx2N_oi-FOjT2Unr1EQTjZT6w" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
{/* Badges overlay */}
<div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between gap-space-xs">
<span className="px-space-sm py-space-xxs rounded-md bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold shadow-sm">
                Express Entry &amp; Work Visa
              </span>
<span className="px-space-sm py-space-xxs rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-caption text-caption font-bold uppercase tracking-wider">
                Fast-Track
              </span>
</div>
<div className="absolute bottom-space-sm left-space-sm flex items-center gap-space-xs text-white">
<span className="material-symbols-outlined text-[18px] text-tertiary-fixed">flag</span>
<span className="font-caption text-caption font-semibold">Optimized for CLB 9+ Targets</span>
</div>
</div>
{/* Card Content Body */}
<div className="flex flex-col flex-1 p-space-lg justify-between gap-space-lg">
<div className="flex flex-col gap-space-sm">
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-secondary transition-colors">
                General English Fast-Track
              </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Rapid target-band alignment tailored for skilled migration, formal correspondence, and daily conversational English competence.
              </p>
{/* Stats Strip */}
<div className="flex items-center flex-wrap gap-x-space-xs gap-y-space-xxs py-space-xs px-space-sm rounded-lg bg-surface-container font-caption text-caption text-on-surface font-medium">
<span className="flex items-center gap-1"><span className="font-semibold text-secondary">3</span> Modules</span>
<span>•</span>
<span><span className="font-semibold text-secondary">18</span> Lessons</span>
<span>•</span>
<span><span className="font-semibold text-secondary">8</span> Adaptive Quizzes</span>
<span>•</span>
<span><span className="font-semibold text-secondary">3</span> Mock Tests</span>
</div>
{/* Key Topics Pill Tags */}
<div className="flex flex-col gap-space-xxs pt-space-xs">
<span className="font-caption text-caption text-on-surface-variant font-semibold uppercase tracking-wider">Targeted Skills Focus</span>
<div className="flex flex-wrap gap-space-xxs">
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Workplace &amp; Formal Letters</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Semi-formal Correspondence</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">High-speed General Reading</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Conversational Simulator</span>
</div>
</div>
{/* Features Checklist */}
<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Automated letter tone &amp; structure analyzer</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Speaking phonology &amp; tempo evaluator</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Express Entry / CLB immigration benchmark</span>
</div>
</div>
</div>
{/* Actions Row */}
<div className="flex flex-col gap-space-xs pt-space-sm">
<div className="flex items-center justify-between pb-space-xxs">
<div className="flex items-baseline gap-space-xxs">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">$119</span>
<span className="font-caption text-caption text-on-surface-variant line-through">$189</span>
</div>
<span className="font-caption text-caption text-on-tertiary-container font-semibold px-space-xs py-0.5 rounded bg-surface-container-low">Immediate Access</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-space-xs px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 text-center" onClick={scrollToSyllabus}>
<span>View Syllabus</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
<Link className="w-full py-space-xs px-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors text-center flex items-center justify-center" href="/signup">
                  Enroll Now
                </Link>
</div>
</div>
</div>
</div>
{/* Course Card 3: Intensive English Writing & Grammar Bootcamp */}
<div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
{/* Thumbnail / Visual Banner */}
<div className="relative h-52 w-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Close up architectural capture of digital AI sentence structure correction with highlighted syntax errors on high-resolution tablet, analytical and scholarly mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZg5hn_Btj93GeMt4NKcKD25Xsu0VYEiwAOr_HFU7Z6XBp-s5OkY1HNiunanxJO8w5FoOqDaKJ4J6LJ_PNEMzcb2l01VtzrX7o2I1bMZj_8rQOWfp9B7LtWTDU6dBRWmWQxeUPSBNGgXz71nMmbgDOjHbJBTVEK7odQ3f1EVGCBf6NmWfpd-ZDg7hvzRaXoBA56w-9c4i3Exkdekw0OjJVryZUfkx8VT_3m590hesIaOqutKK6Ip6YNw" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
{/* Badges overlay */}
<div className="absolute top-space-sm left-space-sm right-space-sm flex items-center justify-between gap-space-xs">
<span className="px-space-sm py-space-xxs rounded-md bg-tertiary-container text-tertiary-fixed font-label-sm text-label-sm font-semibold shadow-sm">
                Targeted Skill Repair
              </span>
<span className="px-space-sm py-space-xxs rounded-md bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-caption text-caption font-bold uppercase tracking-wider">
                Bootcamp
              </span>
</div>
<div className="absolute bottom-space-sm left-space-sm flex items-center gap-space-xs text-white">
<span className="material-symbols-outlined text-[18px] text-tertiary-fixed">speed</span>
<span className="font-caption text-caption font-semibold">Eliminate Band 6.5 Writing Ceiling</span>
</div>
</div>
{/* Card Content Body */}
<div className="flex flex-col flex-1 p-space-lg justify-between gap-space-lg">
<div className="flex flex-col gap-space-sm">
<h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight group-hover:text-secondary transition-colors">
                Intensive English Writing &amp; Grammar Bootcamp
              </h2>
<p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Hyper-focused precision training tackling complex complex sentences, detractor argumentation, and paragraph coherence metrics.
              </p>
{/* Stats Strip */}
<div className="flex items-center flex-wrap gap-x-space-xs gap-y-space-xxs py-space-xs px-space-sm rounded-lg bg-surface-container font-caption text-caption text-on-surface font-medium">
<span className="flex items-center gap-1"><span className="font-semibold text-secondary">2</span> Modules</span>
<span>•</span>
<span><span className="font-semibold text-secondary">10</span> Lessons</span>
<span>•</span>
<span><span className="font-semibold text-secondary">Instant</span> Essay AI</span>
<span>•</span>
<span><span className="font-semibold text-secondary">48</span> Drill Sets</span>
</div>
{/* Key Topics Pill Tags */}
<div className="flex flex-col gap-space-xxs pt-space-xs">
<span className="font-caption text-caption text-on-surface-variant font-semibold uppercase tracking-wider">Focus Domains</span>
<div className="flex flex-wrap gap-space-xxs">
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Coherence &amp; Cohesion</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Lexical Sophistication</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Complex Structures</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container-low text-on-surface font-caption text-caption">Detractor Argumentation</span>
</div>
</div>
{/* Features Checklist */}
<div className="flex flex-col gap-space-xs pt-space-xs">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">10-second instant essay diagnostic &amp; score prediction</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Syntactic mistake heatmaps &amp; collocation drills</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Spaced-repetition grammar repair engine</span>
</div>
</div>
</div>
{/* Actions Row */}
<div className="flex flex-col gap-space-xs pt-space-sm">
<div className="flex items-center justify-between pb-space-xxs">
<div className="flex items-baseline gap-space-xxs">
<span className="font-headline-sm text-headline-sm text-on-surface font-bold">$89</span>
<span className="font-caption text-caption text-on-surface-variant line-through">$139</span>
</div>
<span className="font-caption text-caption text-on-tertiary-container font-semibold px-space-xs py-0.5 rounded bg-surface-container-low">Most Targeted</span>
</div>
<div className="grid grid-cols-2 gap-space-xs">
<button className="w-full py-space-xs px-space-sm rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 text-center" onClick={scrollToSyllabus}>
<span>View Syllabus</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
<Link className="w-full py-space-xs px-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-colors text-center flex items-center justify-center" href="/signup">
                  Enroll Now
                </Link>
</div>
</div>
</div>
</div>
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
