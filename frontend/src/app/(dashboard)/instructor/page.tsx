"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, Video, AlertCircle, BookOpen, Search, 
  ChevronRight, ArrowRight, BrainCircuit, LogOut, CheckCircle, Clock,
  FileCheck2, Mic, Sliders, MessageSquare, Award, Sparkles, Send,
  Play, Pause, RotateCcw, CheckCircle2, ChevronDown, Check,
  Volume2, ShieldAlert, BarChart3, Edit3, X, UploadCloud
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

interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: 'essay_task1' | 'essay_task2' | 'speaking_part2';
  title: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'EXAMINER_VERIFIED' | 'AI_GRADED';
  aiScore: {
    overall: number;
    tr_ta: number;
    cc: number;
    lr: number;
    gra: number;
  };
  examinerScore?: {
    overall: number;
    tr_ta: number;
    cc: number;
    lr: number;
    gra: number;
  };
  content: string;
  audioDuration?: string;
  examinerNote?: string;
  remediationAssigned?: string;
}

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentId: 'usr-1',
    studentName: 'Dr. Rohit Mehta',
    studentEmail: 'rohit.mehta@nhs.uk',
    type: 'essay_task2',
    title: 'Task 2: AI in Healthcare & Wealth Disparity',
    submittedAt: 'Today, 14:20',
    status: 'PENDING_REVIEW',
    aiScore: { overall: 6.5, tr_ta: 6.5, cc: 6.5, lr: 7.0, gra: 6.0 },
    content: `In contemporary medical sectors, the adoption of automated diagnostic algorithms has sparked considerable debate. While some practitioners assert that AI will revolutionize clinical triage, others fear substantial ethical pitfalls.\n\nOn one hand, neural networks can process computed tomography scans with high diagnostic accuracy. Furthermore, machine learning relieves overworked hospital clinicians from administrative burden. However, over-reliance on artificial intelligence might weaken doctor-patient empathy and clinical accountability.\n\nIn conclusion, artificial intelligence should be incorporated as a clinical diagnostic adjunct rather than an autonomous replacement for licensed doctors.`,
    examinerNote: ''
  },
  {
    id: 'sub-2',
    studentId: 'usr-3',
    studentName: 'Sarah Chen',
    studentEmail: 'sarah.c@utoronto.ca',
    type: 'speaking_part2',
    title: 'Speaking Part 2: Memorable Cultural Journey',
    submittedAt: 'Today, 11:45',
    status: 'PENDING_REVIEW',
    aiScore: { overall: 7.0, tr_ta: 7.5, cc: 7.0, lr: 7.5, gra: 6.5 },
    content: `I would like to describe a remarkable trip I took to Kyoto in the autumn of 2024. The traditional architecture and historical gardens left an indelible impression on me. We traveled through the Kansai region via high-speed bullet train, which was exceptionally punctual. The cultural serenity contrasted starkly with the bustling pace of contemporary urban life.`,
    audioDuration: '1m 48s',
    examinerNote: ''
  },
  {
    id: 'sub-3',
    studentId: 'usr-5',
    studentName: 'Marcus Sterling',
    studentEmail: 'marcus.s@outlook.com',
    type: 'essay_task1',
    title: 'Task 1: Renewable Energy Investment (2018-2025)',
    submittedAt: 'Yesterday, 19:10',
    status: 'EXAMINER_VERIFIED',
    aiScore: { overall: 6.0, tr_ta: 6.0, cc: 6.0, lr: 6.5, gra: 5.5 },
    examinerScore: { overall: 6.5, tr_ta: 6.5, cc: 6.5, lr: 7.0, gra: 6.0 },
    content: `The grouped bar chart illustrates global investments in renewable energy across five countries between 2018 and 2025. Overall, it is evident that Germany and the UK demonstrated the highest financial commitment toward green infrastructure, whereas other nations recorded modest increases.`,
    examinerNote: 'Good overview paragraph. Ensure more specific comparative data points are cited in Body Paragraph 2.'
  }
];

