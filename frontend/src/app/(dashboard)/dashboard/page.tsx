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
  Globe2, GraduationCap, CheckCircle2, X, RefreshCw
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

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
  course_slug: string;
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
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on outside click
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

    const savedTrack = localStorage.getItem('courseTrack');
    const savedName = localStorage.getItem('user_name');
    if (savedName) setUserName(savedName);
    if (savedTrack) setCourseTrack(savedTrack);

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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── ONBOARDING MODAL ────────────────────────────────────────────────────────
  if (!courseTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 font-sans relative overflow-hidden">
        <div className="w-full max-w-4xl z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200 p-2 mb-6">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Welcome to PPAcademia AI</h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">To personalize your adaptive learning engine, please select your primary focus. The AI will completely recalibrate your dashboard based on this choice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => handleSelectTrack('general')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#027FFF] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#027FFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">General English</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Master everyday conversational and professional English. Track your progress across global CEFR levels (A1 to C2).</p>
              <div className="mt-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm group-hover:bg-[#027FFF] group-hover:text-white transition-colors duration-300">
                Select General English
              </div>
            </button>

            <button 
              onClick={() => handleSelectTrack('ielts')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200/80 hover:border-[#027FFF] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#027FFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">IELTS Preparation</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">Intensive, multi-agent evaluation for Academic or General Training. Target a specific Band Score with examiner-calibrated precision.</p>
              <div className="mt-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm group-hover:bg-[#027FFF] group-hover:text-white transition-colors duration-300">
                Select IELTS Track
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

  const enrolledCourses = dashData?.enrolled_courses ?? [];

  // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between hidden md:flex h-screen overflow-y-auto shadow-sm">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-slate-50 p-1 flex items-center justify-center border border-slate-200 group-hover:border-[#027FFF] transition-colors shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-[#027FFF] transition-colors">PPAcademia</span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">AI Platform</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-3 px-3">Menu</div>
            
            <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#027FFF]/10 text-[#027FFF] font-semibold border border-[#027FFF]/20">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            
            <Link href="/dashboard/adaptive" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors group">
              <BrainCircuit className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              Adaptive Engine
            </Link>

            {isIELTS ? (
              <>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><BookOpen className="w-4 h-4 text-slate-400" />Reading</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><Headphones className="w-4 h-4 text-slate-400" />Listening</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><PenTool className="w-4 h-4 text-slate-400" />Writing</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><Mic className="w-4 h-4 text-slate-400" />Speaking</Link>
              </>
            ) : (
              <>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><BookOpen className="w-4 h-4 text-slate-400" />Vocabulary</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><PenTool className="w-4 h-4 text-slate-400" />Grammar</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><Mic className="w-4 h-4 text-slate-400" />Conversation</Link>
                <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors"><Headphones className="w-4 h-4 text-slate-400" />Comprehension</Link>
              </>
            )}
            
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Platform</div>
            <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-600 font-medium transition-colors group">
              <Mic className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              AI Simulator
            </Link>
            <Link href="/dashboard/results" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 font-medium transition-colors">
              <LineChartIcon className="w-4 h-4 text-blue-500" />
              Past Results
            </Link>
            <Link href="/dashboard/live" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-purple-600 font-medium transition-colors">
              <Video className="w-4 h-4 text-purple-500" />
              Live Classes
            </Link>
            <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-rose-600 font-medium transition-colors">
              <BookOpen className="w-4 h-4 text-rose-500" />
              Lesson Player
            </Link>
            <Link href="/instructor" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 font-medium transition-colors">
              <Users className="w-4 h-4 text-indigo-500" />
              Instructor Hub
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-amber-600 font-medium transition-colors">
              <Settings className="w-4 h-4 text-amber-500" />
              Admin Studio
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('courseTrack'); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        
        {/* TOP BAR */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isIELTS ? 'IELTS Engine Online' : 'General English Engine Online'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { localStorage.removeItem('courseTrack'); setCourseTrack(null); }}
              className="text-xs font-semibold text-slate-600 hover:text-[#027FFF] underline"
            >
              Switch Track
            </button>

            {/* 🔔 NOTIFICATION BELL */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#027FFF]" />
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{unreadCount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#027FFF] hover:underline flex items-center gap-1 font-semibold">
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
                          className={`px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {!n.read && <span className="w-2 h-2 rounded-full bg-[#027FFF] flex-shrink-0 mt-0.5"></span>}
                                <p className="text-sm font-semibold text-slate-900 truncate">{n.title}</p>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.body}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <button onClick={() => { setNotifOpen(false); loadAllData(); }} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">{dashData?.student_name || userName}</p>
                <p className="text-xs text-slate-500 font-medium">{isIELTS ? 'IELTS Academic' : `CEFR ${cefrLevel} Level`}</p>
              </div>
              <button 
                onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('courseTrack'); router.push('/login'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {loading && (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
              Loading your learning data…
            </div>
          )}

          {/* ── METRICS ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Metric 1: Band / Level */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#027FFF]"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{isIELTS ? 'Estimated Band' : 'Current CEFR Level'}</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  {isIELTS ? (estBand ?? '–') : cefrLevel}
                </span>
                <span className="text-sm text-emerald-600 font-semibold mb-1">
                  {completionPct > 0 ? `${completionPct.toFixed(0)}% complete` : 'Getting started'}
                </span>
              </div>
            </div>

            {/* Metric 2: Target */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600"><Target className="w-5 h-5" /></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{isIELTS ? 'Target Band' : 'Target Level'}</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">{isIELTS ? '8.0' : 'C1'}</span>
                <span className="text-sm text-slate-500 font-medium mb-1">{isIELTS ? 'Academic' : 'Advanced'}</span>
              </div>
            </div>

            {/* Metric 3: Probability */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><BrainCircuit className="w-5 h-5" /></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Success Probability</h3>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{successProbability ?? '–'}%</span>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                    style={{ width: `${successProbability ?? 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Metric 4: Active Remediations */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600"><Flame className="w-5 h-5" /></div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Remediations</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">{dashData?.active_remediations?.length ?? '0'}</span>
                <span className="text-sm text-slate-500 font-medium mb-1">
                  {dashData?.active_remediations?.length === 1 ? 'Skill to fix' : 'Skills to fix'}
                </span>
              </div>
            </div>

          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Proficiency Trajectory</h2>
                  <p className="text-sm text-slate-500">Your progress across enrolled courses over time.</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#027FFF]">
                  <option>{isIELTS ? 'Overall Band' : 'Overall Score'}</option>
                  <option>{isIELTS ? 'Reading' : 'Grammar'}</option>
                  <option>{isIELTS ? 'Writing' : 'Vocabulary'}</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={isIELTS ? [4, 9] : [0, 100]} stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#027FFF' }} />
                    <Line type="monotone" dataKey="score" stroke="#027FFF" strokeWidth={3} dot={{ r: 4, fill: '#FFFFFF', stroke: '#027FFF', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#027FFF' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-slate-900">AI Diagnostic Profile</h2>
                <p className="text-sm text-slate-500">Live capability breakdown across competencies.</p>
              </div>
              <div className="flex-1 min-h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#027FFF" strokeWidth={2} fill="#027FFF" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Enrolled Courses + Quick Modules */}
            <div className="lg:col-span-2 space-y-6">

              {/* Enrolled Courses */}
              {enrolledCourses.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">My Enrolled Courses</h2>
                  <div className="space-y-3">
                    {enrolledCourses.map(c => (
                      <div key={c.course_id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">{c.course_title}</span>
                          <span className="text-xs text-slate-500 font-medium">{c.completed_lessons}/{c.total_lessons} lessons</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#027FFF] to-cyan-400 rounded-full transition-all duration-700"
                            style={{ width: `${c.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-slate-500">{c.percentage.toFixed(0)}% complete</span>
                          <Link href="/dashboard/lesson" className="text-xs text-[#027FFF] font-bold hover:underline">Continue →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Modules */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Adaptive Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-[#027FFF] rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#027FFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Module 1</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {isIELTS ? 'Speaking Simulator' : 'Conversation Drill'}
                    </h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {isIELTS ? 'Real-time voice evaluation with the Examiner AI agent.' : 'Practice real-life dialogues with responsive AI avatars.'}
                    </p>
                    <Link href="/dashboard/simulator" className="flex items-center text-xs font-bold text-[#027FFF] group-hover:translate-x-1 transition-transform">
                      Start Drill <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>

                  <div className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-amber-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Module 2</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Adaptive Engine</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      AI detects your weak areas and generates targeted remediation exercises.
                    </p>
                    <Link href="/dashboard/adaptive" className="flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                      View Plan <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>

                  <div className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-purple-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Module 3</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Live Classes</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      Join interactive live instructor sessions and group practice rooms.
                    </p>
                    <Link href="/dashboard/live" className="flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                      Join Session <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>

                  <div className="group bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-rose-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Module 4</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Lesson Player</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                      {dashData?.next_recommended_lesson
                        ? `Next: ${dashData.next_recommended_lesson.lesson_title}`
                        : 'Continue your structured self-paced video courses.'}
                    </p>
                    <Link href="/dashboard/lesson" className="flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
                      Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>

            {/* AI Insights Feed — Real Data */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#027FFF]" />
                  AI Insights
                </h2>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              
              <div className="space-y-3.5 flex-1">

                {/* Active Remediations */}
                {dashData?.active_remediations?.length ? (
                  dashData.active_remediations.slice(0, 2).map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-red-50/70 border border-red-200/70">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">Weak Area: {r.skill_name}</h4>
                          <p className="text-xs text-red-700 leading-relaxed mb-2">{r.title}</p>
                          {r.instructor_escalated && (
                            <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">⚠ Escalated to instructor</span>
                          )}
                          <Link href="/dashboard/adaptive" className="block text-xs font-bold text-red-600 hover:underline mt-1.5">Fix now →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : insightCards.length ? (
                  insightCards.map((ins, i) => (
                    <div key={i} className="p-4 rounded-xl bg-red-50/70 border border-red-200/70">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">{ins.title}</h4>
                          <p className="text-xs text-red-700 leading-relaxed mb-2">{ins.body}</p>
                          <Link href="/dashboard/adaptive" className="text-xs font-bold text-red-600 hover:underline">Fix now →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 mb-1">All Skills Healthy</h4>
                        <p className="text-xs text-emerald-700 leading-relaxed">No critical weak areas detected. Keep practicing!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Progress Insight */}
                {completionPct > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex gap-3">
                      <TrendingUp className="w-5 h-5 text-[#027FFF] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 mb-1">
                          {isIELTS ? 'Band Progress' : 'Level Progress'}
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          {completionPct.toFixed(0)}% of your course completed.
                          {dashData?.next_recommended_lesson && ` Next up: ${dashData.next_recommended_lesson.lesson_title}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unread notifications prompt */}
                {unreadCount > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                    <div className="flex gap-3">
                      <Bell className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">New Notifications</h4>
                        <p className="text-xs text-indigo-700 leading-relaxed">You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}.</p>
                        <button onClick={() => setNotifOpen(true)} className="text-xs font-bold text-indigo-600 hover:underline mt-1">View →</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
