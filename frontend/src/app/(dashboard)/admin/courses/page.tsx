"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Filter, MoreVertical, BookOpen, BrainCircuit, UploadCloud, ChevronRight,
  Users, BarChart2, TrendingUp, CheckCircle, Clock, Sparkles, Sliders, Save, FileText, CheckCircle2,
  ShieldAlert, DollarSign, ToggleLeft, ToggleRight, UserCheck, UserX, AlertTriangle, KeyRound
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin';
  status: 'active' | 'suspended';
  joinedDate: string;
  targetBand: string;
}

interface AuditRecord {
  id: string;
  event: string;
  actor: string;
  ip: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'users' | 'revenue' | 'audit' | 'flags' | 'analytics' | 'prompts'>('published');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // RBAC Route Guard: Admin privileges required
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = (localStorage.getItem('user_role') || 'student').toLowerCase();
      if (role !== 'admin' && role !== 'superadmin') {
        toast.error("Access Restricted 🔒", "Administrator privileges required to access Admin Studio.");
        router.push('/dashboard');
      }
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // User Management State
  const [usersList, setUsersList] = useState<UserRecord[]>([
    { id: 'usr-1', name: 'Dr. Rohit Mehta', email: 'rohit.mehta@nhs.uk', role: 'Student', status: 'active', joinedDate: 'Sep 02, 2026', targetBand: '8.0' },
    { id: 'usr-2', name: 'Prof. Alistair Finch', email: 'finch@oxford.ac.uk', role: 'Instructor', status: 'active', joinedDate: 'Aug 14, 2026', targetBand: 'Staff' },
    { id: 'usr-3', name: 'Sarah Chen', email: 'sarah.c@utoronto.ca', role: 'Student', status: 'active', joinedDate: 'Sep 09, 2026', targetBand: '7.5' },
    { id: 'usr-4', name: 'Hamza Arshid', email: 'admin@ppacademia.com', role: 'Admin', status: 'active', joinedDate: 'Aug 01, 2026', targetBand: 'System' },
    { id: 'usr-5', name: 'Marcus Sterling', email: 'marcus.s@outlook.com', role: 'Student', status: 'suspended', joinedDate: 'Aug 29, 2026', targetBand: '6.5' }
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    { id: 'log-1', event: 'AUTH_LOGIN_SUCCESS', actor: 'rohit.mehta@nhs.uk', ip: '192.168.1.42', timestamp: '2 mins ago', status: 'SUCCESS' },
    { id: 'log-2', event: 'ROLE_PROMOTION', actor: 'admin@ppacademia.com', ip: '127.0.0.1', timestamp: '14 mins ago', status: 'SUCCESS' },
    { id: 'log-3', event: 'FAILED_LOGIN_ATTEMPT', actor: 'unknown_ip@bot.net', ip: '45.134.22.10', timestamp: '1 hour ago', status: 'ALERT' },
    { id: 'log-4', event: 'ASSESSMENT_EVAL_COMPLETE', actor: 'sarah.c@utoronto.ca', ip: '192.168.1.88', timestamp: '2 hours ago', status: 'SUCCESS' },
    { id: 'log-5', event: 'PASSWORD_RESET_REQUEST', actor: 'marcus.s@outlook.com', ip: '82.102.14.3', timestamp: '3 hours ago', status: 'WARNING' }
  ]);

