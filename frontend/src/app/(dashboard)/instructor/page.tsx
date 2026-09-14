"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, Video, AlertCircle, BookOpen, Search, 
  ChevronRight, ArrowRight, BrainCircuit, LogOut, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

interface RealStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  created_at: string;
}

const fallbackStudents = [
  { id: '1', name: 'student@elarion.ai', email: 'student@elarion.ai', track: 'IELTS Academic', currentBand: '—', status: 'Active', weakArea: '—', joined: '—' },
];

import { toast } from '@/components/ToastProvider';

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'roster' | 'escalations' | 'classes'>('roster');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [students, setStudents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [escalations, setEscalations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructorName, setInstructorName] = useState('Instructor');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('user_name');
      if (saved) setInstructorName(saved);

      const [sessionsRes, flagsRes, usersRes] = await Promise.all([
        fetchWithAuth('/live-sessions'),
        fetchWithAuth('/escalations'),
        fetchWithAuth('/users'),
      ]);

      if (sessionsRes.ok) {
        const d = await sessionsRes.json();
        setLiveSessions(Array.isArray(d) ? d : []);
      }
      if (flagsRes.ok) {
        const d = await flagsRes.json();
        setEscalations(Array.isArray(d) ? d : (d.items || []));
      }

      if (usersRes.ok) {
        const allUsers: RealStudent[] = await usersRes.json();
        const studentUsers = Array.isArray(allUsers)
          ? allUsers.filter((u) => !u.roles || u.roles.includes('Student'))
          : [];
        const mapped = studentUsers.map((u) => ({
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          email: u.email,
          track: 'IELTS Academic',
          currentBand: '—',
          status: 'Active',
          weakArea: '—',
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—',
        }));
        setStudents(mapped.length ? mapped : fallbackStudents);
      } else {
        setStudents(fallbackStudents);
      }
    } catch (err) {
      console.error('Failed to load instructor data:', err);
      setStudents(fallbackStudents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScheduleSession = async () => {
    if (!sessionTitle) return;
    setIsSubmitting(true);
    try {
      const scheduledAt = sessionTime ? new Date(sessionTime).toISOString() : new Date(Date.now() + 3600000).toISOString();

      const res = await fetchWithAuth('/live-sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: sessionTitle,
          scheduled_at: scheduledAt,
          max_participants: 30
        }),
      });

      if (res.ok) {
        toast.success('Live Class Scheduled!', `"${sessionTitle}" has been scheduled successfully.`);
        setShowScheduleModal(false);
        setSessionTitle('');
        setSessionTime('');
        fetchData();
      } else {
        const err = await res.json();
        toast.error('Scheduling Failed', typeof err.detail === 'string' ? err.detail : 'Could not schedule live session.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Scheduling Failed', 'Network or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#0B1221] text-slate-200 overflow-hidden font-sans">
      
      {/* INSTRUCTOR SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#0f182c] flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-[#5BC0EB] p-0.5">
                <div className="w-full h-full bg-[#0B1221] rounded-[6px] flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-[#5BC0EB]" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Instructor Hub</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-4 px-4">Instructor Views</div>
            <button 
              onClick={() => setActiveTab('roster')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'roster' ? 'bg-[#027FFF]/10 text-[#5BC0EB] border border-[#027FFF]/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
            >
              <Users className="w-5 h-5" />
              Student Roster
            </button>
            <button 
              onClick={() => setActiveTab('escalations')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'escalations' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
            >
              <AlertCircle className="w-5 h-5" />
              Escalated Students
            </button>
            <button 
              onClick={() => setActiveTab('classes')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'classes' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
            >
              <Video className="w-5 h-5" />
              Live Class Host
            </button>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-4">Navigation</div>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium transition-colors">
              <BookOpen className="w-5 h-5" />
              Student View
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium transition-colors">
              <BrainCircuit className="w-5 h-5" />
              Admin Studio
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#0f182c]/50 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold text-white">Teacher & Instructor Hub</h1>
            <p className="text-xs text-slate-400">Classroom Telemetry & Live Instruction Portal</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              <Video className="w-4 h-4" />
              Schedule Live Class
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: STUDENT ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#5BC0EB]" /> Active Student Cohort
                </h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search candidate by name..." 
                    className="pl-9 pr-4 py-2 bg-[#0f182c] border border-white/5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#5BC0EB] w-64"
                  />
                </div>
              </div>

              <div className="bg-[#0f182c] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Track</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Band</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Weakness</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white group-hover:text-[#5BC0EB] transition-colors">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-white/5 text-slate-300 text-xs font-medium border border-white/10">
                            {student.track}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          <span className="px-2.5 py-1 rounded-lg bg-[#027FFF]/10 text-[#5BC0EB] border border-[#027FFF]/20 text-xs">
                            Band {student.currentBand}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {student.weakArea}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {student.status === 'Active' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5BC0EB] hover:text-white transition-colors"
                          >
                            <span>Inspect Telemetry</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ESCALATED REMEDIATION */}
          {activeTab === 'escalations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> Human Teacher Escalations (Failed 3+ Retests)
                </h2>
                <p className="text-sm text-slate-400">These candidates need instructor review or 1-on-1 coaching.</p>
              </div>

              {escalations.length === 0 ? (
                <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-10 text-center text-slate-400">
                  <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                  No escalated students right now. All learners are progressing smoothly!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {escalations.map((esc) => (
                    <div key={esc.id} className="bg-[#0f182c] border border-red-500/20 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold uppercase">
                            Flagged for Review
                          </span>
                          <span className="text-xs text-slate-500">{new Date(esc.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-white text-base mb-1">Skill Gap: {esc.skill_id?.substring(0, 8) || 'Speaking Lexical'}</h3>
                        <p className="text-sm text-slate-400">Recorded Score: <span className="text-red-400 font-bold">{(esc.score_at_flag * 10).toFixed(1)}/10</span> (Threshold: 7.0/10)</p>
                      </div>
                      <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                        <Link href="/dashboard/simulator" className="text-xs font-bold text-[#5BC0EB] hover:underline flex items-center gap-1">
                          Review Speaking Audio <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => setShowScheduleModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold"
                        >
                          Book 1-on-1 Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE CLASS HOST */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" /> Scheduled Virtual Classrooms
                  </h2>
                  <p className="text-sm text-slate-400">Launch real-time interactive classrooms with WebRTC telemetry.</p>
                </div>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
                >
                  <Video className="w-4 h-4" />
                  Create Class
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveSessions.map((session) => (
                  <div key={session.id} className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase">
                          {session.status}
                        </span>
                        <span className="text-xs text-slate-500">{session.max_participants} max seats</span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{session.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                        <Clock className="w-4 h-4 text-[#5BC0EB]" />
                        {new Date(session.scheduled_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <button 
                        onClick={async () => {
                          const res = await fetchWithAuth(`/live-sessions/${session.id}/join`, {
                            method: 'POST',
                          });
                          const data = await res.json();
                          if (data.room_url) window.open(data.room_url, '_blank');
                          else alert('Joined WebRTC room token: ' + data.token);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Host Classroom Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* SCHEDULE LIVE CLASS MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f182c] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" /> Schedule Live Classroom
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Class Topic</label>
                <input 
                  type="text" 
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Band 8.0 Speaking Abstract Extension Masterclass"
                  className="w-full bg-[#0B1221] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Scheduled Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full bg-[#0B1221] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleScheduleSession}
                disabled={isSubmitting || !sessionTitle}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
              >
                {isSubmitting ? 'Creating...' : 'Schedule Class'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
