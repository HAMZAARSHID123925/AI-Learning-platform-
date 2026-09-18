"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Video, Bell, Sparkles, Award, Clock, Play,
  CheckCircle2, ArrowRight, ArrowUpRight, TrendingUp,
  Flame, Star, Calendar, ClipboardList, Target, Zap, 
  ChevronRight, Compass, ShieldCheck, Check
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { fetchWithAuth } from '@/lib/api';

interface EnrolledCourse {
  course_id: string;
  course_title: string;
  category: string;
  icon: string;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  nextLessonTitle: string;
  nextLessonDuration: string;
}

const DEFAULT_COURSES: EnrolledCourse[] = [
  {
    course_id: "cs-101",
    course_title: "Introduction to Computer Science & Python",
    category: "Computer Science",
    icon: "💻",
    total_lessons: 12,
    completed_lessons: 8,
    percentage: 67,
    nextLessonTitle: "Lesson 9: Working with Lists & Dictionaries",
    nextLessonDuration: "15 mins"
  },
  {
    course_id: "eng-201",
    course_title: "Everyday English & Vocabulary Builder",
    category: "English & Languages",
    icon: "📖",
    total_lessons: 10,
    completed_lessons: 7,
    percentage: 70,
    nextLessonTitle: "Lesson 8: Professional Email & Dialogue",
    nextLessonDuration: "12 mins"
  },
  {
    course_id: "math-301",
    course_title: "Algebra & Problem Solving Masterclass",
    category: "Mathematics",
    icon: "📐",
    total_lessons: 15,
    completed_lessons: 4,
    percentage: 27,
    nextLessonTitle: "Lesson 5: Two-Step Linear Equations",
    nextLessonDuration: "20 mins"
  }
];

const UPCOMING_CLASSES = [
  {
    id: "live-1",
    title: "Python Logic & Interactive Debugging",
    instructor: "Dr. Alex Vance",
    time: "Tomorrow • 4:00 PM - 5:00 PM",
    subject: "Computer Science",
    status: "Upcoming"
  },
  {
    id: "live-2",
    title: "English Pronunciation & Accent Rhythm",
    instructor: "Sarah Jenkins",
    time: "Thursday • 6:00 PM - 7:00 PM",
    subject: "English",
    status: "Confirmed"
  }
];