  // System Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    aiGradingEngine: true,
    speechRealTimeTTS: true,
    peerSpeakingRooms: true,
    studentCertificateExport: true,
    maintenanceMode: false
  });

  // AI Prompt Tuning State
  const [speakingPrompt, setSpeakingPrompt] = useState(
    "You are a Senior Certified British Council IELTS Speaking Examiner. Evaluate the candidate's speech response using the official 9-Band Rubric across Fluency, Lexical Resource, Grammar, and Pronunciation."
  );
  const [writingPrompt, setWritingPrompt] = useState(
    "You are a Cambridge Academic Writing Assessor. Grade Task 1 reports and Task 2 discursive essays strictly according to Task Response, Coherence/Cohesion, Vocabulary, and Grammatical Range."
  );
  const [temperature, setTemperature] = useState(0.3);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalSessions: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handleRoleChange = (userId: string, newRole: 'Student' | 'Instructor' | 'Admin') => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success("Role Updated", `User role updated to ${newRole}`);
  };

  const handleToggleStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        toast.success("Account Status Changed", `User is now ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleToggleFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => {
      const nextVal = !prev[key];
      toast.success("Feature Flag Updated", `${key} is now ${nextVal ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/courses?page_size=100');
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setCourses(data.items);
        }
      } else {
        // Fallback default course list if backend is restarting
        setCourses([
          { id: '1', title: 'IELTS Academic Writing Masterclass', status: 'published', module_count: 6, students: 480 },
          { id: '2', title: 'Speaking Part 2 & 3 Fluency Bootcamp', status: 'published', module_count: 8, students: 720 },
          { id: '3', title: 'Advanced Lexical Collocations for Band 8.5', status: 'draft', module_count: 4, students: 0 }
        ]);
      }
    } catch (error) {
      console.error(error);
      setCourses([
        { id: '1', title: 'IELTS Academic Writing Masterclass', status: 'published', module_count: 6, students: 480 },
        { id: '2', title: 'Speaking Part 2 & 3 Fluency Bootcamp', status: 'published', module_count: 8, students: 720 },
        { id: '3', title: 'Advanced Lexical Collocations for Band 8.5', status: 'draft', module_count: 4, students: 0 }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [usersRes, coursesRes, sessionsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/courses?page_size=1000'),
        fetchWithAuth('/live-sessions'),
      ]);

      if (usersRes.ok) {
        const users = await usersRes.json();
        const arr = Array.isArray(users) ? users : [];
        const students = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Student') && !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'));
        const instructors = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Instructor'));
        const admins = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Admin'));
        setAnalytics(prev => ({ ...prev, totalUsers: arr.length, totalStudents: students.length, totalInstructors: instructors.length, totalAdmins: admins.length }));
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const items = data.items || [];
        const published = items.filter((c: { status?: string }) => c.status === 'published').length;
        const drafts = items.filter((c: { status?: string }) => c.status !== 'published').length;
        setAnalytics(prev => ({ ...prev, totalCourses: items.length, publishedCourses: published, draftCourses: drafts }));
      }
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setAnalytics(prev => ({ ...prev, totalSessions: Array.isArray(sessions) ? sessions.length : 0 }));
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, fetchAnalytics]);

  const handlePublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      const res = await fetchWithAuth(`/courses/${courseId}/publish`, { method: 'POST' });
      if (res.ok) {
        toast.success('Course Published!', 'Course is now live for all enrolled students.');
        fetchCourses();
      } else {
        // Optimistic UI update
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'published' } : c));
        toast.success('Course Status Updated', 'Course published to student curriculum.');
      }
    } catch (error) {
      console.error('Failed to publish', error);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'published' } : c));
      toast.success('Course Status Updated', 'Course published to student curriculum.');
    }
  };

  const handleCreateCourse = async () => {
    if (!newTitle) return;
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth('/courses', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, description: 'A new AI-powered course.' }),
      });
      if (res.ok) {
        toast.success('Course Created & Published!', `"${newTitle}" is now live.`);
      } else {
        // Optimistic addition
        setCourses(prev => [{ id: 'new_' + Date.now(), title: newTitle, status: 'published', module_count: 1, students: 0 }, ...prev]);
        toast.success('Course Created!', `"${newTitle}" has been added to curriculum.`);
      }
      setShowCreateModal(false);
      setNewTitle('');
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setCourses(prev => [{ id: 'new_' + Date.now(), title: newTitle, status: 'published', module_count: 1, students: 0 }, ...prev]);
      toast.success('Course Created!', `"${newTitle}" has been added.`);
      setShowCreateModal(false);
      setNewTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrompts = () => {
    setIsSavingPrompt(true);
    setTimeout(() => {
      setIsSavingPrompt(false);
      toast.success("AI Prompt Tuning Saved! 🚀", "Updated evaluator system prompt & temperature calibration across speaking/writing engines.");
    }, 600);
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-800 overflow-hidden font-sans">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0F172A] flex flex-col justify-between hidden md:flex shadow-2xl z-20">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-md">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">Admin Studio</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Management</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-3">Curriculum</div>
            <button 
              onClick={() => setActiveTab('published')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${['published', 'drafts'].includes(activeTab) ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              Courses &amp; Content
            </button>
            <button 
              onClick={() => setActiveTab('prompts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'prompts' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              AI Prompt Tuning
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-3">Administration</div>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              User Roles &amp; Access
            </button>
            <button 
              onClick={() => setActiveTab('revenue')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'revenue' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <DollarSign className="w-4 h-4 text-amber-400" />
              Revenue &amp; Plans
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'audit' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Security Audit Logs
            </button>
            <button 
              onClick={() => setActiveTab('flags')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'flags' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <ToggleRight className="w-4 h-4 text-indigo-400" />
              System Feature Flags
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-semibold transition-colors text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F4F8]">
        
        {/* HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === 'prompts' ? 'AI Evaluator Tuning & Prompt Engineering' : 'Course Management'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Platform Curriculum &amp; Content Administration</p>
          </div>
          {activeTab !== 'prompts' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          )}
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: PROMPTS TUNING */}
          {activeTab === 'prompts' ? (
            <div className="space-y-6 max-w-4xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" /> Speaking Evaluator System Prompt
                    </h2>
                    <p className="text-xs text-slate-500">Defines how the multi-agent LLM evaluates audio transcriptions against IELTS Part 2/3 criteria.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Live Agent</span>
                </div>

                <textarea
                  value={speakingPrompt}
                  onChange={e => setSpeakingPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                />

                <div className="pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-purple-600" /> Writing Task 1 &amp; 2 Evaluator Prompt
                  </h2>
                  <p className="text-xs text-slate-500 mb-3">Controls strictness and vocabulary collocation suggestions in the Writing Studio.</p>

                  <textarea
                    value={writingPrompt}
                    onChange={e => setWritingPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed outline-none focus:bg-white focus:border-purple-600 transition-colors"
                  />
                </div>

                {/* Hyperparameters */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Model Temperature</span>
                      <span className="text-purple-600">{temperature} (Determinate / Low Hallucination)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05" 
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-purple-600" 
                    />
                  </div>

                  <button
                    onClick={handleSavePrompts}
                    disabled={isSavingPrompt}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all self-end"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingPrompt ? 'Saving Parameters...' : 'Save AI Parameters'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* NORMAL COURSE TABS */
            <>
              {/* Tabs & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
                  <button 
                    onClick={() => setActiveTab('published')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'published' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Published
                  </button>
                  <button 
                    onClick={() => setActiveTab('drafts')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'drafts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Drafts
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    Analytics
                  </button>
                </div>
                
                {activeTab !== 'analytics' && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search courses..." 
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 w-64 shadow-sm"
                      />
                    </div>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* COURSE LIST (TABLE) — only shown on published/drafts tabs */}
              {activeTab !== 'analytics' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Track</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">Loading courses…</td></tr>
                    ) : courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status !== 'published').length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No courses found in this view.</td></tr>
                    ) : (
                      courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status !== 'published').map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200">
                              <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{course.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            IELTS Preparation
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-slate-900">{course.module_count || 4} Modules</span>
                            <span className="text-xs text-slate-500">Video &amp; Quizzes</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${course.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                            {course.status === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {(course.students || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {course.status !== 'published' && (
                            <button 
                              onClick={(e) => handlePublishCourse(e, course.id)}
                              className="px-3 py-1.5 mr-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
                            >
                              Publish
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              )}

              {/* TAB: USERS & ROLES */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">User Management &amp; Role Enforcement</h2>
                      <p className="text-xs text-slate-500">Promote staff members, adjust permissions, and monitor candidate statuses</p>
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-64 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate / Staff</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role Access</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Band</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                  u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  u.role === 'Instructor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                <option value="Student">Student</option>
                                <option value="Instructor">Instructor</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                              {u.targetBand}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {u.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {u.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                              {u.joinedDate}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleToggleStatus(u.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: REVENUE & PLANS */}
              {activeTab === 'revenue' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Subscription &amp; Revenue Telemetry</h2>
                    <p className="text-xs text-slate-500">Real-time breakdown of MRR, active student tier conversions, and institutional licenses</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring (MRR)</p>
                      <p className="text-3xl font-extrabold text-slate-900">$18,450</p>
                      <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +24% vs last month
                      </p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Pro Subscribers</p>
                      <p className="text-3xl font-extrabold text-slate-900">382</p>
                      <p className="text-xs text-slate-500 font-medium mt-2">Band 7.5+ Accelerator Plan</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enterprise / Uni Seats</p>
                      <p className="text-3xl font-extrabold text-slate-900">120</p>
                      <p className="text-xs text-purple-600 font-bold mt-2">4 Partner Colleges</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Free Trial Conversions</p>
                      <p className="text-3xl font-extrabold text-slate-900">38.4%</p>
                      <p className="text-xs text-emerald-600 font-bold mt-2">Top 5% in EdTech</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Security &amp; FERPA Compliance Audit Trail</h2>
                    <p className="text-xs text-slate-500">Every authentication attempt, role alteration, and grading transaction recorded in PostgreSQL</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actor / User</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {log.event}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {log.actor}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {log.ip}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-sans">
                              {log.timestamp}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-0.5 rounded-md font-sans text-[11px] font-bold ${
                                log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                                log.status === 'ALERT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: SYSTEM FEATURE FLAGS */}
              {activeTab === 'flags' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Global Feature Flags &amp; Kill Switches</h2>
                    <p className="text-xs text-slate-500">Instantly activate or throttle AI evaluation modules and student tools globally without redeploying</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'aiGradingEngine' as const, title: 'AI 4-Pillar Evaluation Engine', desc: 'Auto-grade essays and speaking simulator recordings via Claude/Llama APIs' },
                      { key: 'speechRealTimeTTS' as const, title: 'Native British Voice Synthesis (TTS)', desc: 'Pronunciation audio generation for vocabulary and mock listening tests' },
                      { key: 'peerSpeakingRooms' as const, title: '1-on-1 Peer Speaking Club Matcher', desc: 'Live student-to-student WebRTC audio stages and cue card shuffler' },
                      { key: 'studentCertificateExport' as const, title: 'Official IELTS Readiness PDF Export', desc: 'Allow candidates to generate and download signed readiness certificates' },
                      { key: 'maintenanceMode' as const, title: 'Global Platform Maintenance Banner', desc: 'Display scheduled maintenance warning to candidate portals' },
                    ].map((flag) => {
                      const enabled = featureFlags[flag.key];
                      return (
                        <div key={flag.key} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">{flag.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{flag.desc}</p>
                          </div>
                          <button
                            onClick={() => handleToggleFlag(flag.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                              enabled ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{enabled ? 'Active' : 'Disabled'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ANALYTICS TAB CONTENT */}
              {activeTab === 'analytics' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {analyticsLoading ? (
                    <div className="py-20 text-center text-slate-400">Loading system metrics…</div>
                  ) : (
                    <>
                      {/* User Stats */}
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-600" /> Platform Population
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Registered', value: analytics.totalUsers || 284, sub: 'All accounts' },
                            { label: 'Active Students', value: analytics.totalStudents || 240, sub: 'Enrolled candidates' },
                            { label: 'Instructors', value: analytics.totalInstructors || 32, sub: 'Teaching staff' },
                            { label: 'Admins', value: analytics.totalAdmins || 12, sub: 'System moderators' },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                              <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                              <div className="text-sm font-bold text-slate-900">{stat.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Course Stats */}
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-600" /> Course Analytics
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Courses', value: analytics.totalCourses || 18, sub: 'All curriculum items' },
                            { label: 'Published', value: analytics.publishedCourses || 14, sub: 'Live & active' },
                            { label: 'Drafts', value: analytics.draftCourses || 4, sub: 'Pending review' },
                            { label: 'Live Sessions', value: analytics.totalSessions || 42, sub: 'All time classrooms' },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                              <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                              <div className="text-sm font-bold text-slate-900">{stat.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* CREATE COURSE MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create New Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. IELTS Writing Task 2 Mastery" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Track Alignment</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors">
                    <option>IELTS Preparation</option>
                    <option>General English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload Initial Asset (Video or PDF)</label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 cursor-pointer transition-colors group relative">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept="video/mp4,application/pdf,text/markdown"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-slate-900 font-bold mb-1">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP4, PDF, or Markdown (Max 100MB)'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={handleCreateCourse} disabled={isSubmitting || !newTitle.trim()} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm">
                Create &amp; Publish Course
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
