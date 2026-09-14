"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Award, TrendingUp, BrainCircuit, CheckCircle2, AlertTriangle, 
  ArrowLeft, ArrowRight, Download, Printer, Share2, Sparkles, 
  ShieldCheck, Clock, Calendar, BarChart3, Target, BookOpen, 
  PenTool, Mic, Headphones, Eye, RefreshCw, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell 
} from 'recharts';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface SkillScore {
  skill: string;
  score: number;
  target: number;
  benchmark: string;
  color: string;
  icon: any;
}

interface TestHistoryEntry {
  id: string;
  testName: string;
  date: string;
  overallBand: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  duration: string;
}

interface WeaknessDiagnosis {
  id: string;
  skill: 'Writing' | 'Speaking' | 'Reading' | 'Grammar';
  title: string;
  impact: string;
  severity: 'High' | 'Medium' | 'Low';
  exampleSnippet: string;
  recommendedDrill: string;
  actionUrl: string;
}

export default function PerformanceAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'remediation' | 'certificate'>('analytics');
  
  // Student & Certificate State
  const [candidateName, setCandidateName] = useState('Hamza Arshid');
  const [candidateId, setCandidateId] = useState('PPA-2026-8941');
  const [isEditingName, setIsEditingName] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // Load User Name from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_name');
      if (storedName) setCandidateName(storedName);
    }
  }, []);

  // 4-Skill Trajectory Dataset
  const historicalProgress = [
    { session: 'Baseline', overall: 6.5, listening: 7.0, reading: 6.5, writing: 6.0, speaking: 6.5 },
    { session: 'Week 1', overall: 6.5, listening: 7.5, reading: 6.5, writing: 6.0, speaking: 7.0 },
    { session: 'Week 2', overall: 7.0, listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 },
    { session: 'Week 3', overall: 7.5, listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 },
    { session: 'Week 4', overall: 7.5, listening: 8.5, reading: 8.0, writing: 7.0, speaking: 7.5 },
    { session: 'Latest Mock', overall: 8.0, listening: 8.5, reading: 8.5, writing: 7.5, speaking: 8.0 },
  ];

  // 4 Official IELTS Sub-Criteria Radar
  const radarData = [
    { criteria: 'Fluency & Coherence', current: 85, target: 90, fullMark: 100 },
    { criteria: 'Lexical Resource', current: 88, target: 90, fullMark: 100 },
    { criteria: 'Grammatical Range', current: 80, target: 85, fullMark: 100 },
    { criteria: 'Pronunciation', current: 85, target: 90, fullMark: 100 },
    { criteria: 'Task Achievement', current: 82, target: 85, fullMark: 100 },
  ];

  // Skills Summary
  const skillScores: SkillScore[] = [
    { skill: 'Listening', score: 8.5, target: 8.5, benchmark: 'CEFR C2 Mastery', color: '#027FFF', icon: Headphones },
    { skill: 'Reading', score: 8.5, target: 8.5, benchmark: 'CEFR C2 Mastery', color: '#10B981', icon: BookOpen },
    { skill: 'Writing', score: 7.5, target: 8.0, benchmark: 'CEFR C1 Advanced', color: '#8B5CF6', icon: PenTool },
    { skill: 'Speaking', score: 8.0, target: 8.5, benchmark: 'CEFR C1+ Operational', color: '#F59E0B', icon: Mic },
  ];

  // Historical Test Records
  const testRecords: TestHistoryEntry[] = [
    { id: 'MOCK-04', testName: 'Cambridge Academic Mock Exam #4', date: 'Today, 2:30 PM', overallBand: 8.0, listening: 8.5, reading: 8.5, writing: 7.5, speaking: 8.0, duration: '2h 45m' },
    { id: 'MOCK-03', testName: 'Cambridge Academic Mock Exam #3', date: 'Sep 10, 2026', overallBand: 7.5, listening: 8.0, reading: 8.0, writing: 7.0, speaking: 7.5, duration: '2h 45m' },
    { id: 'WRIT-08', testName: 'Writing Task 2 Essay Evaluation', date: 'Sep 08, 2026', overallBand: 7.5, listening: 0, reading: 0, writing: 7.5, speaking: 0, duration: '40m' },
    { id: 'SPK-12', testName: 'Speaking Part 2 & 3 AI Simulator', date: 'Sep 06, 2026', overallBand: 8.0, listening: 0, reading: 0, writing: 0, speaking: 8.0, duration: '15m' },
  ];

  // AI Weak-Spot Doctor Diagnosis
  const diagnoses: WeaknessDiagnosis[] = [
    {
      id: 'DIAG-1',
      skill: 'Writing',
      title: 'Inversion in Hypothetical Conditionals',
      impact: 'Limits Grammatical Range in Task 2 to Band 7.0',
      severity: 'High',
      exampleSnippet: 'Instead of: "If governments were to act...", try: "Were governments to implement immediate carbon subsidies..."',
      recommendedDrill: 'Complex Inversion & Subjunctive Syntax Drills',
      actionUrl: '/dashboard/writing'
    },
    {
      id: 'DIAG-2',
      skill: 'Speaking',
      title: 'Abstract Hedging & Hesitation in Part 3',
      impact: 'Sub-optimal pause frequency on speculative economic prompts',
      severity: 'Medium',
      exampleSnippet: 'Avoid: "Um, I think maybe in 20 years...". Use: "It is widely anticipated that within the next two decades..."',
      recommendedDrill: 'Part 3 Spontaneous Cue Drills',
      actionUrl: '/dashboard/simulator'
    },
    {
      id: 'DIAG-3',
      skill: 'Reading',
      title: 'True / False / Not Given Determiner Traps',
      impact: 'Potential confusion between negative claims and unmentioned data',
      severity: 'Low',
      exampleSnippet: 'Watch for absolute determiners like "invariably" vs probabilistic determiners like "frequently".',
      recommendedDrill: 'Speed Skimming & Determiner Identification',
      actionUrl: '/dashboard/mock-exam'
    }
  ];

  // Print Certificate Handler
  const handlePrintCertificate = () => {
    toast.info("Preparing Official Certificate 🖨️", "Formatting print stylesheet for high-resolution certificate export.");
    setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#027FFF]" /> Diagnostic Analytics &amp; Certificate
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historical 4-skill band progression, AI weakness doctor, and official readiness certification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex shadow-sm">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 4-Skill Trajectory
              </button>
              <button
                onClick={() => setActiveTab('remediation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'remediation' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧭 AI Weak-Spot Doctor ({diagnoses.length})
              </button>
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'certificate' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎓 Official Certificate
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Overall Band 8.0</span>
            </div>
          </div>
        </div>

        {/* TAB 1: 4-SKILL TRAJECTORY & METRICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* 4-Skill Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skillScores.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.skill} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100" style={{ color: s.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target {s.target}</span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{s.skill}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900">Band {s.score}</span>
                        <span className="text-xs font-bold text-emerald-600">+0.5</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block mt-1">{s.benchmark}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trajectory Area Chart + Criteria Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Historical Area Chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Overall Band Score Trajectory</h3>
                    <p className="text-xs text-slate-500">Historical performance evolution over recent mock test sessions.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    📈 +1.5 Band Growth
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#027FFF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#027FFF" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="session" stroke="#94A3B8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[5.0, 9.0]} stroke="#94A3B8" fontSize={11} fontWeight={600} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '16px', color: '#fff', border: 'none', fontSize: '12px' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="overall" stroke="#027FFF" strokeWidth={3} fillOpacity={1} fill="url(#bandGradient)" name="Overall Band" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sub-Criteria Radar Chart */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Official Sub-Criteria</h3>
                  <p className="text-xs text-slate-500 mb-4">Cambridge 4-pillar proficiency rubric</p>
                  
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="criteria" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Candidate Skill" dataKey="current" stroke="#027FFF" fill="#027FFF" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Accuracy: 86.4%</span>
                  <span className="text-[#027FFF]">Target: Band 8.5+</span>
                </div>
              </div>

            </div>

            {/* Recent Assessments Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Recent Diagnostic Assessment History</h3>
                <span className="text-xs text-slate-400 font-semibold">{testRecords.length} Completed Tests</span>
              </div>

              <div className="divide-y divide-slate-100">
                {testRecords.map(record => (
                  <div key={record.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{record.testName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{record.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {record.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {record.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        {record.listening > 0 && <span>L: {record.listening}</span>}
                        {record.reading > 0 && <span>R: {record.reading}</span>}
                        {record.writing > 0 && <span>W: {record.writing}</span>}
                        {record.speaking > 0 && <span>S: {record.speaking}</span>}
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#027FFF] text-xs font-black border border-blue-200">
                        Band {record.overallBand}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AI WEAK-SPOT DOCTOR */}
        {activeTab === 'remediation' && (
          <div className="space-y-6">
            
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> Automated IELTS Error Pathology
                </div>
                <h2 className="text-2xl font-black">AI Weak-Spot Remediation Engine</h2>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Our neural analyzer detected 3 recurring linguistic and syntactic patterns holding back your score from Band 8.5 to 9.0. Complete these targeted drills to eliminate penalties.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15">
                <div className="text-center">
                  <span className="text-3xl font-black text-amber-400">3</span>
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Active Flags</span>
                </div>
              </div>
            </div>

            {/* Diagnoses Cards */}
            <div className="space-y-4">
              {diagnoses.map((diag) => (
                <div key={diag.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        diag.severity === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                        diag.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {diag.severity} Priority
                      </span>
                      <h3 className="text-base font-black text-slate-900">{diag.title}</h3>
                    </div>

                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Target Area: {diag.skill}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    ⚠️ <strong>Impact on Band Score:</strong> {diag.impact}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-mono leading-relaxed">
                    {diag.exampleSnippet}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <span>Prescribed Drill: {diag.recommendedDrill}</span>
                    </div>

                    <Link
                      href={diag.actionUrl}
                      className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 flex items-center gap-1.5 transition-all"
                    >
                      Launch Remediation Drill <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: OFFICIAL IELTS READINESS CERTIFICATE GENERATOR */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-black text-slate-900">Verified IELTS Academic Readiness Certificate</h3>
                  <p className="text-xs text-slate-500">Official Cambridge Assessment Standard • Digital ID: {candidateId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isEditingName ? 'Done Editing' : 'Customize Name ✏️'}
                </button>

                <button
                  onClick={handlePrintCertificate}
                  className="px-5 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print / Export PDF
                </button>
              </div>
            </div>

            {/* LIVE EDITABLE CERTIFICATE CANVAS */}
            <div className="max-w-4xl mx-auto w-full">
              <div 
                ref={certificateRef}
                className="bg-[#FAFAFA] border-[12px] border-[#0F172A] p-10 lg:p-14 rounded-2xl shadow-2xl relative overflow-hidden text-slate-900 select-none print:m-0 print:border-[8px] print:shadow-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f4f6f9 100%)'
                }}
              >
                {/* Gold Certificate Border Inset */}
                <div className="absolute inset-2 border-2 border-amber-500/40 pointer-events-none rounded-lg" />
                <div className="absolute inset-3 border border-amber-500/20 pointer-events-none rounded-lg" />

                {/* Certificate Header */}
                <div className="flex items-center justify-between pb-8 border-b-2 border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white p-2 border border-slate-200 shadow-md flex items-center justify-center">
                      <img src="/logo.png" alt="Pen & Page Academia" className="h-12 w-auto object-contain" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">PEN &amp; PAGE ACADEMIA</h2>
                      <p className="text-[10px] font-extrabold text-amber-700 tracking-widest uppercase">Global IELTS Academic Excellence Certification</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Verification Stamp</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{candidateId}</span>
                  </div>
                </div>

                {/* Certificate Title */}
                <div className="text-center py-8 space-y-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Official Certificate of Achievement</span>
                  <h1 className="text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight">
                    IELTS Academic Band 8.0 Readiness
                  </h1>
                  <p className="text-xs text-slate-500 font-sans">This certifies that the candidate listed below has successfully completed comprehensive diagnostic assessments and demonstrated mastery equivalent to CEFR Level C1+.</p>
                </div>

                {/* Candidate Name */}
                <div className="text-center py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Awarded To</p>
                  {isEditingName ? (
                    <input 
                      type="text" 
                      value={candidateName} 
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="text-2xl lg:text-3xl font-serif font-black text-[#027FFF] text-center border-b-2 border-[#027FFF] bg-transparent focus:outline-none max-w-md mx-auto"
                    />
                  ) : (
                    <h3 className="text-3xl lg:text-4xl font-serif font-black text-slate-900 border-b-2 border-slate-300 pb-2 inline-block px-8">
                      {candidateName}
                    </h3>
                  )}
                </div>

                {/* 4-Skill Score Breakdown Table */}
                <div className="grid grid-cols-4 gap-4 my-8 max-w-2xl mx-auto text-center">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Listening</span>
                    <span className="text-2xl font-black text-slate-900">8.5</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Reading</span>
                    <span className="text-2xl font-black text-slate-900">8.5</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Writing</span>
                    <span className="text-2xl font-black text-slate-900">7.5</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Speaking</span>
                    <span className="text-2xl font-black text-slate-900">8.0</span>
                  </div>
                </div>

                {/* Overall Score Stamp */}
                <div className="flex items-center justify-center gap-3 my-6">
                  <div className="px-6 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-black tracking-wide">
                    OVERALL VERIFIED BAND SCORE: 8.0 (CEFR C1+)
                  </div>
                </div>

                {/* Certificate Footer with Signatures & QR */}
                <div className="pt-8 border-t-2 border-slate-200 flex items-end justify-between">
                  <div>
                    <div className="font-serif italic text-lg font-bold text-slate-800">Sarah Jenkins</div>
                    <div className="w-36 h-0.5 bg-slate-400 my-1" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sarah Jenkins, IELTS Lead Examiner</span>
                    <span className="text-[9px] text-slate-400">Head of Academic Assessment</span>
                  </div>

                  {/* QR Verification Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                      <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-white text-[8px] font-mono text-center p-1 font-bold">
                        QR VERIFIED [PPA-8941]
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">Scan to Verify</span>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-sm font-bold text-slate-800">September 14, 2026</div>
                    <div className="w-36 h-0.5 bg-slate-400 my-1 ml-auto" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Issue Date</span>
                    <span className="text-[9px] text-slate-400">Pen &amp; Page Global Registry</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
