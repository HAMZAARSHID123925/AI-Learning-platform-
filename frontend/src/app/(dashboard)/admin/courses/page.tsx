"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, MoreVertical, BookOpen, BrainCircuit, UploadCloud, ChevronRight,
  Users, BarChart2, TrendingUp, Globe, CheckCircle, Clock
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ToastProvider';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'analytics'>('published');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/courses?page_size=100');
      const data = await res.json();
      if (data.items) {
        setCourses(data.items);
      }
    } catch (error) {
      console.error(error);
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
      const modRes = await fetchWithAuth(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title: 'Introduction', sequence_order: 1 }),
      });
      const modData = await modRes.json();
      if (modRes.ok) {
        const lesRes = await fetchWithAuth(`/modules/${modData.id}/lessons`, {
          method: 'POST',
          body: JSON.stringify({ title: 'Welcome Lesson', sequence_order: 1 }),
        });
        const lesData = await lesRes.json();
        if (lesRes.ok) {
          await fetchWithAuth(`/lessons/${lesData.id}/publish`, { method: 'POST' });
        }
      }
      const res = await fetchWithAuth(`/courses/${courseId}/publish`, { method: 'POST' });
      if (res.ok) {
        toast.success('Course Published!', 'Course is now live for all enrolled students.');
        fetchCourses();
      } else {
        toast.error('Publish Failed', 'Unable to publish course at this time.');
      }
    } catch (error) {
      console.error('Failed to publish', error);
      toast.error('Publish Failed', 'An unexpected error occurred.');
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
        const data = await res.json();

        const modRes = await fetchWithAuth(`/courses/${data.id}/modules`, {
          method: 'POST',
          body: JSON.stringify({ title: 'Introduction', sequence_order: 1 }),
        });
        const modData = await modRes.json();

        if (modRes.ok) {
          const lesRes = await fetchWithAuth(`/modules/${modData.id}/lessons`, {
            method: 'POST',
            body: JSON.stringify({ title: 'Welcome to the Course', sequence_order: 1 }),
          });
          if (lesRes.ok) {
            const lesData = await lesRes.json();
            await fetchWithAuth(`/lessons/${lesData.id}/publish`, { method: 'POST' });
          }
        }

        await fetchWithAuth(`/courses/${data.id}/publish`, { method: 'POST' });

        toast.success('Course Created & Published!', `"${newTitle}" is now live.`);
        setShowCreateModal(false);
        setNewTitle('');
        fetchCourses();
      } else {
        const err = await res.json();
        const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err);
        toast.error('Creation Failed', msg);
      }
    } catch (error) {
      console.error(error);
      toast.error('Creation Failed', 'Network or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between hidden md:flex shadow-sm">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-slate-50 p-1 flex items-center justify-center border border-slate-200 group-hover:border-purple-500 transition-colors shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">Admin Studio</span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Management</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-3 px-3">Management</div>
            <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold border border-purple-200 text-sm">
              <BookOpen className="w-4 h-4" />
              Courses &amp; Content
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              AI Prompt Tuning
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold transition-colors text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        
        {/* HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Course Management</h1>
            <p className="text-xs text-slate-500 font-medium">Platform Curriculum &amp; Content Administration</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
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
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
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
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No courses found.</td></tr>
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
                        AI Engine
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-900">{course.module_count || 0} Modules</span>
                        <span className="text-xs text-slate-500">Course Content</span>
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

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex items-center gap-3 text-slate-500 text-sm py-10">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading platform analytics…
                </div>
              ) : (
                <>
                  {/* User Stats */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" /> User Analytics
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Users', value: analytics.totalUsers, color: 'blue', icon: <Globe className="w-5 h-5 text-blue-600" /> },
                        { label: 'Students', value: analytics.totalStudents, color: 'emerald', icon: <Users className="w-5 h-5 text-emerald-600" /> },
                        { label: 'Instructors', value: analytics.totalInstructors, color: 'indigo', icon: <Users className="w-5 h-5 text-indigo-600" /> },
                        { label: 'Admins', value: analytics.totalAdmins, color: 'red', icon: <CheckCircle className="w-5 h-5 text-red-600" /> },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                            {stat.icon}
                          </div>
                          <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                          <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
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
                        { label: 'Total Courses', value: analytics.totalCourses, sub: 'All curriculum items' },
                        { label: 'Published', value: analytics.publishedCourses, sub: 'Live & active' },
                        { label: 'Drafts', value: analytics.draftCourses, sub: 'Pending review' },
                        { label: 'Live Sessions', value: analytics.totalSessions, sub: 'All time classrooms' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                          <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                          <div className="text-sm font-bold text-slate-900">{stat.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publish rate bar */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" /> Course Publish Rate
                      </h3>
                      <span className="text-sm text-emerald-600 font-bold">
                        {analytics.totalCourses ? Math.round((analytics.publishedCourses / analytics.totalCourses) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${analytics.totalCourses ? Math.round((analytics.publishedCourses / analytics.totalCourses) * 100) : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
                      <span>{analytics.publishedCourses} published</span>
                      <span>{analytics.draftCourses} in draft</span>
                    </div>
                  </div>
                </>
              )}
            </div>
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
              <button onClick={handleCreateCourse} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm">
                Create &amp; Upload
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
