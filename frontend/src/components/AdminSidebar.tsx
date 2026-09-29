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
  onSelectTab?: (tab: 'overview' | 'users' | 'courses' | 'live' | 'certificates' | 'settings') => void;
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
    id: 'overview' | 'users' | 'courses' | 'live' | 'certificates' | 'settings';
    label: string;
    icon: any;
    badge?: string;
  }> = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'live', label: 'Live Monitoring', icon: Video, badge: 'Live' },
    { id: 'certificates', label: 'Certificates Hub', icon: Award },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const navContent = (
    <div className="flex flex-col justify-between h-full bg-[#181A20] text-zinc-300">
      <div>
        {/* Brand Header */}
        <div className="min-h-24 px-6 py-5 flex items-center justify-between border-b border-zinc-800/80 sticky top-0 bg-[#181A20]/95 backdrop-blur-md z-10">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <div className="h-11 w-11 rounded-2xl bg-white p-1.5 flex items-center justify-center border border-zinc-700/60 shadow-md group-hover:scale-105 transition-all">
              <img 
                src="/logo.png" 
                alt="Pen & Page Academia" 
                className="h-7 w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-white tracking-tight leading-tight">PPAcademia</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation list */}
        <nav className="p-4 space-y-1 pt-6">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 mb-2.5">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#027FFF] text-white shadow-md shadow-[#027FFF]/25 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Hub Navigation */}
          <div className="pt-5 mt-5 border-t border-zinc-800/80 space-y-1">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 mb-2.5">
              Platform Switcher
            </div>
            <Link 
              href="/instructor"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Teacher Studio</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Student Campus</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Admin Profile & Sign Out Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 space-y-2.5">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-800/70 border border-zinc-700/60 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#027FFF] text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            {adminName ? adminName[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <span className="text-[10px] font-medium text-zinc-400 block truncate">System Administrator</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active" />
        </div>

        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-400 font-semibold transition-all text-xs cursor-pointer border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP PERSISTENT SIDEBAR - Dark Gray (#181A20) */}
      <aside className="w-64 flex-shrink-0 bg-[#181A20] text-zinc-300 hidden md:flex flex-col justify-between h-screen overflow-y-auto border-r border-zinc-800 z-20 shadow-xl">
        {navContent}
      </aside>

      {/* MOBILE FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#181A20] text-white shadow-xl border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all"
        aria-label="Open Admin Menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-[85vw] bg-[#181A20] text-zinc-300 h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-zinc-800">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