const fallbackStudents = [
  { id: '1', name: 'Dr. Rohit Mehta', email: 'rohit.mehta@nhs.uk', track: 'IELTS Academic', currentBand: '6.5', targetBand: '8.0', status: 'Active', weakArea: 'Grammatical Inversion', joined: 'Sep 02, 2026' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.c@utoronto.ca', track: 'IELTS Academic', currentBand: '7.5', targetBand: '8.5', status: 'Active', weakArea: 'Task 1 Data Synthesis', joined: 'Sep 09, 2026' },
  { id: '3', name: 'Marcus Sterling', email: 'marcus.s@outlook.com', track: 'IELTS General', currentBand: '6.0', targetBand: '7.0', status: 'Active', weakArea: 'Lexical Variety', joined: 'Aug 29, 2026' },
];

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'grading' | 'courses' | 'roster' | 'escalations' | 'classes'>('grading');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [students, setStudents] = useState<any[]>(fallbackStudents);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [escalations, setEscalations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [instructorName, setInstructorName] = useState('Senior Examiner');

  // Teacher Course Creation State
  const [courseFilterTab, setCourseFilterTab] = useState<'all' | 'published' | 'draft'>('published');
  const [teacherCourses, setTeacherCourses] = useState<Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    modulesCount: number;
    studentsCount: number;
    status: 'published' | 'draft';
    createdDate: string;
  }>>([
    {
      id: 'c-1',
      title: 'IELTS Academic Writing Task 1 & 2 Masterclass',
      slug: 'ielts-academic-writing-masterclass',
      description: 'Master Band 8.5+ syntactic inversion, cohesive linkers, and data overview reporting.',
      modulesCount: 4,
      studentsCount: 38,
      status: 'published',
      createdDate: 'Aug 15, 2026'
    },
    {
      id: 'c-2',
      title: 'Speaking Part 2 & 3 Fluency & Intonation Lab',
      slug: 'speaking-part-2-3-fluency-lab',
      description: 'Acoustic pacing drills, speech cadence training, and idiomatic C2 expressions.',
      modulesCount: 3,
      studentsCount: 24,
      status: 'published',
      createdDate: 'Sep 01, 2026'
    },
    {
      id: 'c-3',
      title: 'C2 Grammar Inversion & Advanced Conditional Transformations',
      slug: 'c2-grammar-inversion-advanced',
      description: 'Draft curriculum focusing on subjunctive conditionals and nominalization drills.',
      modulesCount: 2,
      studentsCount: 0,
      status: 'draft',
      createdDate: 'Sep 12, 2026'
    }
  ]);

  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('Examiner-curated course syllabus with interactive lessons, practice tests, and AI rubric grading.');
  const [newCourseCategory, setNewCourseCategory] = useState('IELTS Academic Writing & Speaking');
  const [newCourseTargetBand, setNewCourseTargetBand] = useState('Band 7.5+');
  const [newCoursePrice, setNewCoursePrice] = useState('$49.00 (Standard)');
  const [newCourseDuration, setNewCourseDuration] = useState('6 Weeks / 30 Hours');
  const [newCourseInstructor, setNewCourseInstructor] = useState('Faculty Lead');
  const [newCourseLevel, setNewCourseLevel] = useState('Intermediate to Advanced');
  const [newCourseStatus, setNewCourseStatus] = useState<'published' | 'draft'>('published');
  const [newCourseFile, setNewCourseFile] = useState<File | null>(null);

  // Submissions & Grading Studio State
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(INITIAL_SUBMISSIONS[0]);
  
  // Active Grading Inputs
  const [gradeTR, setGradeTR] = useState(6.5);
  const [gradeCC, setGradeCC] = useState(6.5);
  const [gradeLR, setGradeLR] = useState(7.0);
  const [gradeGRA, setGradeGRA] = useState(6.0);
  const [examinerFeedback, setExaminerFeedback] = useState('');
  const [selectedRemediation, setSelectedRemediation] = useState('Inversion & Complex Syntax Mastery');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Live session modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Courses from Shared Database & Admin Catalog on Load
  useEffect(() => {
    const fetchSharedCourses = async () => {
      try {
        let localShared: any[] = [];
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('admin_courses');
          if (saved) {
            try { localShared = JSON.parse(saved); } catch {}
          }
        }

        let remoteItems: any[] = [];
        try {
          const res = await fetchWithAuth('/courses?page_size=50');
          if (res.ok) {
            const data = await res.json();
            remoteItems = Array.isArray(data) ? data : data.items || [];
          }
        } catch {
          // backend offline or dev mode
        }

        // Combine and map
        const combined = [...localShared];
        remoteItems.forEach((ri: any) => {
          if (!combined.some(c => c.id === ri.id || c.title === ri.title)) {
            combined.push(ri);
          }
        });

        if (combined.length > 0) {
          const mapped = combined.map((c: any) => ({
            id: c.id,
            title: c.title,
            slug: c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: c.description || 'Comprehensive IELTS and English preparation modules.',
            modulesCount: c.module_count || c.modulesCount || 4,
            studentsCount: c.students || c.studentsCount || 0,
            status: (c.status || 'published').toLowerCase() as 'published' | 'draft',
            createdDate: c.createdDate || (c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active')
          }));
          setTeacherCourses(mapped);
        }
      } catch (err) {
        console.warn("Using offline shared course catalog:", err);
      }
    };

    fetchSharedCourses();
  }, []);

  // Handle Teacher Course Creation (Saves to PostgreSQL DB via API & Shared Catalog)
  const handleCreateCourse = async (overrideStatus?: 'published' | 'draft' | React.FormEvent) => {
    if (overrideStatus && typeof overrideStatus === 'object' && 'preventDefault' in overrideStatus) {
      overrideStatus.preventDefault();
    }
    if (!newCourseTitle.trim()) return;

    setIsSubmitting(true);
    const finalStatus: 'published' | 'draft' = (typeof overrideStatus === 'string' ? overrideStatus : newCourseStatus);

    try {
      const slug = newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let createdFromDb = null;

      // Call Backend Database API
      try {
        const res = await fetchWithAuth('/courses', {
          method: 'POST',
          body: JSON.stringify({
            title: newCourseTitle.trim(),
            description: newCourseDesc.trim() || 'Examiner-curated course syllabus with interactive quizzes and AI assessments.',
            slug: slug
          })
        });

        if (res.ok) {
          createdFromDb = await res.json();
          if (finalStatus === 'published' && createdFromDb.id) {
            await fetchWithAuth(`/courses/${createdFromDb.id}/publish`, {
              method: 'POST',
            }).catch(() => {});
          }
        }
      } catch (apiErr) {
        console.warn("Backend API offline, persisting to shared platform catalog:", apiErr);
      }

      const createdCourse = {
        id: createdFromDb?.id || `c-teach-${Date.now()}`,
        title: createdFromDb?.title || newCourseTitle.trim(),
        slug: createdFromDb?.slug || slug,
        description: createdFromDb?.description || newCourseDesc || 'Examiner-curated course syllabus with interactive quizzes and AI assessments.',
        modulesCount: createdFromDb?.module_count || 1,
        studentsCount: 0,
        status: finalStatus,
        createdDate: 'Just Now'
      };

      // 1. Update Teacher State
      setTeacherCourses(prev => [createdCourse, ...prev]);

      // 2. Persist into Shared Catalog for Admin & Public pages
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('admin_courses') || '[]');
          const updatedShared = [
            {
              id: createdCourse.id,
              title: createdCourse.title,
              description: createdCourse.description,
              status: createdCourse.status,
              module_count: 1,
              students: 0,
              category: newCourseCategory,
              price: newCoursePrice,
              duration: newCourseDuration,
              instructor: newCourseInstructor,
              level: newCourseLevel,
              target_band: newCourseTargetBand
            },
            ...existing
          ];
          localStorage.setItem('admin_courses', JSON.stringify(updatedShared));
        } catch {}
      }

      setShowCreateCourseModal(false);
      setNewCourseTitle('');
      setNewCourseFile(null);

      toast.success(
        finalStatus === 'published' ? "Course Created & Published! 🚀" : "Course Saved as Draft 🔒", 
        `"${createdCourse.title}" is now visible across Teacher, Admin, and Public pages.`
      );
    } catch (err) {
      toast.error("Creation Failed", "Could not create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate live composite band score
  const computedBand = ((gradeTR + gradeCC + gradeLR + gradeGRA) / 4);
  const roundedBand = (Math.round(computedBand * 2) / 2).toFixed(1);

  // Update grading sliders when changing selected submission
  useEffect(() => {
    if (selectedSub) {
      const active = selectedSub.examinerScore || selectedSub.aiScore;
      setGradeTR(active.tr_ta);
      setGradeCC(active.cc);
      setGradeLR(active.lr);
      setGradeGRA(active.gra);
      setExaminerFeedback(selectedSub.examinerNote || '');
    }
  }, [selectedSub]);

  // Handle saving verified examiner score & syncing with Student Results and Notifications
  const handleSaveExaminerGrade = () => {
    if (!selectedSub) return;
    const finalBandNum = parseFloat(roundedBand);

    const updatedSub = {
      ...selectedSub,
      status: 'EXAMINER_VERIFIED' as const,
      examinerScore: {
        overall: finalBandNum,
        tr_ta: gradeTR,
        cc: gradeCC,
        lr: gradeLR,
        gra: gradeGRA
      },
      examinerNote: examinerFeedback || 'Examiner calibrated score with syntactic and coherence evaluation.',
      remediationAssigned: selectedRemediation
    };

    setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? updatedSub : s));
    setSelectedSub(updatedSub);

    // 1. Persist into Student Results & Telemetry storage
    if (typeof window !== 'undefined') {
      try {
        const studentAssessmentRecord = {
          id: `examiner-eval-${selectedSub.id}`,
          title: `Official Examiner Evaluation: ${selectedSub.title}`,
          testType: selectedSub.type === 'speaking_part2' ? 'Speaking Examiner Review' : 'Writing Academic Examiner Assessment',
          date: 'Graded by Examiner Just Now',
          duration: selectedSub.audioDuration || '45m 00s',
          overallBand: finalBandNum,
          cefrLevel: finalBandNum >= 8.5 ? 'C2 Expert User' : finalBandNum >= 7.5 ? 'C1 Proficient User' : 'B2 Upper Intermediate',
          skillBreakdown: [
            { subject: selectedSub.type === 'speaking_part2' ? 'Fluency' : 'Task Response', A: Math.round(gradeTR * 10), fullMark: 100 },
            { subject: selectedSub.type === 'speaking_part2' ? 'Coherence' : 'Cohesion', A: Math.round(gradeCC * 10), fullMark: 100 },
            { subject: 'Vocabulary', A: Math.round(gradeLR * 10), fullMark: 100 },
            { subject: 'Grammar', A: Math.round(gradeGRA * 10), fullMark: 100 },
            { subject: selectedSub.type === 'speaking_part2' ? 'Pronunciation' : 'Syntax', A: Math.round(((gradeTR + gradeGRA) / 2) * 10), fullMark: 100 },
          ],
          fourSkills: {
            listening: 8.0,
            reading: 7.5,
            writing: selectedSub.type.includes('essay') ? finalBandNum : 7.0,
            speaking: selectedSub.type.includes('speaking') ? finalBandNum : 7.5
          },
          greatestStrength: {
            title: gradeLR >= 7.5 ? "Advanced Lexical Resource" : "Task Achievement & Coherence",
            desc: "Demonstrated strong structural control and natural academic collocations."
          },
          primaryWeakness: {
            title: selectedRemediation,
            desc: examinerFeedback || `Assigned targeted drill: ${selectedRemediation} to overcome identified score plateau.`
          },
          feedback: {
            paragraph1: `Official Examiner Feedback: ${examinerFeedback || 'Candidate demonstrated consistent grammatical range and logical flow.'}`,
            highlighted1: `Band ${finalBandNum.toFixed(1)} Benchmark`,
            paragraph2: `Assigned Action Drill: Review the assigned remediation "${selectedRemediation}" to elevate to Band ${(finalBandNum + 0.5).toFixed(1)}.`,
            highlighted2: selectedRemediation
          },
          pieBreakdown: [
            { name: 'Task/Fluency', value: Math.round(gradeTR * 10), color: '#027FFF' },
            { name: 'Cohesion', value: Math.round(gradeCC * 10), color: '#06B6D4' },
            { name: 'Lexical', value: Math.round(gradeLR * 10), color: '#8B5CF6' },
            { name: 'Grammar', value: Math.round(gradeGRA * 10), color: '#F59E0B' }
          ],
          remediation: [
            { title: selectedRemediation, type: "Instructor Assigned Drill", duration: "15 min" },
            { title: "Advanced Academic Synonyms & Collocations", type: "Vocabulary Builder", duration: "10 min" }
          ]
        };

        // Save as latest assessment for student results page
        localStorage.setItem('penpage_latest_assessment', JSON.stringify(studentAssessmentRecord));

        // Sync active remediation into student's remediation state
        const existingRemediations = JSON.parse(localStorage.getItem('student_active_remediations') || '[]');
        const updatedRemediations = [
          { skill_name: selectedSub.type.includes('speaking') ? 'Speaking' : 'Writing', title: selectedRemediation, instructor_escalated: false },
          ...existingRemediations.filter((r: any) => r.title !== selectedRemediation)
        ];
        localStorage.setItem('student_active_remediations', JSON.stringify(updatedRemediations));
      } catch (storageErr) {
        console.warn("Storage sync warning:", storageErr);
      }
    }

    toast.success(
      "Official Grade Published! 🎓", 
      `Calibrated Band ${roundedBand} score and feedback dispatched to ${selectedSub.studentName}.`
    );
  };

  const loadInstructorData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, sessionsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/live-sessions'),
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const raw = usersData.items || (Array.isArray(usersData) ? usersData : []);
        const realStudents = raw
          .filter((u: any) => !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'))
          .map((u: any) => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            email: u.email,
            track: 'IELTS Academic',
            currentBand: '7.0',
            targetBand: '8.5',
            status: u.is_active ? 'Active' : 'Suspended',
            weakArea: 'Grammar Inversion & Cohesion',
            joined: new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          }));
        if (realStudents.length > 0) {
          setStudents(realStudents);
        }
      }
      if (sessionsRes.ok) {
        const sess = await sessionsRes.json();
        setLiveSessions(Array.isArray(sess) ? sess : []);
      }
    } catch (err) {
      console.error('Failed to load instructor data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // RBAC Route Guard: Instructor or Admin privileges required
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = (localStorage.getItem('user_role') || 'student').toLowerCase();
      if (role !== 'instructor' && role !== 'admin' && role !== 'superadmin' && role !== 'teacher') {
        toast.error("Access Restricted 🔒", "Instructor privileges required to access Instructor Hub.");
        router.push('/dashboard');
      } else {
        loadInstructorData();
      }
    }
  }, [router, loadInstructorData]);

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
                <span className="text-base font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">Instructor Hub</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Teacher Portal</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-3 px-3">Instructor Views</div>
            <button 
              onClick={() => setActiveTab('grading')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'grading' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <FileCheck2 className="w-4 h-4" />
              Grading Studio
            </button>
            <button 
              onClick={() => setActiveTab('courses')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'courses' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              Course Studio &amp; Curriculum
            </button>
            <button 
              onClick={() => setActiveTab('roster')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'roster' ? 'bg-[#027FFF] text-white shadow-lg shadow-[#027FFF]/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              Student Roster
            </button>
            <button 
              onClick={() => setActiveTab('escalations')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'escalations' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <AlertCircle className="w-4 h-4" />
              Escalated Students
            </button>
            <button 
              onClick={() => setActiveTab('classes')} 
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Video className="w-4 h-4" />
              Live Class Host
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 mt-6 px-3">Navigation</div>
            <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Student View
            </Link>
            <Link href="/admin/courses" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-medium transition-colors text-sm">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              Admin Studio
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-semibold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F4F8]">
        
        {/* TOP HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Teacher &amp; Examiner Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Course Authoring, Cambridge Rubric Grading &amp; Cohort Telemetry ({instructorName})</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateCourseModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              + Create Course
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Video className="w-4 h-4" />
              Schedule Class
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {instructorName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: EXAMINER ASSESSMENT & GRADING STUDIO */}
          {activeTab === 'grading' && (
            <div className="space-y-6">
              
              {/* Studio Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-purple-600" />
                    Human Examiner Assessment &amp; AI-Override Studio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review AI-scored student essays and speaking recordings. Calibrate official 9-band rubric scores and issue remediation.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {submissions.filter(s => s.status === 'PENDING_REVIEW').length} Submissions Awaiting Audit
                  </span>
                </div>
              </div>

              {/* 2-Column Assessment Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Submissions Queue (4 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase px-1">
                    <span>Student Queue</span>
                    <span>Status</span>
                  </div>

                  <div className="space-y-2.5">
                    {submissions.map((sub) => {
                      const isSelected = selectedSub?.id === sub.id;
                      const activeScore = sub.examinerScore || sub.aiScore;

                      return (
                        <div 
                          key={sub.id}
                          onClick={() => setSelectedSub(sub)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-100' 
                              : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{sub.studentName}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{sub.title}</p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              sub.status === 'EXAMINER_VERIFIED' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {sub.status === 'EXAMINER_VERIFIED' ? 'Verified' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                            <span className="text-slate-400 text-[11px] font-medium">{sub.submittedAt}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-[11px] text-slate-400">Score:</span>
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-black border border-purple-200">
                                Band {activeScore.overall.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Deep Assessment & Rubric Studio (7 cols) */}
                {selectedSub && (
                  <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-7 shadow-sm space-y-6">
                    
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                            {selectedSub.type.toUpperCase().replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{selectedSub.studentEmail}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{selectedSub.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 font-mono text-center">
                        <div className="px-3">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">AI Pre-Score</p>
                          <p className="text-sm font-bold text-slate-600">Band {selectedSub.aiScore.overall.toFixed(1)}</p>
                        </div>
                        <div className="w-px h-7 bg-slate-200"></div>
                        <div className="px-3">
                          <p className="text-[10px] text-purple-600 font-bold uppercase">Official Band</p>
                          <p className="text-base font-black text-purple-700">Band {roundedBand}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content / Essay / Audio Playback */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                          Candidate Submission Content
                        </span>
                        {selectedSub.audioDuration && (
                          <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
                            <Mic className="w-3.5 h-3.5" /> Audio ({selectedSub.audioDuration})
                          </span>
                        )}
                      </div>

                      {/* Mock audio bar for speaking tests */}
                      {selectedSub.audioDuration && (
                        <div className="p-3 mb-3 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 shadow-sm"
                            >
                              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div>
                              <p className="text-xs font-bold text-purple-900">Speaking Part 2 Candidate Recording</p>
                              <p className="text-[11px] text-purple-600 font-mono">0:42 / {selectedSub.audioDuration}</p>
                            </div>
                          </div>
                          
                          {/* Visual Waveform */}
                          <div className="flex items-center gap-0.5 h-6 flex-1 max-w-[160px] justify-end">
                            {[40, 75, 30, 90, 60, 100, 45, 80, 50, 85, 35, 95, 60, 40].map((h, i) => (
                              <span 
                                key={i} 
                                style={{ height: `${isPlayingAudio ? (h + (i % 3) * 10) % 100 : h}%` }} 
                                className="w-1 bg-purple-400 rounded-full transition-all duration-150"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-serif max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {selectedSub.content}
                      </div>
                    </div>

                    {/* Official Cambridge 4-Pillar Rubric Sliders */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-purple-600" /> Examiner Rubric Calibration
                        </span>
                        <span className="text-xs font-bold text-slate-500">Official Cambridge 9.0 Band Scale</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Task Achievement / Response */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-800">Task Response (TR/TA)</span>
                            <span className="text-xs font-black text-purple-700 font-mono">Band {gradeTR.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="4.0" 
                            max="9.0" 
                            step="0.5" 
                            value={gradeTR}
                            onChange={(e) => setGradeTR(parseFloat(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>

                        {/* Coherence & Cohesion */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-800">Coherence &amp; Cohesion (CC)</span>
                            <span className="text-xs font-black text-purple-700 font-mono">Band {gradeCC.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="4.0" 
                            max="9.0" 
                            step="0.5" 
                            value={gradeCC}
                            onChange={(e) => setGradeCC(parseFloat(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>

                        {/* Lexical Resource */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-800">Lexical Resource (LR)</span>
                            <span className="text-xs font-black text-purple-700 font-mono">Band {gradeLR.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="4.0" 
                            max="9.0" 
                            step="0.5" 
                            value={gradeLR}
                            onChange={(e) => setGradeLR(parseFloat(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>

                        {/* Grammatical Range & Accuracy */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-800">Grammar &amp; Accuracy (GRA)</span>
                            <span className="text-xs font-black text-purple-700 font-mono">Band {gradeGRA.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="4.0" 
                            max="9.0" 
                            step="0.5" 
                            value={gradeGRA}
                            onChange={(e) => setGradeGRA(parseFloat(e.target.value))}
                            className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Teacher Feedback & Targeted Remediation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Official Examiner Feedback &amp; Annotations
                        </label>
                        <textarea 
                          rows={3}
                          value={examinerFeedback}
                          onChange={(e) => setExaminerFeedback(e.target.value)}
                          placeholder="Provide actionable examiner notes (e.g. Expand comparative data points in body 2; avoid repetitive passive voice)."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-colors resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Assign Targeted Remediation Drill
                          </label>
                          <select 
                            value={selectedRemediation}
                            onChange={(e) => setSelectedRemediation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600"
                          >
                            <option>Inversion &amp; Complex Syntax Mastery</option>
                            <option>Band 9 C2 Lexical Collocations Pack</option>
                            <option>Task 1 Bar &amp; Flowchart Report Sprint</option>
                            <option>Speaking Part 3 Fluency &amp; Discourse Markers</option>
                          </select>
                        </div>

                        <button 
                          onClick={handleSaveExaminerGrade}
                          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Publish Examiner Calibrated Grade 🎓
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: TEACHER COURSE STUDIO & CURRICULUM AUTHORING */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Teacher Course Authoring &amp; Curriculum Studio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage your published live curriculums and private drafts.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Published vs Draft Switcher */}
                  <div className="bg-white border border-slate-200/80 p-1 rounded-2xl flex shadow-xs">
                    <button
                      onClick={() => setCourseFilterTab('published')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        courseFilterTab === 'published'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Published ({teacherCourses.filter(c => c.status === 'published').length})
                    </button>
                    <button
                      onClick={() => setCourseFilterTab('draft')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        courseFilterTab === 'draft'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Drafts ({teacherCourses.filter(c => c.status === 'draft').length})
                    </button>
                    <button
                      onClick={() => setCourseFilterTab('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        courseFilterTab === 'all'
                          ? 'bg-[#027FFF] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({teacherCourses.length})
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowCreateCourseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    + Create Course
                  </button>
                </div>
              </div>

              {/* Course Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses
                  .filter(c => courseFilterTab === 'all' ? true : c.status === courseFilterTab)
                  .map((course) => (
                  <div key={course.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-300 shadow-sm transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${
                          course.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {course.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{course.createdDate}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-2">{course.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 py-3 border-y border-slate-100 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          {course.modulesCount} Modules
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#027FFF]" />
                          {course.studentsCount} Active Students
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-2">
                      <Link 
                        href="/admin/courses"
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center"
                      >
                        Edit Curriculum
                      </Link>
                      <button 
                        onClick={() => {
                          const nextStatus = course.status === 'published' ? 'draft' : 'published';
                          setTeacherCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: nextStatus } : c));
                          toast.success(`Course Status Updated!`, `"${course.title}" is now ${nextStatus.toUpperCase()}.`);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
                          course.status === 'published'
                            ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={course.status === 'published' ? 'Unpublish to Draft' : 'Publish Course'}
                      >
                        {course.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <X className="w-5 h-5" />
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

      {/* TEACHER CREATE COURSE MODAL - FULLY UNIFIED WITH ADMIN MODAL */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" /> Create &amp; Curate New Course
                </h2>
                <p className="text-xs text-slate-500 mt-1">Configure curriculum details, access tiers, and target band benchmarks.</p>
              </div>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Title *
                </label>
                <input 
                  type="text" 
                  value={newCourseTitle} 
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Band 9.0 Lexical Resource &amp; Academic Collocations" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description &amp; Syllabus Overview
                </label>
                <textarea 
                  rows={3} 
                  value={newCourseDesc} 
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Describe the modules, targeted band score gains, and diagnostic drills..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-sm font-medium resize-none transition-colors"
                />
              </div>

              {/* 2-Column: Track & Target Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Track Alignment / Category
                  </label>
                  <select 
                    value={newCourseCategory} 
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>IELTS Preparation</option>
                    <option>IELTS Academic</option>
                    <option>IELTS General Training</option>
                    <option>General English</option>
                    <option>Business English &amp; Fluency</option>
                    <option>Grammar &amp; Vocabulary Booster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Band / Level
                  </label>
                  <select 
                    value={newCourseTargetBand} 
                    onChange={(e) => setNewCourseTargetBand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>Band 7.5+</option>
                    <option>Band 8.0+ (Elite)</option>
                    <option>Band 8.5+</option>
                    <option>Band 6.5 - 7.0 (Target)</option>
                    <option>C1 Advanced (CEFR)</option>
                    <option>B2 Upper Intermediate</option>
                  </select>
                </div>
              </div>

              {/* 2-Column: Pricing Tier & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Pricing &amp; Access Tier
                  </label>
                  <select 
                    value={newCoursePrice} 
                    onChange={(e) => setNewCoursePrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>$49.00 (Standard)</option>
                    <option>$0 (Free Access)</option>
                    <option>$79.00 (Pro Cohort)</option>
                    <option>$129.00 (1-on-1 Mentored)</option>
                    <option>Included in Pro Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Course Duration &amp; Hours
                  </label>
                  <select 
                    value={newCourseDuration} 
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>6 Weeks / 30 Hours</option>
                    <option>4 Weeks / 20 Hours (Crash Course)</option>
                    <option>8 Weeks / 45 Hours (Comprehensive)</option>
                    <option>12 Weeks / 60 Hours (Full Diploma)</option>
                  </select>
                </div>
              </div>

              {/* 2-Column: Lead Instructor & Course Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assigned Lead Instructor
                  </label>
                  <select 
                    value={newCourseInstructor} 
                    onChange={(e) => setNewCourseInstructor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>Hamza Arshid (Lead Assessor)</option>
                    <option>Prof. Alistair Finch (Oxford / British Council)</option>
                    <option>Sarah Jenkins (Senior IELTS Examiner)</option>
                    <option>Dr. Rohit Mehta (IELTS Medical Track)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select 
                    value={newCourseLevel} 
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-sm font-medium transition-colors"
                  >
                    <option>Intermediate to Advanced</option>
                    <option>All Levels Welcome</option>
                    <option>Advanced Masterclass</option>
                    <option>Foundation / Beginner</option>
                  </select>
                </div>
              </div>

              {/* Initial Asset Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Syllabus / Introductory Video Asset
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer transition-colors group relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setNewCourseFile(e.target.files?.[0] || null)}
                    accept="video/mp4,application/pdf,text/markdown"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-slate-900 font-bold">
                    {newCourseFile ? newCourseFile.name : 'Click to upload or drag & drop file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {newCourseFile ? `${(newCourseFile.size / 1024 / 1024).toFixed(2)} MB uploaded` : 'MP4 Video Lecture, PDF Syllabus, or Markdown (Max 100MB)'}
                  </p>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button 
                onClick={() => setShowCreateCourseModal(false)} 
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCreateCourse('draft')} 
                  disabled={isSubmitting || !newCourseTitle.trim()} 
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-sm font-bold transition-colors shadow-sm"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={() => handleCreateCourse('published')} 
                  disabled={isSubmitting || !newCourseTitle.trim()} 
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create &amp; Publish Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
