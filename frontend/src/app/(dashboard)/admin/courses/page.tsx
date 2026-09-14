"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, MoreVertical, Video, FileText, 
  CheckCircle, Clock, BookOpen, BrainCircuit, UploadCloud, ChevronRight 
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data representing Module 2 content
  
  const [courses, setCourses] = useState<{id: string, title: string, status: string, module_count: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch('http://localhost:8000/api/v1/courses?page_size=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  useEffect(() => {
    
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchCourses().then(() => {
      // Done
    });
  }, [fetchCourses]);

  
  const handlePublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      // We must add a module and lesson first otherwise backend rejects publishing!
      const modRes = await fetch(`http://localhost:8000/api/v1/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "Introduction", sequence_order: 1 })
      });
      const modData = await modRes.json();
      if (modRes.ok) {
        const lesRes = await fetch(`http://localhost:8000/api/v1/modules/${modData.id}/lessons`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: "Welcome Lesson", sequence_order: 1 })
        });
        const lesData = await lesRes.json();
        if (lesRes.ok) {
          await fetch(`http://localhost:8000/api/v1/lessons/${lesData.id}/publish`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
      const res = await fetch(`http://localhost:8000/api/v1/courses/${courseId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error("Failed to publish", error);
    }
  };

  const handleCreateCourse = async () => {
    if (!newTitle) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await fetch('http://localhost:8000/api/v1/courses', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle, description: "A new AI-powered course." })
      });
      if (res.ok) {
        const data = await res.json();
        
        // 2. Create a Module inside the Course
        const modRes = await fetch(`http://localhost:8000/api/v1/courses/${data.id}/modules`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: "Introduction", sequence_order: 1 })
        });
        const modData = await modRes.json();

        // 3. Create a Lesson inside the Module
        if (modRes.ok) {
          const lesRes = await fetch(`http://localhost:8000/api/v1/modules/${modData.id}/lessons`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: "Welcome to the Course", sequence_order: 1 })
          });
          
          if (lesRes.ok) {
            const lesData = await lesRes.json();
            // Publish the lesson
            await fetch(`http://localhost:8000/api/v1/lessons/${lesData.id}/publish`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
        }

        // 4. Auto-publish the course so it shows up in the 'Published' tab immediately!
        await fetch(`http://localhost:8000/api/v1/courses/${data.id}/publish`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setShowCreateModal(false);
        setNewTitle('');
        fetchCourses(); // refresh the list
      } else {
        const err = await res.json();
        alert('Failed to create course: ' + JSON.stringify(err));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


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
                        AI Engine
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-slate-300">{course.module_count || 0} Modules</span>
                        <span className="text-xs text-slate-500">Course Content</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {course.status === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {(course.students || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {course.status === 'draft' && (
                        <button 
                          onClick={(e) => handlePublishCourse(e, course.id)}
                          className="px-3 py-1 mr-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                        >
                          Publish
                        </button>
                      )}
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
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. IELTS Writing Task 2 Mastery" className="w-full bg-[#0B1221] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
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
                  <label className="border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#0B1221]/50 cursor-pointer transition-colors group relative">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept="video/mp4,application/pdf,text/markdown"
                    />
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-white font-medium mb-1">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP4, PDF, or Markdown (Max 100MB)'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleCreateCourse} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                Create & Upload
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
