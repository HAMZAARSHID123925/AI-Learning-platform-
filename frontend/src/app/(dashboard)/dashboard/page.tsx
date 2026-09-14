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
        // API may return { items, total, unread_count } or just an array
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
      <div className="min-h-screen flex items-center justify-center bg-[#0B1221]">
        <div className="w-8 h-8 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ─── ONBOARDING MODAL ────────────────────────────────────────────────────────
  if (!courseTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1221] p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#027FFF] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[#5BC0EB] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="w-full max-w-4xl z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#027FFF] to-[#5BC0EB] p-0.5 shadow-lg shadow-[#027FFF]/30 mb-6">
              <div className="w-full h-full bg-[#0B1221] rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-[#5BC0EB]" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Welcome to PPAcademia AI</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">To personalize your adaptive learning engine, please select your primary focus. The AI will completely recalibrate your dashboard based on this choice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => handleSelectTrack('general')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-[#0f182c] border border-white/5 hover:border-[#5BC0EB]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(91,192,235,0.15)] hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#5BC0EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-full bg-[#5BC0EB]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe2 className="w-8 h-8 text-[#5BC0EB]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">General English</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Master everyday conversational and professional English. Track your progress across global CEFR levels (A1 to C2).</p>
              <div className="mt-auto px-6 py-2.5 rounded-full bg-white/5 text-slate-300 font-medium text-sm group-hover:bg-[#5BC0EB] group-hover:text-[#0B1221] transition-colors duration-300">
                Select General English
              </div>
            </button>

            <button 
              onClick={() => handleSelectTrack('ielts')}
              className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-[#0f182c] border border-white/5 hover:border-[#027FFF]/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(2,127,255,0.15)] hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#027FFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-16 h-16 rounded-full bg-[#027FFF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-8 h-8 text-[#027FFF]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">IELTS Preparation</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">Intensive, multi-agent evaluation for Academic or General Training. Target a specific Band Score with examiner-calibrated precision.</p>
              <div className="mt-auto px-6 py-2.5 rounded-full bg-white/5 text-slate-300 font-medium text-sm group-hover:bg-[#027FFF] group-hover:text-white transition-colors duration-300">
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

  // Radar chart — use real skill mastery if available, fallback to defaults
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

  // Proficiency trajectory — use enrolled courses progress as weeks
  const progressHistory = dashData?.enrolled_courses?.length
    ? dashData.enrolled_courses.map((c, i) => ({
        name: c.course_title.slice(0, 8),
        score: isIELTS
          ? +(4 + c.percentage / 20).toFixed(1)
          : Math.round(c.percentage),
      }))
    : (isIELTS
        ? [{ name: 'Wk 1', score: 5.5 }, { name: 'Wk 2', score: 6.0 }, { name: 'Wk 3', score: 6.5 }, { name: 'Wk 4', score: 7.0 }]
        : [{ name: 'Wk 1', score: 30 }, { name: 'Wk 2', score: 50 }, { name: 'Wk 3', score: 65 }, { name: 'Wk 4', score: 75 }]);

  // Metrics
  const completionPct = dashData?.overall_completion_percentage ?? 0;
  // Estimate band from completion: 4.5 + (pct/100 * 4.5) capped at 9
  const estBand = dashData ? Math.min(9, +(4.5 + (completionPct / 100) * 4.5).toFixed(1)) : null;
  const cefrLevel = completionPct < 20 ? 'A2' : completionPct < 40 ? 'B1' : completionPct < 65 ? 'B2' : completionPct < 85 ? 'C1' : 'C2';
  const streakDays = dashData?.active_remediations?.length ?? 0;
  const successProbability = dashData ? Math.min(99, Math.round(50 + completionPct / 2)) : null;

  // AI Insights — from real weakness flags
  const insightCards = weaknessFlags.slice(0, 3).map(f => ({
    type: 'warning' as const,
    title: 'Weakness Detected',
    body: `Score ${(f.score_at_flag * 100).toFixed(0)}% — below threshold of ${(f.threshold * 100).toFixed(0)}%. Status: ${f.status}.`,
  }));

  // Enrolled courses for quick modules row
  const enrolledCourses = dashData?.enrolled_courses ?? [];

  // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1221] text-slate-300 font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0f182c] flex flex-col justify-between hidden md:flex h-screen overflow-y-auto">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5 sticky top-0 bg-[#0f182c] z-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#027FFF] to-[#5BC0EB] p-0.5">
                <div className="w-full h-full bg-[#0B1221] rounded-[6px] flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-[#5BC0EB]" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PPAcademia</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-4">Menu</div>
            
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#027FFF]/10 text-[#5BC0EB] font-medium border border-[#027FFF]/20">
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>
            
            <Link href="/dashboard/adaptive" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-amber-400 font-medium transition-colors group">
              <BrainCircuit className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              Adaptive Engine
            </Link>

            {isIELTS ? (
              <>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><BookOpen className="w-5 h-5" />Reading</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><Headphones className="w-5 h-5" />Listening</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><PenTool className="w-5 h-5" />Writing</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><Mic className="w-5 h-5" />Speaking</Link>
              </>
            ) : (
              <>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><BookOpen className="w-5 h-5" />Vocabulary</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><PenTool className="w-5 h-5" />Grammar</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><Mic className="w-5 h-5" />Conversation</Link>
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors"><Headphones className="w-5 h-5" />Comprehension</Link>
              </>
            )}
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-4">Platform</div>
            <Link href="/dashboard/simulator" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-emerald-400 font-medium transition-colors group">
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              AI Speaking Simulator
            </Link>
            <Link href="/dashboard/results" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-[#5BC0EB] font-medium transition-colors">
              <LineChartIcon className="w-5 h-5" />
              Past Results
            </Link>
            <Link href="/dashboard/live" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-purple-400 font-medium transition-colors">
              <Video className="w-5 h-5" />
              Live Classes
            </Link>
            <Link href="/dashboard/lesson" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-rose-400 font-medium transition-colors">
              <BookOpen className="w-5 h-5" />
              Lesson Player
            </Link>
            <Link href="/instructor" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-indigo-400 font-medium transition-colors">
              <Users className="w-5 h-5" />
              Instructor Hub
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-amber-400 font-medium transition-colors">
              <Settings className="w-5 h-5" />
              Admin Studio
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('courseTrack'); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f182c]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isIELTS ? 'IELTS Engine Online' : 'General English Engine Online'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { localStorage.removeItem('courseTrack'); setCourseTrack(null); }}
              className="text-xs font-semibold text-slate-400 hover:text-[#5BC0EB] underline"
            >
              Switch Track
            </button>

            {/* 🔔 NOTIFICATION BELL */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0f182c] flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-96 bg-[#0f182c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#5BC0EB]" />
                      <span className="font-bold text-white text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">{unreadCount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#5BC0EB] hover:text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)}>
                        <X className="w-4 h-4 text-slate-500 hover:text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 text-sm">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && markNotificationRead(n.id)}
                          className={`px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-[#027FFF]/5' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {!n.read && <span className="w-2 h-2 rounded-full bg-[#027FFF] flex-shrink-0 mt-0.5"></span>}
                                <p className="text-sm font-semibold text-white truncate">{n.title}</p>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.body}</p>
                            </div>
                            <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0 mt-0.5">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-5 py-3 border-t border-white/5">
                    <button onClick={() => { setNotifOpen(false); loadAllData(); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">{dashData?.student_name || userName}</p>
                <p className="text-xs text-slate-500">{isIELTS ? 'IELTS Academic' : `CEFR ${cefrLevel} Level`}</p>
              </div>
              <button 
                onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('courseTrack'); router.push('/login'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
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
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#027FFF]/10 rounded-full blur-2xl group-hover:bg-[#027FFF]/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#027FFF]/20 text-[#5BC0EB]"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="text-sm font-semibold text-slate-400">{isIELTS ? 'Estimated Band' : 'Current CEFR Level'}</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">
                  {isIELTS ? (estBand ?? '–') : cefrLevel}
                </span>
                <span className="text-sm text-emerald-400 font-medium mb-1">
                  {completionPct > 0 ? `${completionPct.toFixed(0)}% complete` : 'Getting started'}
                </span>
              </div>
            </div>

            {/* Metric 2: Target */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><Target className="w-5 h-5" /></div>
                <h3 className="text-sm font-semibold text-slate-400">{isIELTS ? 'Target Band' : 'Target Level'}</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">{isIELTS ? '8.0' : 'C1'}</span>
                <span className="text-sm text-slate-500 font-medium mb-1">{isIELTS ? 'Academic' : 'Advanced'}</span>
              </div>
            </div>

            {/* Metric 3: Probability */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><BrainCircuit className="w-5 h-5" /></div>
                <h3 className="text-sm font-semibold text-slate-400">Probability of Success</h3>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-3xl font-extrabold text-white">{successProbability ?? '–'}%</span>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                    style={{ width: `${successProbability ?? 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Metric 4: Active Remediations */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400"><Flame className="w-5 h-5" /></div>
                <h3 className="text-sm font-semibold text-slate-400">Active Remediations</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">{dashData?.active_remediations?.length ?? '–'}</span>
                <span className="text-sm text-slate-500 font-medium mb-1">
                  {dashData?.active_remediations?.length === 1 ? 'Skill to fix' : 'Skills to fix'}
                </span>
              </div>
            </div>

          </div>

          {/* ── CHARTS ROW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-[#0f182c] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white">Proficiency Trajectory</h2>
                  <p className="text-sm text-slate-500">Your progress across enrolled courses.</p>
                </div>
                <select className="bg-[#0B1221] border border-white/10 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#027FFF]">
                  <option>{isIELTS ? 'Overall Band' : 'Overall Score'}</option>
                  <option>{isIELTS ? 'Reading' : 'Grammar'}</option>
                  <option>{isIELTS ? 'Writing' : 'Vocabulary'}</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={isIELTS ? [4, 9] : [0, 100]} stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0B1221', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#5BC0EB' }} />
                    <Line type="monotone" dataKey="score" stroke="#027FFF" strokeWidth={4} dot={{ r: 4, fill: '#0B1221', stroke: '#5BC0EB', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#5BC0EB' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-white">AI Diagnostic Profile</h2>
                <p className="text-sm text-slate-500">Live skill capability breakdown.</p>
              </div>
              <div className="flex-1 min-h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#ffffff15" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#5BC0EB" strokeWidth={2} fill="#027FFF" fillOpacity={0.3} />
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
                  <h2 className="text-lg font-bold text-white mb-4">My Enrolled Courses</h2>
                  <div className="space-y-3">
                    {enrolledCourses.map(c => (
                      <div key={c.course_id} className="bg-[#0f182c] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{c.course_title}</span>
                          <span className="text-xs text-slate-400">{c.completed_lessons}/{c.total_lessons} lessons</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#027FFF] to-[#5BC0EB] rounded-full transition-all duration-700"
                            style={{ width: `${c.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-500">{c.percentage.toFixed(0)}% complete</span>
                          <Link href="/dashboard/lesson" className="text-xs text-[#5BC0EB] hover:underline">Continue →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Modules */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Adaptive Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-[#027FFF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 1</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {isIELTS ? 'Speaking Simulator' : 'Conversation Drill'}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {isIELTS ? 'Real-time voice evaluation with the Examiner AI agent.' : 'Practice real-life dialogues with responsive AI avatars.'}
                    </p>
                    <Link href="/dashboard/simulator" className="flex items-center text-sm font-semibold text-[#5BC0EB] group-hover:text-white transition-colors">
                      Start Drill <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-[#027FFF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 2</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Adaptive Engine</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      AI detects your weak areas and creates a personalized remediation plan.
                    </p>
                    <Link href="/dashboard/adaptive" className="flex items-center text-sm font-semibold text-amber-400 group-hover:text-white transition-colors">
                      View Plan <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 3</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Live Classes</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      Join live instructor-led sessions and interact in real time.
                    </p>
                    <Link href="/dashboard/live" className="flex items-center text-sm font-semibold text-purple-400 group-hover:text-white transition-colors">
                      Join Session <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-rose-500/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 4</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Lesson Player</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {dashData?.next_recommended_lesson
                        ? `Next: ${dashData.next_recommended_lesson.lesson_title}`
                        : 'Continue your course content at your own pace.'}
                    </p>
                    <Link href="/dashboard/lesson" className="flex items-center text-sm font-semibold text-rose-400 group-hover:text-white transition-colors">
                      Continue <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>

            {/* AI Insights Feed — Real Data */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#5BC0EB]" />
                  AI Insights
                </h2>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              
              <div className="space-y-4 flex-1">

                {/* Active Remediations */}
                {dashData?.active_remediations?.length ? (
                  dashData.active_remediations.slice(0, 2).map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-100 mb-1">Weak Area: {r.skill_name}</h4>
                          <p className="text-xs text-red-200/70 leading-relaxed mb-2">{r.title}</p>
                          {r.instructor_escalated && (
                            <span className="text-xs font-bold text-orange-400">⚠ Escalated to instructor</span>
                          )}
                          <Link href="/dashboard/adaptive" className="block text-xs font-bold text-red-400 hover:text-red-300 mt-1">Fix now →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : insightCards.length ? (
                  insightCards.map((ins, i) => (
                    <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-100 mb-1">{ins.title}</h4>
                          <p className="text-xs text-red-200/70 leading-relaxed mb-2">{ins.body}</p>
                          <Link href="/dashboard/adaptive" className="text-xs font-bold text-red-400 hover:text-red-300">Fix now →</Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-100 mb-1">All Skills Healthy</h4>
                        <p className="text-xs text-emerald-200/70 leading-relaxed">No weak areas detected. Keep practicing!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Progress Insight */}
                {completionPct > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-100 mb-1">
                          {isIELTS ? 'Band Progress' : 'Level Progress'}
                        </h4>
                        <p className="text-xs text-emerald-200/70 leading-relaxed">
                          {completionPct.toFixed(0)}% of your course completed.
                          {dashData?.next_recommended_lesson && ` Next up: ${dashData.next_recommended_lesson.lesson_title}.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unread notifications prompt */}
                {unreadCount > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex gap-3">
                      <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-100 mb-1">New Notifications</h4>
                        <p className="text-xs text-blue-200/70 leading-relaxed">You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}.</p>
                        <button onClick={() => setNotifOpen(true)} className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-1">View →</button>
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