const PENDING_HOMEWORK = [
  {
    id: "hw-1",
    title: "Python Function Lab: Temperature Converter",
    course: "Computer Science & Python",
    due: "Tomorrow, 5:00 PM",
    dueBadge: "Due Soon"
  },
  {
    id: "hw-2",
    title: "Algebra Problem Set #3 (Equations 1-8)",
    course: "Mathematics Masterclass",
    due: "Friday, 11:59 PM",
    dueBadge: "This Week"
  }
];

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Student");
  const [enrolledCourses] = useState<EnrolledCourse[]>(DEFAULT_COURSES);
  const [unreadCount, setUnreadCount] = useState(1);
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
        {/* TOP APP BAR */}
        <header className="h-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Welcome back, {userName}! Let's make today productive.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Practice Pill */}
            <Link
              href="/dashboard/ai-exam"
              className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Quiz Generator</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <button onClick={() => setUnreadCount(0)} className="text-[10px] text-[#027FFF] font-bold hover:underline">Mark read</button>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="font-bold text-slate-900">Python Homework Assigned</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Due tomorrow at 5:00 PM.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#027FFF] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {userName[0]?.toUpperCase() || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN FEED */}
        <main className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {/* 1. HERO BANNER: JUMP BACK IN */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#027FFF] via-blue-600 to-indigo-600 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-100 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/20">
                    <Play className="w-3 h-3 fill-white" /> Continue Learning
                  </span>
                  <span className="text-xs text-blue-100 font-medium">
                    {primaryCourse.completed_lessons} of {primaryCourse.total_lessons} Lessons Completed
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {primaryCourse.course_title}
                </h2>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 max-w-xl backdrop-blur-sm">
                  <span className="text-[10px] uppercase font-bold text-blue-200 block">Next Up</span>
                  <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                    {primaryCourse.nextLessonTitle}
                    <span className="text-xs text-blue-200 font-normal">({primaryCourse.nextLessonDuration})</span>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="max-w-md space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold text-blue-100">
                    <span>Course Progress</span>
                    <span>{primaryCourse.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-700" 
                      style={{ width: `${primaryCourse.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                <Link
                  href={`/courses/${primaryCourse.course_id}`}
                  className="px-6 py-3.5 rounded-2xl bg-white text-[#027FFF] font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-blue-50 hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-[#027FFF]" /> Resume Lesson Now
                </Link>
                <Link
                  href="/dashboard/courses"
                  className="text-center text-xs font-bold text-blue-100 hover:text-white py-1 transition-colors"
                >
                  View All Enrolled Courses &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* 2. 4 CORE METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Learning Streak</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">5 Days 🔥</p>
              <span className="text-[11px] text-emerald-600 font-bold">Consistent everyday</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Learning Hours</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#027FFF]">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">14.5 hrs</p>
              <span className="text-[11px] text-slate-500 font-medium">+2.5 hrs this week</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Quizzes Passed</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Star className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">18 Quizzes</p>
              <span className="text-[11px] text-purple-600 font-bold">89.4% avg score</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Certificates</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">2 Earned</p>
              <Link href="/dashboard/certificates" className="text-[11px] text-[#027FFF] font-bold hover:underline">
                View &amp; download &rarr;
              </Link>
            </div>
          </div>

          {/* 3. ACTIVE SUBJECT COURSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">My Enrolled Subjects</h3>
                <p className="text-xs text-slate-500">Your current courses across Computer, English, and Mathematics</p>
              </div>
              <Link 
                href="/dashboard/courses" 
                className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1"
              >
                Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {enrolledCourses.map((c) => (
                <div 
                  key={c.course_id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md flex flex-col justify-between space-y-4 transition-all group shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.icon}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {c.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors line-clamp-2">
                      {c.course_title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {c.completed_lessons} of {c.total_lessons} lessons completed
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#027FFF] rounded-full" 
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">{c.percentage}% Done</span>
                      <Link 
                        href={`/courses/${c.course_id}`}
                        className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1"
                      >
                        Open Course <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TWO-COLUMN: LIVE SESSIONS & HOMEWORK TASKS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live Class Schedule */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Upcoming Live Classes</h3>
                    <p className="text-[11px] text-slate-500">Interactive live video sessions</p>
                  </div>
                </div>
                <Link href="/dashboard/live" className="text-xs font-bold text-rose-600 hover:underline">
                  Full Schedule
                </Link>
              </div>

              <div className="space-y-3">
                {UPCOMING_CLASSES.map((cls) => (
                  <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase block">{cls.time}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{cls.title}</h4>
                      <p className="text-[11px] text-slate-500">{cls.instructor} • {cls.subject}</p>
                    </div>
                    <Link 
                      href="/dashboard/live"
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs flex-shrink-0"
                    >
                      Join Class
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Homework */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pending Homework</h3>
                    <p className="text-[11px] text-slate-500">Tasks assigned by your instructors</p>
                  </div>
                </div>
                <Link href="/dashboard/assignments" className="text-xs font-bold text-[#027FFF] hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {PENDING_HOMEWORK.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase block">{hw.due}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{hw.title}</h4>
                      <p className="text-[11px] text-slate-500">{hw.course}</p>
                    </div>
                    <Link 
                      href="/dashboard/assignments"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex-shrink-0"
                    >
                      Submit
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. QUICK AI PRACTICE CALLOUT */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/70 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Instant AI Exam &amp; Quiz Engine
              </span>
              <h3 className="text-lg font-black text-slate-900">Test Your Knowledge on Any Subject in 5 Minutes</h3>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Generate custom practice quizzes on Python, Grammar, Fractions, or Science with instant grading and step-by-step explanations.
              </p>
            </div>

            <Link
              href="/dashboard/ai-exam"
              className="px-6 py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Generate Practice Quiz Now &rarr;
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
