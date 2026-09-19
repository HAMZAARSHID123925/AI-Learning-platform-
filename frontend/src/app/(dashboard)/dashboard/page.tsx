"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Video, Bell, Sparkles, Award, Clock, Play,
  CheckCircle2, ArrowRight, ArrowUpRight, TrendingUp,
  Flame, Star, Calendar, ClipboardList, Target, Zap, 
  ChevronRight, Compass, ShieldCheck, Check, Layers,
  GraduationCap, BarChart2, BookMarked, UserCheck, Activity,
  FileText, Lightbulb, CircleAlert, Sparkle
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';

interface EnrolledCourse {
  course_id: string;
  course_title: string;
  category: string;
  icon: string;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  instructor: string;
  nextLessonTitle: string;
  nextLessonDuration: string;
  badgeColor: string;
  accentColor: string;
}

const DEFAULT_COURSES: EnrolledCourse[] = [
  {
    course_id: "cs-101",
    course_title: "Full-Stack Computer Science & Python Mastery",
    category: "Computer Science",
    icon: "💻",
    total_lessons: 16,
    completed_lessons: 11,
    percentage: 69,
    instructor: "Dr. Alan Turing",
    nextLessonTitle: "Lesson 12: Binary Search Trees & Hash Maps",
    nextLessonDuration: "18 mins",
    badgeColor: "bg-blue-50 text-[#027FFF] border-blue-200",
    accentColor: "#027FFF"
  },
  {
    course_id: "eng-201",
    course_title: "English Grammar, Academic Writing & Fluency",
    category: "English & Languages",
    icon: "📖",
    total_lessons: 12,
    completed_lessons: 9,
    percentage: 75,
    instructor: "Prof. Eleanor Vance",
    nextLessonTitle: "Lesson 10: Academic Cohesion & Complex Arguments",
    nextLessonDuration: "14 mins",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accentColor: "#10B981"
  },
  {
    course_id: "math-301",
    course_title: "Algebra & Problem Solving Masterclass",
    category: "Mathematics",
    icon: "📐",
    total_lessons: 18,
    completed_lessons: 6,
    percentage: 33,
    instructor: "Dr. Alex Vance",
    nextLessonTitle: "Lesson 7: Quadratic Formulas & Root Analysis",
    nextLessonDuration: "22 mins",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    accentColor: "#8B5CF6"
  }
];

const UPCOMING_CLASSES = [
  {
    id: "live-1",
    title: "Interactive Code Review: Tree Traversals in Python",
    instructor: "Dr. Alan Turing",
    time: "Today • 4:00 PM (In 2 Hours)",
    subject: "Computer Science",
    status: "Starting Soon",
    accent: "border-blue-500/40 bg-blue-50/50"
  },
  {
    id: "live-2",
    title: "Live Essay Workshop: Structuring Thesis Arguments",
    instructor: "Prof. Eleanor Vance",
    time: "Tomorrow • 11:00 AM",
    subject: "English",
    status: "Confirmed",
    accent: "border-slate-200 bg-white"
  }
];

const PENDING_HOMEWORK = [
  {
    id: "hw-1",
    title: "Python Lab: Build a Recursive Directory Searcher",
    course: "Computer Science & Python",
    due: "Tomorrow, 5:00 PM",
    badge: "Urgent",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: "hw-2",
    title: "Algebra Exercise Set 4: System of Linear Equations",
    course: "Mathematics Masterclass",
    due: "Friday, 11:59 PM",
    badge: "This Week",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: "hw-3",
    title: "Essay Analysis: 500-Word Literary Analysis Draft",
    course: "English & Languages",
    due: "Sunday, 6:00 PM",
    badge: "Upcoming",
    badgeColor: "bg-blue-50 text-[#027FFF] border-blue-200"
  }
];

