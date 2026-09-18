"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Video, LogOut, Sparkles, Award,
  ShieldCheck, Users, Settings, LineChart as LineChartIcon, Menu, X,
  ClipboardList, TrendingUp
} from 'lucide-react';

interface DashboardSidebarProps {
  courseTrack?: string | null;
}

export default function DashboardSidebar({ courseTrack }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = useState<string>('student');
  const [userName, setUserName] = useState<string>('Student');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role') || 'student';
      let name = localStorage.getItem('user_name') || 'Student';
      if (name.toLowerCase() === 'admin' || name.toLowerCase() === 'administrator') {
        name = 'Student';
      }
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
    <div className="flex flex-col justify-between h-full bg-[#0F172A] text-slate-300">
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
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Learning Portal</span>
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
        <nav className="p-4 space-y-1.5 pt-6">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard') && pathname === '/dashboard'
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-[18px] h-[18px] text-white/90" />
            Overview
          </Link>

          <Link 
            href="/dashboard/courses" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/courses') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-[18px] h-[18px] text-white/90" />
            Course Catalog
          </Link>
          
          <Link 
            href="/dashboard/live" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/live') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video className="w-[18px] h-[18px] text-white/90" />
            Live Classes
          </Link>

          <Link 
            href="/dashboard/ai-exam" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/ai-exam') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-[18px] h-[18px] text-white/90" />
            AI Exam Generator
          </Link>

          <Link 
            href="/dashboard/assignments" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/assignments') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ClipboardList className="w-[18px] h-[18px] text-white/90" />
            Assignments
          </Link>

          <Link 
            href="/dashboard/analytics" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/analytics') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-[18px] h-[18px] text-white/90" />
            My Progress
          </Link>

          <Link 
            href="/dashboard/certificates" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/certificates') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="w-[18px] h-[18px] text-white/90" />
            Certificates
          </Link>

          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/settings') 
                ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-[18px] h-[18px] text-white/90" />
            Settings
          </Link>
        </nav>
      </div>
      
      {/* User Profile & Sign Out at Sidebar Bottom */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-[#027FFF] text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
            {userName ? userName[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <span className="text-[10px] font-medium text-slate-400 block">Student Account</span>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERSISTENT SIDEBAR: Dark Slate/Black-Gray (#0F172A) */}
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
