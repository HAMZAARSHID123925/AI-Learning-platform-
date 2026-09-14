"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, BrainCircuit, BookOpen, Headphones, PenTool, Mic, 
  Video, LineChart as LineChartIcon, Users, Settings, LogOut 
} from 'lucide-react';

interface DashboardSidebarProps {
  courseTrack?: string | null;
}

export default function DashboardSidebar({ courseTrack = 'ielts' }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isIELTS = courseTrack !== 'general';

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
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-3 px-3">Main Menu</div>
          
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

          {isIELTS ? (
            <>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><BookOpen className="w-4 h-4 text-slate-500" />Reading</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Headphones className="w-4 h-4 text-slate-500" />Listening</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><PenTool className="w-4 h-4 text-slate-500" />Writing</Link>
              <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Mic className="w-4 h-4 text-slate-500" />Speaking</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><BookOpen className="w-4 h-4 text-slate-500" />Vocabulary</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><PenTool className="w-4 h-4 text-slate-500" />Grammar</Link>
              <Link href="/dashboard/simulator" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Mic className="w-4 h-4 text-slate-500" />Conversation</Link>
              <Link href="/dashboard/lesson" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm"><Headphones className="w-4 h-4 text-slate-500" />Comprehension</Link>
            </>
          )}
          
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 mt-6 px-3">Live Hubs</div>
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
          <Link 
            href="/instructor" 
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-indigo-400 font-medium transition-colors text-sm"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Instructor Hub
          </Link>
          <Link 
            href="/admin/courses" 
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-amber-400 font-medium transition-colors text-sm"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            Admin Studio
          </Link>
        </nav>
      </div>
      
      {/* Sign Out Button at Sidebar Bottom */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