const WEEK_DAYS = [
  { day: "Mon", active: true, minutes: 45 },
  { day: "Tue", active: true, minutes: 60 },
  { day: "Wed", active: true, minutes: 30 },
  { day: "Thu", active: true, minutes: 55 },
  { day: "Fri", active: true, minutes: 40 },
  { day: "Sat", active: false, minutes: 0 },
  { day: "Sun", active: false, minutes: 0 },
];

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Student");
  const [enrolledCourses] = useState<EnrolledCourse[]>(DEFAULT_COURSES);
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    let name = localStorage.getItem('user_name') || 'Student';
    if (name.toLowerCase() === 'admin' || name.toLowerCase() === 'administrator') {
      name = 'Student';
    }
    setUserName(name);
  }, [router]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const primaryCourse = enrolledCourses[0];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* PREMIUM TOP APP BAR */}
        <header className="h-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#027FFF] to-cyan-500 text-white flex items-center justify-center font-black text-base shadow-sm">
              {userName[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Student Learning Center
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#027FFF] border border-blue-200 uppercase">
                  <Sparkle className="w-3 h-3 text-[#027FFF]" /> Active Track
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Welcome back, {userName}! You have 2 assignments due soon.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Practice Pill */}
            <Link
              href="/dashboard/ai-exam"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#027FFF] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">AI Practice Quiz</span>
              <span className="sm:hidden">AI Quiz</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Alerts &amp; Updates</span>
                    <button onClick={() => setUnreadCount(0)} className="text-[11px] text-[#027FFF] font-bold hover:underline">Mark all as read</button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-800">
                      <p className="font-bold text-slate-900">Python Homework Assigned</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Due tomorrow at 5:00 PM • Dr. Alan Turing</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-slate-800">
                      <p className="font-bold text-slate-900">Quiz Score Released: 92% 🏆</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">English Academic Grammar Quiz #2</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Quick Link to Settings */}
            <Link
              href="/dashboard/settings"
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Student Settings"
            >
              <UserCheck className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* SCROLLABLE MAIN FEED */}
        <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {/* 1. MASTER SPOTLIGHT: IN-PROGRESS ACTIVE COURSE */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-7 md:p-9 shadow-xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#027FFF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/15">
                    <Play className="w-3 h-3 fill-blue-300 text-blue-300" /> Currently Enrolled
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Instructor: <strong className="text-white">{primaryCourse.instructor}</strong>
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                    {primaryCourse.course_title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Master essential algorithms, nested data structures, and algorithmic efficiency with interactive coding exercises.
                  </p>
                </div>

                {/* Next Up Module Capsule */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 max-w-xl backdrop-blur-md flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-black text-cyan-300 tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Next Up in Syllabus
                    </span>
                    <p className="text-sm font-bold text-white">
                      {primaryCourse.nextLessonTitle}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white/15 text-white font-mono text-xs font-bold shrink-0">
                    {primaryCourse.nextLessonDuration}
                  </span>
                </div>

                {/* Interactive Progress Meter */}
                <div className="max-w-md space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>Course Progress: {primaryCourse.completed_lessons} of {primaryCourse.total_lessons} Lessons</span>
                    <span className="text-cyan-300 font-black">{primaryCourse.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-[#027FFF] rounded-full transition-all duration-700 shadow-sm" 
                      style={{ width: `${primaryCourse.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-64">
                <Link
                  href={`/courses/${primaryCourse.course_id}`}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#027FFF] to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" /> Resume Lesson Now
                </Link>
                <Link
                  href="/dashboard/courses"
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-white/10"
                >
                  <Layers className="w-3.5 h-3.5" /> View All Courses
                </Link>
              </div>
            </div>
          </div>

          {/* 2. BENTO STATS & LEARNING VELOCITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Streak & Consistency */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Learning Streak</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900">5 Days 🔥</p>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Top 10% of active students
                </p>
              </div>
              {/* Day Dots */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {WEEK_DAYS.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">{d.day[0]}</span>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      d.active ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {d.active ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Hours */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Weekly Time</span>
                <span className="p-2 rounded-xl bg-blue-50 text-[#027FFF] border border-blue-200/60">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900">14.5 hrs</p>
                <p className="text-xs text-slate-500 font-medium">Goal: 18.0 hrs/week</p>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#027FFF] rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-bold">80% of weekly study target</span>
              </div>
            </div>

            {/* Quiz Accuracy */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">AI Quiz Score</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
                  <Star className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900">89.4%</p>
                <p className="text-xs text-purple-600 font-bold">18 Quizzes Completed</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Subject Diagnostic</span>
                <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Grade A</span>
              </div>
            </div>

            {/* Certificates */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Credentials</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900">2 Earned</p>
                <p className="text-xs text-emerald-600 font-bold">Verified on Blockchain</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link href="/dashboard/certificates" className="text-xs text-[#027FFF] font-black hover:underline flex items-center gap-1">
                  View Credentials <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

          {/* 3. MULTI-SUBJECT COURSE DECK */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Enrolled Multi-Subject Tracks</h3>
                <p className="text-xs text-slate-500">Pick up where you left off across all subjects</p>
              </div>
              <Link 
                href="/dashboard/courses" 
                className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1.5"
              >
                Browse Full Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {enrolledCourses.map((c) => (
                <div 
                  key={c.course_id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-lg flex flex-col justify-between space-y-5 transition-all group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{c.icon}</span>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${c.badgeColor} uppercase tracking-wider`}>
                        {c.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#027FFF] transition-colors line-clamp-2 leading-snug">
                        {c.course_title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Instructor: {c.instructor}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Next Up</span>
                      <p className="font-bold text-slate-800 text-[11px] mt-0.5 truncate">{c.nextLessonTitle}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">{c.completed_lessons} / {c.total_lessons} Lessons</span>
                      <span className="text-slate-900 font-black">{c.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${c.percentage}%`, backgroundColor: c.accentColor }}
                      />
                    </div>
                    <Link 
                      href={`/courses/${c.course_id}`}
                      className="w-full py-2.5 mt-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all group-hover:bg-[#027FFF] group-hover:text-white group-hover:border-[#027FFF]"
                    >
                      <span>Continue Subject</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TWO-COLUMN INTERACTIVE HUB: LIVE SESSIONS & HOMEWORK TASKS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Class Schedule (7 Cols) */}
            <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Upcoming Live Masterclasses</h3>
                    <p className="text-[11px] text-slate-500">Interactive video sessions &amp; Q&amp;A</p>
                  </div>
                </div>
                <Link href="/dashboard/live" className="text-xs font-bold text-rose-600 hover:underline">
                  View Calendar &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {UPCOMING_CLASSES.map((cls) => (
                  <div key={cls.id} className={`p-4 rounded-2xl border ${cls.accent} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-xs`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded-md">
                          {cls.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{cls.time}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900">{cls.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Instructor: {cls.instructor} • {cls.subject}</p>
                    </div>
                    <Link 
                      href="/dashboard/live"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs shrink-0 text-center transition-all cursor-pointer"
                    >
                      Join Room
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Homework Queue (5 Cols) */}
            <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Pending Homework</h3>
                    <p className="text-[11px] text-slate-500">Tasks assigned by faculty</p>
                  </div>
                </div>
                <Link href="/dashboard/assignments" className="text-xs font-bold text-[#027FFF] hover:underline">
                  All Tasks &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {PENDING_HOMEWORK.map((hw) => (
                  <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase border ${hw.badgeColor}`}>
                          {hw.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold truncate">{hw.due}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-xs truncate">{hw.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{hw.course}</p>
                    </div>
                    <Link 
                      href="/dashboard/assignments"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shrink-0 shadow-xs transition-all"
                    >
                      Submit
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. AI EXAM GENERATOR CAPSULE */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white shadow-lg border border-indigo-700/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Adaptive Diagnostic AI Engine
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">Need a quick test before your next exam?</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Generate an instant 5-question targeted practice exam across Computer Science, English Grammar, Mathematics, or Science with automated step-by-step solutions.
              </p>
            </div>

            <Link
              href="/dashboard/ai-exam"
              className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-105 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#027FFF]" />
              Start Instant Quiz Now &rarr;
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
