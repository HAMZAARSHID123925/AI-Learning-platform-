"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Users, BookOpen, Video, Award, 
  Settings, LogOut, ArrowLeft, Menu, X, ShieldAlert
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
  }> = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'live', label: 'Live Sessions Monitor', icon: Video },
    { id: 'certificates', label: 'Certificates Center', icon: Award },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

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
              <span className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">Admin Portal</span>
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
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Administration
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px] text-white/90" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Quick Portals
            </div>
            <Link 
              href="/instructor"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Teacher Studio
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              Student Dashboard
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Admin Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
            {adminName ? adminName[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminName}</p>
            <span className="text-[10px] font-medium text-cyan-400 block">System Administrator</span>
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
      {/* DESKTOP PERSISTENT SIDEBAR: Dark Slate (#0F172A) */}
      <aside className="w-64 flex-shrink-0 bg-[#0F172A] text-slate-300 hidden md:flex flex-col justify-between h-screen overflow-y-auto shadow-2xl z-20 border-r border-slate-800">
        {navContent}
      </aside>

      {/* MOBILE FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#0F172A] text-white shadow-xl border border-slate-700 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
        aria-label="Open Admin Menu"
      >
        <Menu className="w-5 h-5 text-[#5BC0EB]" />
      </button>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <div className="relative w-72 max-w-[85vw] bg-[#0F172A] text-slate-300 h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
