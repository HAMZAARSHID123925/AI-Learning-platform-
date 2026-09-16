"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, BrainCircuit, BookOpen, Headphones, PenTool, Mic, 
  Video, LineChart as LineChartIcon, Users, Settings, LogOut, Sparkles, Award,
  ShieldCheck, User, Menu, X
} from 'lucide-react';

interface DashboardSidebarProps {
  courseTrack?: string | null;
}

export default function DashboardSidebar({ courseTrack = 'ielts' }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isIELTS = courseTrack !== 'general';

  const [userRole, setUserRole] = useState<string>('student');
  const [userName, setUserName] = useState<string>('Student');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role') || 'student';
      const name = localStorage.getItem('user_name') || 'Student';
      setUserRole(role.toLowerCase());
      setUserName(name);
    }
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isInstructor = userRole === 'instructor' || userRole === 'admin' || userRole === 'superadmin' || userRole === 'teacher';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('courseTrack');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 sticky top-0 bg-[#0F172A] z-10">
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

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-3 px-3">Student Curriculum</div>
          
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard') && pathname === '/dashboard'
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>

          <Link 
            href="/dashboard/courses" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/courses') 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isActive('/dashboard/courses') ? 'text-white' : 'text-cyan-400'}`} />
            Course Catalog
          </Link>
          
          <Link 
            href="/dashboard/adaptive" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/adaptive') 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BrainCircuit className={`w-4 h-4 ${isActive('/dashboard/adaptive') ? 'text-white' : 'text-amber-400'}`} />
            Adaptive Engine
          </Link>

          <Link 
            href="/dashboard/vocabulary" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/vocabulary') 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isActive('/dashboard/vocabulary') ? 'text-white' : 'text-purple-400'}`} />
            Vocabulary (SM-2)
          </Link>

          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-3">Skill Studios</div>
          
          {isIELTS ? (
            <>
              <Link 
                href="/dashboard/mock-exam" 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive('/dashboard/mock-exam') 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isActive('/dashboard/mock-exam') ? 'text-white' : 'text-blue-400'}`} />
                Mock Exam
              </Link>

              <Link 
                href="/dashboard/lesson" 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive('/dashboard/lesson') 
                    ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Video className={`w-4 h-4 ${isActive('/dashboard/lesson') ? 'text-white' : 'text-cyan-400'}`} />
                Lesson Player
              </Link>

              <Link 
                href="/dashboard/writing" 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive('/dashboard/writing') 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PenTool className={`w-4 h-4 ${isActive('/dashboard/writing') ? 'text-white' : 'text-purple-400'}`} />
                Writing Studio
              </Link>

              <Link 
                href="/dashboard/simulator" 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive('/dashboard/simulator') 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Mic className={`w-4 h-4 ${isActive('/dashboard/simulator') ? 'text-white' : 'text-emerald-400'}`} />
                Speaking Studio
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/mock-exam" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><BookOpen className="w-4 h-4 text-slate-500" />Exam Studio</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><PenTool className="w-4 h-4 text-slate-500" />Grammar</Link>
              <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Mic className="w-4 h-4 text-slate-500" />Conversation</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Headphones className="w-4 h-4 text-slate-500" />Comprehension</Link>
            </>
          )}
          
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-3">Live Hubs &amp; Diagnostics</div>
          <Link 
            href="/dashboard/diagnostic" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/diagnostic') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BrainCircuit className={`w-4 h-4 ${isActive('/dashboard/diagnostic') ? 'text-white' : 'text-blue-400'}`} />
            Diagnostic Check
          </Link>
          <Link 
            href="/dashboard/simulator" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/simulator') 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mic className={`w-4 h-4 ${isActive('/dashboard/simulator') ? 'text-white' : 'text-emerald-400'}`} />
            AI Simulator
          </Link>
          <Link 
            href="/dashboard/analytics" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/analytics') 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LineChartIcon className={`w-4 h-4 ${isActive('/dashboard/analytics') ? 'text-white' : 'text-indigo-400'}`} />
            Performance
          </Link>
          <Link 
            href="/dashboard/live" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/live') 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video className={`w-4 h-4 ${isActive('/dashboard/live') ? 'text-white' : 'text-rose-400'}`} />
            Live Classes
          </Link>
          <Link 
            href="/dashboard/community" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/community') 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className={`w-4 h-4 ${isActive('/dashboard/community') ? 'text-white' : 'text-teal-400'}`} />
            Community Hub
          </Link>

          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/settings') 
                ? 'bg-slate-700 text-white shadow-lg' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className={`w-4 h-4 ${isActive('/dashboard/settings') ? 'text-white' : 'text-slate-400'}`} />
            Target &amp; Settings
          </Link>

          {/* 🔒 STRICT RBAC ISOLATION */}
          {(isInstructor || isAdmin) && (
            <>
              <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 mt-6 px-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Staff Management
              </div>
              
              {/* Visible to Teachers & Admins */}
              {isInstructor && (
                <Link 
                  href="/instructor" 
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isActive('/instructor')
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-indigo-400'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  Instructor Hub
                </Link>
              )}
              {/* ONLY Admin or SuperAdmin can see Admin Studio (Teachers & Students cannot see this) */}
              {isAdmin && (
                <Link 
                  href="/admin/courses" 
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isActive('/admin/courses')
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-amber-400'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  Admin Studio
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
      
      {/* User Profile & Sign Out at Sidebar Bottom */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#027FFF] text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {userName ? userName[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{userName}</p>
            <span className="text-[10px] font-semibold text-slate-400 capitalize block">
              {isAdmin ? '🛡️ Administrator' : isInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
            </span>
          </div>
        </Link>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERSISTENT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 bg-[#0F172A] text-slate-300 hidden md:flex flex-col justify-between h-screen overflow-y-auto shadow-2xl z-20 border-r border-slate-800">
        {navContent}
      </aside>

      {/* MOBILE FLOATING MENU TRIGGER BUTTON */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#0F172A] text-white shadow-xl border border-slate-700 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-5 h-5 text-[#5BC0EB]" />
      </button>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-[#0F172A] text-slate-300 h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
