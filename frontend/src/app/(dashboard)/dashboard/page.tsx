
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Headphones, PenTool, Mic, 
  LineChart as LineChartIcon, Settings, LogOut, Bell, User,
  BrainCircuit, TrendingUp, Target, Flame, AlertCircle, ChevronRight
} from 'lucide-react';

const mockPerformanceData = [
  { name: 'Week 1', score: 5.5 },
  { name: 'Week 2', score: 6.0 },
  { name: 'Week 3', score: 6.0 },
  { name: 'Week 4', score: 6.5 },
  { name: 'Week 5', score: 7.0 },
  { name: 'Week 6', score: 7.5 },
];

const mockRadarData = [
  { subject: 'Lexical Resource', A: 85, fullMark: 100 },
  { subject: 'Grammar', A: 70, fullMark: 100 },
  { subject: 'Coherence', A: 80, fullMark: 100 },
  { subject: 'Pronunciation', A: 65, fullMark: 100 },
  { subject: 'Fluency', A: 75, fullMark: 100 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setTimeout(() => setIsAuth(true), 0);
    }
  }, [router]);

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1221]">
        <div className="w-8 h-8 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1221] text-slate-300 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0f182c] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
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
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <BookOpen className="w-5 h-5" />
              Reading
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <Headphones className="w-5 h-5" />
              Listening
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <PenTool className="w-5 h-5" />
              Writing
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <Mic className="w-5 h-5" />
              Speaking
            </Link>
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-4">Account</div>
            
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <LineChartIcon className="w-5 h-5" />
              Analytics
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { localStorage.removeItem('access_token'); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f182c]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Engine Online
            </span>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#0f182c]"></span>
            </button>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white group-hover:text-[#5BC0EB] transition-colors">Candidate</p>
                <p className="text-xs text-slate-500">IELTS Academic</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#027FFF] to-[#5BC0EB] p-0.5">
                <div className="w-full h-full rounded-full bg-[#0B1221] flex items-center justify-center border-2 border-[#0B1221]">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          
          {/* METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Metric 1 */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#027FFF]/10 rounded-full blur-2xl group-hover:bg-[#027FFF]/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#027FFF]/20 text-[#5BC0EB]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Current Est. Band</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">7.5</span>
                <span className="text-sm text-emerald-400 font-medium mb-1">+0.5 from last week</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Target Band</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">8.0</span>
                <span className="text-sm text-slate-500 font-medium mb-1">Academic</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Probability of Success</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-extrabold text-white">87%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 w-[87%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Calibration Streak</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-white">12</span>
                <span className="text-sm text-slate-500 font-medium mb-1">Days active</span>
              </div>
            </div>

          </div>

          {/* MIDDLE ROW (CHARTS & RADAR) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-[#0f182c] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white">Proficiency Trajectory</h2>
                  <p className="text-sm text-slate-500">Your AI-graded mock test results over time.</p>
                </div>
                <select className="bg-[#0B1221] border border-white/10 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#027FFF]">
                  <option>Overall Band</option>
                  <option>Reading</option>
                  <option>Writing</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[4, 9]} stroke="#ffffff40" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0B1221', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#5BC0EB' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#027FFF" strokeWidth={4} dot={{ r: 4, fill: '#0B1221', stroke: '#5BC0EB', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#5BC0EB' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-white">AI Diagnostic Profile</h2>
                <p className="text-sm text-slate-500">Live capability breakdown.</p>
              </div>
              <div className="flex-1 min-h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                    <PolarGrid stroke="#ffffff15" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#5BC0EB" strokeWidth={2} fill="#027FFF" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>

          {/* BOTTOM ROW (MODULES & INSIGHTS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Modules */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-white mb-4">Adaptive Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-[#027FFF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mic className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 1</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Speaking Simulator</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">Real-time voice evaluation with the Examiner AI agent.</p>
                  <div className="flex items-center text-sm font-semibold text-[#5BC0EB] group-hover:text-white transition-colors">
                    Start Drill <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <div className="group bg-[#0f182c] hover:bg-[#15203b] border border-white/5 hover:border-[#027FFF]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded">Module 2</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Writing Evaluator</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">Submit Task 1 & 2 for instant rubric-based grading.</p>
                  <div className="flex items-center text-sm font-semibold text-amber-400 group-hover:text-white transition-colors">
                    Start Drill <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </div>

            {/* AI Insights Feed */}
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#5BC0EB]" />
                  AI Insights
                </h2>
                <span className="text-xs font-medium text-slate-500">Live</span>
              </div>
              
              <div className="space-y-4 flex-1">
                
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-100 mb-1">Grammar Warning</h4>
                      <p className="text-xs text-red-200/70 leading-relaxed mb-2">You consistently misuse the Past Perfect continuous tense during Part 2 Speaking.</p>
                      <button className="text-xs font-bold text-red-400 hover:text-red-300">Fix now &rarr;</button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-100 mb-1">Lexical Resource Improved</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Your use of advanced idioms increased by 14% in your last essay. Keep it up!</p>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
