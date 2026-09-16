"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, BrainCircuit, BookOpen, Headphones, PenTool, Mic, 
  Video, LineChart as LineChartIcon, Users, Settings, LogOut, Sparkles, Award,
  ShieldCheck, User
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role') || 'student';
      const name = localStorage.getItem('user_name') || 'Student';
      setUserRole(role.toLowerCase());
      setUserName(name);
    }
  }, []);

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

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col justify-between hidden md:flex h-screen overflow-y-auto shadow-2xl z-20 border-r border-slate-800">
      <div>
        {/* Logo Header */}
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
            href="/courses" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/courses') 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isActive('/courses') ? 'text-white' : 'text-cyan-400'}`} />
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
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isActive('/dashboard/vocabulary') ? 'text-white' : 'text-amber-400'}`} />
            Vocabulary Bank
          </Link>

          {isIELTS ? (
            <>
              <Link 
                href="/dashboard/mock-exam" 
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm transition-all ${
                  isActive('/dashboard/mock-exam') 
                    ? 'bg-[#027FFF] text-white font-bold shadow-lg shadow-[#027FFF]/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isActive('/dashboard/mock-exam') ? 'text-white' : 'text-slate-500'}`} />
                Mock Exam Studio
              </Link>
              <Link 
                href="/dashboard/writing" 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive('/dashboard/writing') 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <PenTool className={`w-4 h-4 ${isActive('/dashboard/writing') ? 'text-white' : 'text-purple-400'}`} />
                Writing Studio
              </Link>
              <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Mic className="w-4 h-4 text-slate-500" />Speaking Studio</Link>
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
            href="/diagnostic" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/diagnostic') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BrainCircuit className={`w-4 h-4 ${isActive('/diagnostic') ? 'text-white' : 'text-blue-400'}`} />
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
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className={`w-4 h-4 ${isActive('/dashboard/analytics') ? 'text-white' : 'text-purple-400'}`} />
            Certificates &amp; Analytics
          </Link>
          <Link 
            href="/dashboard/results" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/results') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LineChartIcon className={`w-4 h-4 ${isActive('/dashboard/results') ? 'text-white' : 'text-blue-400'}`} />
            Past Results
          </Link>
          <Link 
            href="/dashboard/community" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/community') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className={`w-4 h-4 ${isActive('/dashboard/community') ? 'text-white' : 'text-blue-400'}`} />
            Community Hub
          </Link>
          <Link 
            href="/dashboard/live" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/live') 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video className={`w-4 h-4 ${isActive('/dashboard/live') ? 'text-white' : 'text-purple-400'}`} />
            Live Classes
          </Link>
          <Link 
            href="/dashboard/lesson" 
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive('/dashboard/lesson') 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${isActive('/dashboard/lesson') ? 'text-white' : 'text-rose-400'}`} />
            Lesson Player
          </Link>

          {/* RBAC MANAGEMENT HUBS (ONLY VISIBLE TO INSTRUCTOR / ADMIN) */}
          {(isInstructor || isAdmin) && (
            <>
              <div className="text-[10px] font-extrabold text-amber-500/80 uppercase tracking-widest mb-3 mt-6 px-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Staff Management
              </div>
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
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-[#027FFF] text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {userName ? userName[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <span className="text-[10px] font-semibold text-slate-400 capitalize block">
              {isAdmin ? '🛡️ Administrator' : isInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

