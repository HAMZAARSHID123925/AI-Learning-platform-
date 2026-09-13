"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, MoreVertical, Video, FileText, 
  CheckCircle, Clock, BookOpen, BrainCircuit, UploadCloud, ChevronRight 
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data representing Module 2 content
  const courses = [
    { id: 1, title: 'IELTS Academic Mastery', track: 'IELTS', modules: 4, lessons: 24, status: 'published', students: 1240 },
    { id: 2, title: 'General English - CEFR B2', track: 'General', modules: 6, lessons: 42, status: 'published', students: 856 },
    { id: 3, title: 'Advanced Speaking Simulator', track: 'IELTS', modules: 2, lessons: 10, status: 'draft', students: 0 },
  ];

  return (
    <div className="flex h-screen bg-[#0B1221] text-slate-200 overflow-hidden font-sans">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0f182c] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full bg-[#0B1221] rounded-[6px] flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-pink-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Admin Studio</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-4">Management</div>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
              Courses & Content
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
              <CheckCircle className="w-5 h-5" />
              AI Prompt Tuning
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 font-medium transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f182c]/50 backdrop-blur-md">
          <h1 className="text-xl font-bold text-white">Course Management</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex bg-[#0f182c] p-1 rounded-xl border border-white/5 w-fit">
              <button 
                onClick={() => setActiveTab('published')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'published' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Published
              </button>
              <button 
                onClick={() => setActiveTab('drafts')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drafts' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Drafts
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  className="pl-9 pr-4 py-2 bg-[#0f182c] border border-white/5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
                />
              </div>
              <button className="p-2 bg-[#0f182c] border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* COURSE LIST (TABLE) */}
          <div className="bg-[#0f182c] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status === 'draft').map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/10">
                          <BookOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-xs font-medium border border-white/10">
                        {course.track}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">{course.modules} Modules</span>
                        <span className="text-xs text-slate-500">{course.lessons} Lessons</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {course.status === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {course.students.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* CREATE COURSE MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f182c] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Course Title</label>
                  <input type="text" placeholder="e.g. IELTS Writing Task 2 Mastery" className="w-full bg-[#0B1221] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Track Alignment</label>
                  <select className="w-full bg-[#0B1221] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <option>IELTS Preparation</option>
                    <option>General English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Upload Initial Asset (Video or PDF)</label>
                  <div className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#0B1221]/50 cursor-pointer transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-white font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">MP4, PDF, or Markdown (Max 100MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                Create & Upload
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
