"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Headphones, PenTool, Mic, 
  LineChart as LineChartIcon, Settings, Video, LogOut, Bell, Users,
  BrainCircuit, TrendingUp, Target, Flame, AlertCircle, ChevronRight,
  Globe2, GraduationCap, CheckCircle2, X, RefreshCw, Sparkles, ArrowUpRight,
  HelpCircle, Award, Clock, Play
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';
import DiagnosticPlacementModal from '@/components/DiagnosticPlacementModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SkillMasteryItem {
  skill_id: string;
  skill_name: string;
  score: number; // 0-1
  status: string;
}
interface CourseProgress {
  course_id: string;
  course_title: string;
  course_slug?: string;
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
}
interface DashboardData {
  student_name: string;
  overall_completion_percentage: number;
  skill_mastery_radar: SkillMasteryItem[];
  active_remediations: { skill_name: string; title: string; instructor_escalated: boolean }[];
  unread_notifications_count: number;
  enrolled_courses: CourseProgress[];
  next_recommended_lesson: { lesson_title: string; course_title: string; lesson_id: string } | null;
}
interface WeaknessFlag {
  id: string;
  score_at_flag: number;
  threshold: number;
  status: string;
  created_at: string;
}
interface Notification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [courseTrack, setCourseTrack] = useState<string | null>(null);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [weaknessFlags, setWeaknessFlags] = useState<WeaknessFlag[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [studentEnrolledCourses, setStudentEnrolledCourses] = useState<CourseProgress[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    estimatedBand: number;
    levelName: string;
    targetMilestone: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    const savedRole = (localStorage.getItem('user_role') || '').toLowerCase();
    if (savedRole === 'instructor' || savedRole === 'teacher') {
      router.push('/instructor');
      return;
    }
    if (savedRole === 'admin' || savedRole === 'superadmin') {
      router.push('/admin/courses');
      return;
    }

    const savedTrack = localStorage.getItem('courseTrack');
    const savedName = localStorage.getItem('user_name');
    const diagnosticDone = localStorage.getItem('diagnostic_completed');
    const savedDiagData = localStorage.getItem('diagnostic_data');

    if (savedName) setUserName(savedName);
    if (savedTrack) setCourseTrack(savedTrack);
    
    // Clean up any old dummy fallback from local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student_enrolled_courses');
    }

    if (savedDiagData) {
      try {
        setDiagnosticResult(JSON.parse(savedDiagData));
      } catch {
        // ignore parse error
      }
    } else if (!diagnosticDone && savedTrack) {
      // Prompt new users who haven't completed the 5-min diagnostic yet
      setShowDiagnostic(true);
    }

    setIsAuth(true);
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, flagsRes, notifRes] = await Promise.all([
        fetchWithAuth('/students/me/dashboard'),
        fetchWithAuth('/students/me/weakness-flags'),
        fetchWithAuth('/notifications'),
      ]);

      if (dashRes.ok) {
        const d: DashboardData = await dashRes.json();
        setDashData(d);
        setUnreadCount(d.unread_notifications_count);
      }
      if (flagsRes.ok) {
        const flags: WeaknessFlag[] = await flagsRes.json();
        setWeaknessFlags(flags);
      }
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const items: Notification[] = Array.isArray(notifData) ? notifData : (notifData.items || []);
        setNotifications(items);
        if (notifData.unread_count !== undefined) setUnreadCount(notifData.unread_count);
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    await fetchWithAuth(`/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetchWithAuth('/notifications/read-all', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleSelectTrack = (track: string) => {
    localStorage.setItem('courseTrack', track);
    setCourseTrack(track);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8]">
        <div className="w-10 h-10 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── ONBOARDING MODAL ────────────────────────────────────────────────────────
  if (!courseTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF2F6] via-[#E2E8F0] to-[#EEF2F6] p-4 font-sans relative overflow-hidden">
        <div className="w-full max-w-4xl z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/80 border border-slate-200 p-2.5 mb-6">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Welcome to PPAcademia AI</h1>
            <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">Select your personalized focus track. The AI engine will dynamically calibrate your modules and metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => handleSelectTrack('general')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#027FFF] transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#027FFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Globe2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">General English</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Master everyday conversational and professional English across global CEFR levels (A1 to C2).</p>
              <div className="mt-auto px-6 py-3 rounded-full bg-slate-100 text-slate-800 font-bold text-sm group-hover:bg-[#027FFF] group-hover:text-white transition-all duration-300 shadow-sm">
                Select General English Track →
              </div>
            </button>

            <button 
              onClick={() => handleSelectTrack('ielts')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#027FFF] transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#027FFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">IELTS Preparation</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Intensive, multi-agent evaluation for Academic or General Training with examiner-calibrated band precision.</p>
              <div className="mt-auto px-6 py-3 rounded-full bg-slate-100 text-slate-800 font-bold text-sm group-hover:bg-[#027FFF] group-hover:text-white transition-all duration-300 shadow-sm">
                Select IELTS Track →
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── DERIVED DATA ─────────────────────────────────────────────────────────────
  const isIELTS = courseTrack === 'ielts';

  const radarData = dashData?.skill_mastery_radar?.length
    ? dashData.skill_mastery_radar.map(s => ({
        subject: s.skill_name.length > 14 ? s.skill_name.slice(0, 14) + '…' : s.skill_name,
        A: Math.round(s.score * 100),
        fullMark: 100,
      }))
    : (isIELTS
        ? [
            { subject: 'Lexical Resource', A: 75, fullMark: 100 },
            { subject: 'Grammar', A: 68, fullMark: 100 },
            { subject: 'Coherence', A: 80, fullMark: 100 },
            { subject: 'Pronunciation', A: 62, fullMark: 100 },
            { subject: 'Task Achievement', A: 70, fullMark: 100 },
          ]
        : [
            { subject: 'Vocabulary', A: 75, fullMark: 100 },
            { subject: 'Grammar', A: 68, fullMark: 100 },
            { subject: 'Conversation', A: 60, fullMark: 100 },
            { subject: 'Listening', A: 78, fullMark: 100 },
            { subject: 'Reading', A: 82, fullMark: 100 },
          ]);

  const progressHistory = dashData?.enrolled_courses?.length
    ? dashData.enrolled_courses.map((c) => ({
        name: c.course_title.slice(0, 8),
        score: isIELTS
          ? +(4 + c.percentage / 20).toFixed(1)
          : Math.round(c.percentage),
      }))
    : (isIELTS
        ? [{ name: 'Wk 1', score: 5.5 }, { name: 'Wk 2', score: 6.0 }, { name: 'Wk 3', score: 6.5 }, { name: 'Wk 4', score: 7.0 }]
        : [{ name: 'Wk 1', score: 30 }, { name: 'Wk 2', score: 50 }, { name: 'Wk 3', score: 65 }, { name: 'Wk 4', score: 75 }]);

  const completionPct = dashData?.overall_completion_percentage ?? 0;
  const estBand = dashData ? Math.min(9, +(4.5 + (completionPct / 100) * 4.5).toFixed(1)) : null;
  const cefrLevel = completionPct < 20 ? 'A2' : completionPct < 40 ? 'B1' : completionPct < 65 ? 'B2' : completionPct < 85 ? 'C1' : 'C2';
  const successProbability = dashData ? Math.min(99, Math.round(50 + completionPct / 2)) : null;

  const insightCards = weaknessFlags.slice(0, 3).map(f => ({
    type: 'warning' as const,
    title: 'Weakness Detected',
    body: `Score ${(f.score_at_flag * 100).toFixed(0)}% — below threshold of ${(f.threshold * 100).toFixed(0)}%. Status: ${f.status}.`,
  }));

  const handleEnrollInCourse = async (crs: { id: string; title: string }) => {
    try {
      const res = await fetchWithAuth('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ course_id: crs.id }),
      });
      if (res.ok || res.status === 409) {
        toast.success('Enrolled Successfully! 🎉', `"${crs.title}" is now active in your dashboard.`);
        loadAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error('Enrollment Failed', err.message || 'Could not enroll in course.');
      }
    } catch {
      toast.error('Network Error', 'Failed to reach server.');
    }
  };

  const enrolledCourses = dashData?.enrolled_courses || [];

  // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">

      {/* ── SIDEBAR: Rich Deep Indigo / Slate ── */}
      <aside className="w-64 flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col justify-between hidden md:flex h-screen overflow-y-auto shadow-xl z-20">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800 sticky top-0 bg-[#0F172A] z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-md">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight group-hover:text-[#5BC0EB] transition-colors">PPAcademia</span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">AI Platform</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-3 px-3">Main Menu</div>
            
            <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#027FFF] text-white font-bold shadow-md shadow-[#027FFF]/20 text-sm">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            
            <Link href="/dashboard/courses" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
              <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              Course Catalog
            </Link>

            <Link href="/dashboard/adaptive" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
              <BrainCircuit className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              Adaptive Engine
            </Link>

            {isIELTS ? (
              <>
                <Link href="/dashboard/mock-exam" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  Mock Exam
                </Link>
                <Link href="/dashboard/writing" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <PenTool className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Writing Studio
                </Link>
                <Link href="/dashboard/vocabulary" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  Vocabulary (SM-2)
                </Link>
                <Link href="/dashboard/grammar" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <PenTool className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  Grammar Drills
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/vocabulary" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  Vocabulary
                </Link>
                <Link href="/dashboard/grammar" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <PenTool className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  Grammar
                </Link>
                <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <Mic className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Conversation (AI)
                </Link>
                <Link href="/dashboard/mock-exam" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium transition-colors group text-sm">
                  <Headphones className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  Comprehension
                </Link>
              </>
            )}
            
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-3">Live Hubs</div>
            <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-emerald-400 font-medium transition-colors group text-sm">
              <Mic className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              AI Simulator
            </Link>
            <Link href="/dashboard/results" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-blue-400 font-medium transition-colors text-sm">
              <LineChartIcon className="w-4 h-4 text-blue-400" />
              Past Results
            </Link>
            <Link href="/dashboard/live" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-purple-400 font-medium transition-colors text-sm">
              <Video className="w-4 h-4 text-purple-400" />
              Live Classes
            </Link>
            <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-rose-400 font-medium transition-colors text-sm">
              <BookOpen className="w-4 h-4 text-rose-400" />
              Lesson Player
            </Link>
            <Link href="/instructor" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 font-medium transition-colors text-sm">
              <Users className="w-4 h-4 text-indigo-400" />
              Instructor Hub
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-amber-400 font-medium transition-colors text-sm">
              <Settings className="w-4 h-4 text-amber-400" />
              Admin Studio
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('courseTrack'); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F4F8]">
        
        {/* TOP BAR: Clean Crisp White with Border Shadow */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-xs text-slate-500 font-semibold">{isIELTS ? 'IELTS Academic Track' : 'General English Mastery'}</p>
            </div>
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Telemetry Active
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDiagnostic(true)}
              className="text-xs font-bold text-[#027FFF] hover:text-[#026bd6] px-3 py-1.5 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{diagnosticResult ? `Diagnostic: Band ${diagnosticResult.estimatedBand}` : '5-Min Placement Test'}</span>
            </button>

            <button 
              onClick={() => { localStorage.removeItem('courseTrack'); setCourseTrack(null); }}
              className="text-xs font-bold text-slate-600 hover:text-[#027FFF] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors"
            >
              Switch Track
            </button>

            {/* 🔔 NOTIFICATION BELL */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#027FFF]" />
                      <span className="font-bold text-slate-900 text-sm">Live Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{unreadCount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#027FFF] hover:underline flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}>
                        <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-300" />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && markNotificationRead(n.id)}
                          className={`px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {!n.read && <span className="w-2 h-2 rounded-full bg-[#027FFF] flex-shrink-0 mt-0.5"></span>}
                                <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <button onClick={() => { setNotifOpen(false); loadAllData(); }} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors">
                      <RefreshCw className="w-3 h-3" /> Refresh Feed
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200"></div>
            
            {/* User Profile Capsule */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{dashData?.student_name || userName}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{isIELTS ? 'Candidate' : 'Learner'}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#027FFF] to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {(dashData?.student_name || userName || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD FEED */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
              Calibrating adaptive metrics…
            </div>
          )}

          {/* ── 30-DAY AI STUDY PATH & DAILY STREAK MISSION ── */}
          <div className="bg-gradient-to-br from-[#0B1329] via-[#111C44] to-[#0A1026] border border-blue-900/40 rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
              
              {/* Left Column: Mission Details */}
              <div className="flex-1 space-y-4">
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    5-DAY STREAK ACTIVE
                  </span>
                  
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5 font-mono shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Target Exam: Oct 28, 2026 (42 Days Left)
                  </span>
                </div>

                {/* Main Heading & Recommendation */}
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                    Day 12 of 30: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-cyan-300">Academic Argumentation Mastery</span>
                  </h2>
                  <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1.5 font-medium">
                    Today&apos;s AI diagnosis recommends strengthening your <span className="text-amber-400 font-bold underline decoration-amber-400/40 underline-offset-2">Lexical Cohesion</span> and completing 1 Speaking drill on abstract question expansion.
                  </p>
                </div>

                {/* Checklist of Daily 15-Minute Missions (High Contrast & Clear Active State) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  
                  {/* Task 1: Completed */}
                  <Link 
                    href="/dashboard/writing" 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:bg-slate-900 hover:border-emerald-400 transition-all group backdrop-blur-md shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Task 2 Essay Drill</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Completed (Band 6.0)</p>
                      </div>
                    </div>
                  </Link>

                  {/* Task 2: Active & Ready (Next Up Glowing Card) */}
                  <Link 
                    href="/dashboard/simulator" 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-2 border-blue-400 hover:border-cyan-300 transition-all group backdrop-blur-md shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/30 relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-400/20 rounded-full blur-lg"></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/50 shrink-0 animate-pulse">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white group-hover:text-cyan-200 transition-colors">Part 2 Cue Card</p>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-black uppercase">Next Up</span>
                        </div>
                        <p className="text-[10px] text-blue-200 font-semibold">Ready to start (2 mins)</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-blue-300 group-hover:text-white transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative z-10" />
                  </Link>

                  {/* Task 3: Up Next */}
                  <Link 
                    href="/dashboard/lesson" 
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 hover:bg-slate-900/90 hover:border-slate-600 transition-all group backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 shrink-0 font-bold text-xs">
                        3
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Lexical Guide Video</p>
                        <p className="text-[10px] text-slate-400 font-medium">Next lesson (8 mins)</p>
                      </div>
                    </div>
                  </Link>

                </div>
              </div>

              {/* Right Column: Modern Circular Progress Ring */}
              <div className="shrink-0 flex flex-col items-center bg-slate-900/90 border border-blue-500/20 rounded-3xl p-5 text-center min-w-[200px] shadow-lg backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
                
                <span className="text-[11px] text-blue-300 font-black uppercase tracking-wider mb-2">
                  30-Day Milestone
                </span>

                {/* Circular Gauge Graphic */}
                <div className="relative w-24 h-24 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress arc */}
                    <path
                      className="text-[#027FFF]"
                      strokeDasharray="40, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="url(#progressGradient)"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#027FFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white leading-none">40%</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Progress</span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-xs text-emerald-400 font-bold block">12 of 30 Days Completed</span>
                  <span className="text-[10px] text-slate-400 font-medium">18 Days Remaining</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── METRICS CARDS ROW: High Polish Elevation ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Metric 1: Band / Level */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-[#027FFF] shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  {completionPct > 0 ? `${completionPct.toFixed(0)}% Done` : 'New'}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{isIELTS ? 'Estimated Band' : 'Current CEFR Level'}</h3>
              <div className="text-4xl font-black text-slate-900 tracking-tight">
                {isIELTS ? (estBand ?? '–') : cefrLevel}
              </div>
            </div>

            {/* Metric 2: Target Band */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full">
                  Target
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{isIELTS ? 'Target Band' : 'Target Level'}</h3>
              <div className="text-4xl font-black text-slate-900 tracking-tight">{isIELTS ? '8.0' : 'C1'}</div>
            </div>

            {/* Metric 3: Success Probability */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  Live AI
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Success Probability</h3>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">{successProbability ?? '–'}%</div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${successProbability ?? 0}%` }}
                ></div>
              </div>
            </div>

            {/* Metric 4: Active Remediations */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-full">
                  Urgent
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Remediations</h3>
              <div className="text-4xl font-black text-slate-900 tracking-tight">{dashData?.active_remediations?.length ?? '0'}</div>
            </div>

          </div>

          {/* ── EXAMINER FEEDBACK & HUMAN AI-OVERRIDE DISPATCH ── */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border border-purple-800/80 rounded-3xl p-6 lg:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-purple-300" /> Official Certified Examiner Review
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium font-mono">Assessed by Senior Examiner</span>
                </div>

                <h3 className="text-lg font-black text-white tracking-tight">
                  Task 2 Essay: AI in Healthcare &amp; Wealth Disparity
                </h3>

                <p className="text-xs text-purple-100/90 leading-relaxed font-serif bg-white/5 border border-white/10 rounded-2xl p-3.5">
                  &ldquo;Commendable coherence across body paragraphs. However, allocate greater focus to conditional inversion and nominalization in your topic sentences to unlock Band 8.0+ Grammatical Range.&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-purple-800/40 border border-purple-500/30 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                    <span className="text-purple-300">TR: 6.5</span> • 
                    <span className="text-purple-300">CC: 6.5</span> • 
                    <span className="text-purple-300">LR: 7.0</span> • 
                    <span className="text-purple-300">GRA: 6.0</span>
                  </div>
                  <span className="text-xs text-slate-300 font-bold">
                    Target Recovery: <strong className="text-amber-400 font-bold">Inversion &amp; Complex Syntax Mastery</strong>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                <div className="text-center sm:text-right bg-white/10 border border-white/15 px-5 py-3 rounded-2xl w-full sm:w-auto">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block mb-0.5">Examiner Calibrated Band</span>
                  <span className="text-3xl font-black text-white font-mono">Band 6.5</span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Verified vs Cambridge Rubric</span>
                </div>

                <Link
                  href="/dashboard/writing"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-black transition-all shadow-md shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Launch Assigned Recovery Drill &rarr;
                </Link>
              </div>

            </div>
          </div>

          {/* ── MY ACTIVE ENROLLED COURSES (HERO SECTION) ── */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Curriculum</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">My Enrolled Courses &amp; Learning Tracks</h2>
                <p className="text-xs text-slate-500">Pick up where you left off or explore new modules.</p>
              </div>
              <Link 
                href="/dashboard/courses" 
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#027FFF] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 w-fit shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Browse Full Catalog &rarr;
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledCourses.map((c, idx) => (
                  <div 
                    key={c.course_id || idx} 
                    className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-[#027FFF] transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#027FFF]/10 text-[#027FFF]">
                          {isIELTS ? 'IELTS Track' : 'General Track'}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {c.completed_lessons} / {c.total_lessons} Lessons
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-[#027FFF] transition-colors line-clamp-2">
                        {c.course_title}
                      </h3>
                    </div>

                    <div>
                      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-[#027FFF] to-cyan-400 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(5, c.percentage)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-xs font-bold text-slate-500">{c.percentage.toFixed(0)}% Done</span>
                        <Link 
                          href="/dashboard/lesson" 
                          className="px-3.5 py-1.5 rounded-lg bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                        >
                          Continue Lesson <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">No courses enrolled yet</h3>
                <p className="text-xs text-slate-500 mb-4">Explore the course catalog to enroll in examiner-curated preparation modules.</p>
                <Link href="/dashboard/courses" className="px-4 py-2 rounded-xl bg-[#027FFF] text-white text-xs font-bold">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* ── CHARTS ROW: White Cards with Modern Shadow ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Proficiency Trajectory</h2>
                  <p className="text-xs text-slate-500 font-medium">Progress timeline calibrated across course milestones.</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#027FFF] shadow-xs">
                  <option>{isIELTS ? 'Overall Band' : 'Overall Score'}</option>
                  <option>{isIELTS ? 'Reading' : 'Grammar'}</option>
                  <option>{isIELTS ? 'Writing' : 'Vocabulary'}</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={isIELTS ? [4, 9] : [0, 100]} stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '14px', color: '#FFFFFF', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} itemStyle={{ color: '#5BC0EB', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="score" stroke="#027FFF" strokeWidth={3.5} dot={{ r: 4, fill: '#FFFFFF', stroke: '#027FFF', strokeWidth: 2.5 }} activeDot={{ r: 7, fill: '#027FFF' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-7 flex flex-col shadow-sm">
              <div className="mb-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Diagnostic Profile</h2>
                <p className="text-xs text-slate-500 font-medium">Competency breakdown from live AI grading.</p>
              </div>
              <div className="flex-1 min-h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#027FFF" strokeWidth={2.5} fill="#027FFF" fillOpacity={0.18} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW: Curriculum Exploration & AI Insights ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Explore Available Curriculum & Modules */}
            <div className="lg:col-span-2 space-y-6">

              {/* Discover & Self-Enroll in Available Courses */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Explore Available Curriculum</h3>
                    <p className="text-xs text-slate-500 font-medium">Examiner-calibrated courses published on the platform</p>
                  </div>
                  <Link href="/dashboard/courses" className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1">
                    View Full Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'c-1', title: 'IELTS Academic Writing Masterclass', modules: 6, tag: 'Band 7.5+' },
                    { id: 'c-2', title: 'Speaking Part 2 & 3 Fluency Bootcamp', modules: 8, tag: 'Band 8.0+' },
                    { id: 'c-3', title: 'Advanced Lexical Collocations & GRA Inversion', modules: 4, tag: 'Band 8.5+' }
                  ].map(crs => {
                    const isEnrolled = enrolledCourses.some(c => c.course_id === crs.id || c.course_title === crs.title);
                    return (
                      <div key={crs.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#027FFF]/10 text-[#027FFF]">
                              {crs.tag}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">{crs.modules} Modules</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{crs.title}</h4>
                        </div>
                        {isEnrolled ? (
                          <Link 
                            href="/dashboard/lesson"
                            className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Enrolled • Continue &rarr;
                          </Link>
                        ) : (
                          <button 
                            onClick={() => handleEnrollInCourse(crs)}
                            className="w-full py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold transition-all text-center shadow-xs"
                          >
                            + Enroll in Course
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Adaptive Modules */}
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4">Interactive Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <Link href="/dashboard/simulator" className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-[#027FFF] rounded-3xl p-6 transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#027FFF] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <Mic className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Voice</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1">
                      {isIELTS ? 'Speaking Simulator' : 'Conversation Drill'}
                    </h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed font-medium">
                      Real-time audio evaluation with IELTS examiner rubric feedback.
                    </p>
                    <span className="inline-flex items-center text-xs font-bold text-[#027FFF] group-hover:translate-x-1 transition-transform">
                      Launch Simulator <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </Link>

                  <Link href="/dashboard/adaptive" className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-amber-500 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Adaptive</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1">Adaptive Engine</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed font-medium">
                      Diagnose gaps and generate custom targeted recalibration drills.
                    </p>
                    <span className="inline-flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      View Diagnostics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </Link>

                  <Link href="/dashboard/live" className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-purple-500 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <Video className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">WebRTC</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1">Live Classes</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed font-medium">
                      Join instructor-led virtual rooms and interactive breakout groups.
                    </p>
                    <span className="inline-flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                      Join Classroom <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </Link>

                  <Link href="/dashboard/lesson" className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-rose-500 rounded-3xl p-6 transition-all shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Video</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1">Lesson Player</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed font-medium">
                      {dashData?.next_recommended_lesson
                        ? `Next: ${dashData.next_recommended_lesson.lesson_title}`
                        : 'Continue your structured self-paced video courses.'}
                    </p>
                    <span className="inline-flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
                      Continue Learning <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </Link>

                </div>
              </div>
            </div>

            {/* AI Insights Feed */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-7 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#027FFF]" />
                  AI Insights
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              
              <div className="space-y-4 flex-1">

                {/* Active Remediations */}
                {dashData?.active_remediations?.length ? (
                  dashData.active_remediations.slice(0, 2).map((r, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-red-50 border border-red-200/70 shadow-xs">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">Weak Area: {r.skill_name}</h4>
                          <p className="text-xs text-red-700 leading-relaxed mb-2 font-medium">{r.title}</p>
                          {r.instructor_escalated && (
                            <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">⚠ Escalated to instructor</span>
                          )}
                          <Link href="/dashboard/adaptive" className="block text-xs font-bold text-red-600 hover:underline mt-1">Fix weakness →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : insightCards.length ? (
                  insightCards.map((ins, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-red-50 border border-red-200/70 shadow-xs">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">{ins.title}</h4>
                          <p className="text-xs text-red-700 leading-relaxed mb-2 font-medium">{ins.body}</p>
                          <Link href="/dashboard/adaptive" className="text-xs font-bold text-red-600 hover:underline">Fix now →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 mb-1">All Skills Healthy</h4>
                        <p className="text-xs text-emerald-700 leading-relaxed font-medium">No critical weaknesses detected in recent assessments.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Progress Insight */}
                {completionPct > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 shadow-xs">
                    <div className="flex gap-3">
                      <TrendingUp className="w-5 h-5 text-[#027FFF] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 mb-1">
                          {isIELTS ? 'Band Trajectory' : 'Level Mastery'}
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                          {completionPct.toFixed(0)}% course completion recorded.
                          {dashData?.next_recommended_lesson && ` Next: ${dashData.next_recommended_lesson.lesson_title}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unread notifications prompt */}
                {unreadCount > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 shadow-xs">
                    <div className="flex gap-3">
                      <Bell className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">New Notifications</h4>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">You have {unreadCount} unread update{unreadCount > 1 ? 's' : ''}.</p>
                        <button onClick={() => setNotifOpen(true)} className="text-xs font-bold text-indigo-600 hover:underline mt-1">View Notifications →</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </main>
      </div>

      {/* 5-Min Diagnostic Level Placement Modal */}
      <DiagnosticPlacementModal
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        onComplete={(res) => {
          setDiagnosticResult(res);
          loadAllData();
        }}
      />
    </div>
  );
}
