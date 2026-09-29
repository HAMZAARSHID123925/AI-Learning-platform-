"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Users, BookOpen, Video, Award, 
  Settings, LogOut, ArrowLeft, Menu, X,
  GraduationCap, ExternalLink
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: 'overview' | 'teachers' | 'students' | 'courses' | 'users' | 'live' | 'certificates' | 'settings') => void;
}

export default function AdminSidebar({ activeTab = 'overview', onSelectTab }: AdminSidebarProps) {
  const router = useRouter();

  const [adminName, setAdminName] = useState<string>('Administrator');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('user_name') || 'Admin';
      setAdminName(name);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('courseTrack');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  const navItems: Array<{
    id: 'overview' | 'teachers' | 'students' | 'courses';
    label: string;
    icon: any;
    badge?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  const navContent = (
    <div className="flex flex-col justify-between h-full bg-[#18191E] text-slate-200 border-r border-[#272832]">
      <div>
        {/* Brand Header */}
        <div className="min-h-20 px-6 py-5 flex items-center justify-between border-b border-[#272832] sticky top-0 bg-[#18191E]/95 backdrop-blur-md z-10">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <div className="h-11 w-11 rounded-2xl bg-[#22242C] p-1 flex items-center justify-center border border-[#323542] shadow-xs group-hover:scale-105 transition-all">
              <img 
                src="/logo.png" 
                alt="Pen & Page Academia" 
                className="h-7 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-white tracking-tight leading-tight">PPAcademia</span>
              <span className="text-[10px] text-purple-400 font-bold tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 rounded-xl bg-[#22242C] border border-[#323542] text-slate-400 hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 pt-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2.5">
            Platform Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer text-left whitespace-nowrap ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-300 hover:text-white hover:bg-[#22242C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Hub Navigation */}
          <div className="pt-5 mt-5 border-t border-[#272832] space-y-1.5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2.5">
              Platform Switcher
            </div>
            <Link 
              href="/instructor"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white hover:bg-[#22242C] transition-all group border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Teacher Studio</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white hover:bg-[#22242C] transition-all group border border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
                <span>Student Campus</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Admin Profile & Sign Out Footer */}
      <div className="p-4 border-t border-[#272832] bg-[#14151A] space-y-2.5">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1C1E26] border border-[#2D303E]">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            {adminName ? adminName[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <span className="text-[10px] font-medium text-slate-400 block truncate">System Administrator</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active" />
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-xl bg-[#1C1E26] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 font-bold transition-all text-xs cursor-pointer border border-[#2D303E] hover:border-rose-800/50"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERSISTENT FIXED SIDEBAR */}
      <aside className="w-64 flex-shrink-0 bg-[#18191E] hidden md:flex flex-col justify-between h-screen sticky top-0 overflow-y-auto border-r border-[#272832] z-30 shadow-sm">
        {navContent}
      </aside>

      {/* MOBILE FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-white text-ink shadow-md border border-line flex items-center justify-center hover:bg-canvas active:scale-95 transition-all"
        aria-label="Open Admin Menu"
      >
        <Menu className="w-5 h-5 text-ink" />
      </button>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-line">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
