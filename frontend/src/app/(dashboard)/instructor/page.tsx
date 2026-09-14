"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, Video, AlertCircle, BookOpen, Search, 
  ChevronRight, ArrowRight, BrainCircuit, LogOut, CheckCircle, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';

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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* INSTRUCTOR SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between hidden md:flex shadow-sm">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-slate-50 p-1 flex items-center justify-center border border-slate-200 group-hover:border-indigo-500 transition-colors shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">Instructor Hub</span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Teacher Portal</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-3 px-3">Instructor Views</div>
            <button 
              onClick={() => setActiveTab('roster')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'roster' ? 'bg-[#027FFF]/10 text-[#027FFF] border border-[#027FFF]/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Users className="w-4 h-4" />
              Student Roster
            </button>
            <button 
              onClick={() => setActiveTab('escalations')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'escalations' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <AlertCircle className="w-4 h-4" />
              Escalated Students
            </button>
            <button 
              onClick={() => setActiveTab('classes')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'classes' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Video className="w-4 h-4" />
              Live Class Host
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Navigation</div>
            <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors text-sm">
              <BookOpen className="w-4 h-4" />
              Student View
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors text-sm">
              <BrainCircuit className="w-4 h-4" />
              Admin Studio
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        
        {/* TOP HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Teacher &amp; Instructor Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Classroom Telemetry &amp; Live Instruction Portal ({instructorName})</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Video className="w-4 h-4" />
              Schedule Live Class
            </button>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
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
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#027FFF]" /> Active Student Cohort
                </h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search candidate by name..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#027FFF] w-64 shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Track</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Band</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Weakness</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">Loading student cohort…</td></tr>
                    ) : students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            {student.track}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#027FFF] border border-blue-200 text-xs font-bold">
                            Band {student.currentBand}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {student.weakArea}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {student.status === 'Active' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href="/dashboard"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#027FFF] hover:underline transition-colors"
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
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-amber-600" /> Human Teacher Escalations (Failed 3+ Retests)
                </h2>
                <p className="text-sm text-slate-500">These candidates need instructor review or 1-on-1 coaching.</p>
              </div>

              {escalations.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  No escalated students right now. All learners are progressing smoothly!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {escalations.map((esc) => (
                    <div key={esc.id} className="bg-white border border-red-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase border border-red-200">
                            Flagged for Review
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{new Date(esc.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1">Skill Gap: {esc.skill_id?.substring(0, 8) || 'Speaking Lexical'}</h3>
                        <p className="text-sm text-slate-600">Recorded Score: <span className="text-red-600 font-bold">{(esc.score_at_flag * 10).toFixed(1)}/10</span> (Threshold: 7.0/10)</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                        <Link href="/dashboard/simulator" className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1">
                          Review Speaking Audio <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => setShowScheduleModal(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors"
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
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" /> Scheduled Virtual Classrooms
                  </h2>
                  <p className="text-sm text-slate-500">Launch real-time interactive classrooms with WebRTC telemetry.</p>
                </div>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  Create Class
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveSessions.map((session) => (
                  <div key={session.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-300 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase border border-purple-200">
                          {session.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{session.max_participants} max seats</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-2">{session.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4 font-medium">
                        <Clock className="w-4 h-4 text-[#027FFF]" />
                        {new Date(session.scheduled_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button 
                        onClick={async () => {
                          const res = await fetchWithAuth(`/live-sessions/${session.id}/join`, {
                            method: 'POST',
                          });
                          const data = await res.json();
                          if (data.room_url) window.open(data.room_url, '_blank');
                          else alert('Joined WebRTC room token: ' + data.token);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" /> Schedule Live Classroom
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Class Topic</label>
                <input 
                  type="text" 
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Band 8.0 Speaking Abstract Extension Masterclass"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Scheduled Date &amp; Time</label>
                <input 
                  type="datetime-local" 
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button 
                onClick={handleScheduleSession}
                disabled={isSubmitting || !sessionTitle}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm"
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
