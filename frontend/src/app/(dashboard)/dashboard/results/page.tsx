"use client";
import { fetchWithAuth } from "@/lib/api";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Award, Target, BookOpen, AlertCircle, 
  ChevronRight, Brain, Zap, Clock, RefreshCw, CheckCircle2, FileText, Mic, Sparkles
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Legend, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

import DashboardSidebar from '@/components/DashboardSidebar';

interface AssessmentRecord {
  id: string;
  title: string;
  testType: string;
  date: string;
  duration: string;
  overallBand: number;
  cefrLevel: string;
  skillBreakdown: { subject: string; A: number; fullMark: number }[];
  fourSkills: { listening: number; reading: number; writing: number; speaking: number };
  greatestStrength: { title: string; desc: string };
  primaryWeakness: { title: string; desc: string };
  feedback: { paragraph1: string; highlighted1: string; paragraph2: string; highlighted2: string };
  pieBreakdown: { name: string; value: number; color: string }[];
  remediation: { title: string; type: string; duration: string }[];
}

const DEFAULT_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: "speaking-mock-4",
    title: "IELTS Speaking Mock Test #4",
    testType: "Speaking Simulator (Part 2 Cue Card)",
    date: "Completed Today",
    duration: "14m 22s",
    overallBand: 7.5,
    cefrLevel: "C1 Proficient User",
    skillBreakdown: [
      { subject: 'Grammar', A: 85, fullMark: 100 },
      { subject: 'Vocabulary', A: 65, fullMark: 100 },
      { subject: 'Fluency', A: 90, fullMark: 100 },
      { subject: 'Pronunciation', A: 75, fullMark: 100 },
      { subject: 'Coherence', A: 70, fullMark: 100 },
    ],
    fourSkills: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 },
    greatestStrength: {
      title: "Fluency & Spontaneity",
      desc: "Your speech rhythm is natural and sustained without noticeable unnatural pauses or cognitive strain."
    },
    primaryWeakness: {
      title: "Lexical Resource (Repetition)",
      desc: "Occasional reliance on lower-tier conversational descriptors. Upgrading common adjectives to C1 academic synonyms will secure Band 8.5."
    },
    feedback: {
      paragraph1: "The candidate spoke at length without noticeable effort or loss of coherence. Natural linking words and topic-specific idioms were deployed effectively.",
      highlighted1: "Complex syntactic structures",
      paragraph2: "To cross the Band 8.0 threshold, replace high-frequency words with precise academic alternatives (e.g., replace 'big problem' with 'severe impediment' or 'critical bottleneck').",
      highlighted2: "C2 Academic Collocations"
    },
    pieBreakdown: [
      { name: 'Listening', value: 25, color: '#027FFF' },
      { name: 'Grammar', value: 34, color: '#06B6D4' },
      { name: 'Reading', value: 25, color: '#F59E0B' },
      { name: 'Conversation', value: 8, color: '#EF4444' },
      { name: 'Vocabulary', value: 8, color: '#8B5CF6' }
    ],
    remediation: [
      { title: "Advanced Academic Adjectives Lexicon", type: "PDF Guide & Vocabulary Drill", duration: "12 min" },
      { title: "Part 2 Idiomatic Expressions Masterclass", type: "Interactive Audio Drills", duration: "18 min" }
    ]
  },
  {
    id: "writing-task1-2",
    title: "IELTS Writing Studio Full Battery",
    testType: "Task 1 Visual Report + Task 2 Academic Essay",
    date: "Completed Yesterday",
    duration: "58m 10s",
    overallBand: 8.0,
    cefrLevel: "C1 Advanced Mastery",
    skillBreakdown: [
      { subject: 'Task Response', A: 85, fullMark: 100 },
      { subject: 'Cohesion', A: 80, fullMark: 100 },
      { subject: 'Lexical Resource', A: 85, fullMark: 100 },
      { subject: 'Grammar (GRA)', A: 80, fullMark: 100 },
      { subject: 'Macro-Overview', A: 90, fullMark: 100 },
    ],
    fourSkills: { listening: 8.5, reading: 8.0, writing: 8.0, speaking: 7.5 },
    greatestStrength: {
      title: "Macro-Overview & Data Synthesis",
      desc: "Clear high-level trends identified immediately in Task 1 with accurate grouped percentage comparisons."
    },
    primaryWeakness: {
      title: "Grammatical Subjunctive Inversions",
      desc: "Minor punctuation slip with comma splices in compound conditional clauses in Task 2 body paragraph 2."
    },
    feedback: {
      paragraph1: "Exceptional visual analysis with concise grouping of the dominant income brackets. The progression of arguments in Task 2 is logical and well-supported.",
      highlighted1: "Band 8.5 Macro Trend Overview",
      paragraph2: "Refine conditional inversions ('Were governments to intervene...') to eliminate run-on clauses.",
      highlighted2: "Syntactic Variety & Inversion"
    },
    pieBreakdown: [
      { name: 'Task Response', value: 30, color: '#027FFF' },
      { name: 'Coherence', value: 25, color: '#10B981' },
      { name: 'Lexicon', value: 25, color: '#8B5CF6' },
      { name: 'Grammar', value: 20, color: '#F59E0B' }
    ],
    remediation: [
      { title: "Task 2 Thesis & Counter-Argument Framing", type: "Model Essay Analysis", duration: "15 min" },
      { title: "Data Trend Comparison Vocabulary Set", type: "Task 1 Visual Drill", duration: "10 min" }
    ]
  },
  {
    id: "diagnostic-check",
    title: "Precision AI Diagnostic Placement",
    testType: "Adaptive Baseline Evaluation",
    date: "Initial Baseline",
    duration: "10m 05s",
    overallBand: 7.0,
    cefrLevel: "C1 Independent User",
    skillBreakdown: [
      { subject: 'Grammar', A: 70, fullMark: 100 },
      { subject: 'Vocabulary', A: 75, fullMark: 100 },
      { subject: 'Fluency', A: 65, fullMark: 100 },
      { subject: 'Pronunciation', A: 70, fullMark: 100 },
      { subject: 'Coherence', A: 70, fullMark: 100 },
    ],
    fourSkills: { listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 },
    greatestStrength: {
      title: "Academic Vocabulary Range",
      desc: "Solid grasp of academic collocations and formal register in reading comprehension contexts."
    },
    primaryWeakness: {
      title: "Complex Syntactic Inversions",
      desc: "Needs practice with inverted conditionals and passive causative structures under time constraints."
    },
    feedback: {
      paragraph1: "The baseline test demonstrates robust foundation at CEFR C1. The candidate shows strong reading deduction capabilities in True/False/Not Given questions.",
      highlighted1: "Accurate Inferential Deduction",
      paragraph2: "Targeted daily practice on grammatical transformations and timed speaking drills will accelerate trajectory toward Band 8.5.",
      highlighted2: "Daily Target Cadence"
    },
    pieBreakdown: [
      { name: 'Reading', value: 30, color: '#027FFF' },
      { name: 'Grammar', value: 25, color: '#06B6D4' },
      { name: 'Vocabulary', value: 25, color: '#8B5CF6' },
      { name: 'Listening', value: 20, color: '#F59E0B' }
    ],
    remediation: [
      { title: "C2 Sentence Transformation Mastery", type: "Grammar Engine", duration: "20 min" },
      { title: "Speaking Simulator 2-Minute Drill", type: "Audio Telemetry Drill", duration: "15 min" }
    ]
  }
];

export default function ResultsPage() {
  const [weaknesses, setWeaknesses] = useState<{ severity?: number, value?: number, name: string, color?: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'remediation'>('overview');
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Dynamic Candidate & Assessment state
  const [candidateName, setCandidateName] = useState("Hamza Arshid");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("speaking-mock-4");
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(DEFAULT_ASSESSMENTS);

  // Micro Drill Interactive State
  const [activeDrill, setActiveDrill] = useState<{
    title: string;
    type: string;
    question: string;
    context?: string;
    options: string[];
    correctIdx: number;
    explanation: string;
    bandImpact: string;
  } | null>(null);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [drillAnswered, setDrillAnswered] = useState(false);

  const handleOpenDrill = (remediationTitle: string) => {
    let drill = {
      title: remediationTitle,
      type: "AI Targeted Remediation",
      question: "Which high-register phrase elevates lexical precision in your target test?",
      context: "Urban overpopulation ________ unprecedented stress on municipal infrastructure.",
      options: [
        "makes big trouble for",
        "exerts a severely detrimental strain upon",
        "causes super hard difficulties to",
        "creates high bad impacts against"
      ],
      correctIdx: 1,
      explanation: "'Exerts a severely detrimental strain upon' demonstrates native-level C2 collocation competence, immediately replacing repetitive basic verbs.",
      bandImpact: "+0.5 Band Score Improvement"
    };

    if (remediationTitle.toLowerCase().includes("inversion") || remediationTitle.toLowerCase().includes("sentence")) {
      drill = {
        title: remediationTitle,
        type: "Grammar (GRA) Inversion Engine",
        question: "Select the inverted conditional sentence structure:",
        context: "________ the government to subsidize renewable energy, adoption rates would triple.",
        options: [
          "If the government was",
          "Were the government",
          "Should the government had",
          "If had the government"
        ],
        correctIdx: 1,
        explanation: "Subjunctive conditional inversion with 'Were [subject] to [verb]' is a definitive indicator of Band 8.5+ Grammatical Range.",
        bandImpact: "+0.5 Syntactic Range (GRA)"
      };
    } else if (remediationTitle.toLowerCase().includes("idiom") || remediationTitle.toLowerCase().includes("speaking")) {
      drill = {
        title: remediationTitle,
        type: "Speaking Part 2 Spontaneous Idiom",
        question: "Which idiomatic expression naturally describes overcoming an initial hesitation?",
        context: "Although I was initially terrified of public speaking, I ________ and delivered the presentation.",
        options: [
          "bit the bullet",
          "did it very strong",
          "took the hard work",
          "got the big courage"
        ],
        correctIdx: 0,
        explanation: "'Bit the bullet' is a natural, unforced idiomatic expression that examiners look for when assessing Band 8.0+ Lexical Resource.",
        bandImpact: "+0.5 Speaking Fluency & Lexicon"
      };
    }

    setActiveDrill(drill);
    setSelectedDrillOption(null);
    setDrillAnswered(false);
  };

  useEffect(() => {
    // Load Candidate Name and custom settings from localStorage
    try {
      const savedSettings = localStorage.getItem('penpage_user_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.fullName) setCandidateName(parsed.fullName);
      }
      
      const customLatest = localStorage.getItem('penpage_latest_assessment');
      if (customLatest) {
        const parsedRecord = JSON.parse(customLatest);
        if (parsedRecord && parsedRecord.id) {
          setAssessments(prev => {
            const exists = prev.find(a => a.id === parsedRecord.id);
            if (exists) return prev;
            return [parsedRecord, ...prev];
          });
          setSelectedAssessmentId(parsedRecord.id);
        }
      }
    } catch {
      // ignore
    }

    // Fetch live weakness flags from API
    fetchWithAuth('/students/me/weakness-flags')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWeaknesses(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeAssessment = assessments.find(a => a.id === selectedAssessmentId) || assessments[0];

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-800 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8] pb-32">
        
        {/* Header with Assessment Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Overview
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessment Results</h1>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live Synced
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Candidate: <span className="font-bold text-slate-800">{candidateName}</span> • {activeAssessment.title} ({activeAssessment.date})
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Test Switcher dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl px-3 py-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Attempt:</span>
              <select
                aria-label="Select Assessment Record"
                value={activeAssessment.id}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="bg-transparent font-bold text-xs text-slate-800 border-none outline-none cursor-pointer focus:ring-0"
              >
                {assessments.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.title} (Band {test.overallBand})
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/dashboard/analytics"
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" /> Trajectory &amp; Records 🎓
            </Link>

            <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm">
              <Clock className="w-4 h-4 text-[#027FFF]" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Duration</p>
                <p className="text-xs text-slate-900 font-bold">{activeAssessment.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Main Score Card */}
          <div className="col-span-1 lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#027FFF] border border-blue-200">
                {activeAssessment.cefrLevel.split(' ')[0]}
              </span>
            </div>
            <Award className="w-12 h-12 text-[#027FFF] mb-3" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Band Score</h2>
            <div className="text-6xl font-black text-slate-900 tracking-tight mb-2 font-mono">{activeAssessment.overallBand.toFixed(1)}</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Zap className="w-3 h-3" />
              {activeAssessment.cefrLevel}
            </div>
          </div>

          {/* Radar Chart (Strengths & Weaknesses) + Circular Feature Percentage Rings */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Radar Chart with safe padding so no label clips */}
              <div className="w-full sm:w-1/2 h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="58%" data={activeAssessment.skillBreakdown}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Candidate" dataKey="A" stroke="#027FFF" strokeWidth={2.5} fill="#027FFF" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Strengths & Weaknesses Callouts */}
              <div className="w-full sm:w-1/2 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Greatest Strength
                  </h3>
                  <p className="text-xs text-slate-800 font-bold">
                    {activeAssessment.greatestStrength.title}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    {activeAssessment.greatestStrength.desc}
                  </p>
                </div>

                <div className="h-px w-full bg-slate-100"></div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Primary Weakness
                  </h3>
                  <p className="text-xs text-slate-800 font-bold">
                    {activeAssessment.primaryWeakness.title}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    {activeAssessment.primaryWeakness.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Circular Percentage Rings for Every Rubric Feature */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Feature Competence Breakdown
                </span>
                <span className="text-[10px] font-bold text-[#027FFF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  100% Normalized Scale
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {activeAssessment.skillBreakdown.map((skill, idx) => {
                  const colors = [
                    { stroke: '#027FFF', text: 'text-[#027FFF]', bg: 'bg-blue-50/50' },
                    { stroke: '#8B5CF6', text: 'text-purple-600', bg: 'bg-purple-50/50' },
                    { stroke: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50/50' },
                    { stroke: '#06B6D4', text: 'text-cyan-600', bg: 'bg-cyan-50/50' }
                  ];
                  const colorScheme = colors[idx % colors.length];
                  const radius = 18;
                  const circ = 2 * Math.PI * radius;
                  const offset = circ - (skill.A / 100) * circ;

                  return (
                    <div 
                      key={skill.subject}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200/70 ${colorScheme.bg} shadow-2xs hover:scale-105 transition-transform`}
                    >
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke="#E2E8F0"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke={colorScheme.stroke}
                            strokeWidth="3.5"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className={`absolute text-[11px] font-black font-mono ${colorScheme.text}`}>
                          {skill.A}%
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 mt-1.5 text-center truncate max-w-[72px]" title={skill.subject}>
                        {skill.subject}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PIE CHART FOR WEAKNESS DISTRIBUTION */}
          <div className="col-span-1 lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2 text-center">Score Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weaknesses.length > 0 ? weaknesses : activeAssessment.pieBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey={weaknesses.length > 0 ? 'severity' : 'value'}
                    stroke="none"
                    labelLine={false}
                  >
                    {(weaknesses.length > 0 ? weaknesses : activeAssessment.pieBreakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || ['#027FFF', '#06B6D4', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#027FFF' }}
                  />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4-SKILLS MINI CARD ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Listening</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{activeAssessment.fourSkills.listening.toFixed(1)}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#027FFF] flex items-center justify-center font-bold text-xs">
              🎧
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reading</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{activeAssessment.fourSkills.reading.toFixed(1)}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              📖
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Writing</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{activeAssessment.fourSkills.writing.toFixed(1)}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              ✍️
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Speaking</p>
              <p className="text-2xl font-black text-slate-900 font-mono">{activeAssessment.fourSkills.speaking.toFixed(1)}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
              🎙️
            </div>
          </div>
        </div>

        {/* TABS FOR REMEDIATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 mb-8 pb-1">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Detailed Breakdown
            </button>
            <button 
              onClick={() => setActiveTab('remediation')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'remediation' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              AI Study Plan ({activeAssessment.remediation.length} Modules)
            </button>
          </div>

          <button
            onClick={() => setShowCertificate(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all mb-2"
          >
            <Award className="w-4 h-4" />
            Generate Official Certificate 🏆
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'overview' ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Examiner Feedback &amp; Diagnostic Notes
            </h3>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                {activeAssessment.feedback.paragraph1}{" "}
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mx-1">
                  {activeAssessment.feedback.highlighted1}
                </span>
              </p>
              <p>
                {activeAssessment.feedback.paragraph2}{" "}
                <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded mx-1">
                  {activeAssessment.feedback.highlighted2}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-purple-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-200">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Custom Remediation Path</h3>
                <p className="text-xs text-slate-500 font-medium">AI-Generated based on diagnosed lexical and syntactic gaps</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAssessment.remediation.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleOpenDrill(item.title)}
                  className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-purple-300 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <BookOpen className="w-6 h-6 text-purple-600 mb-3" />
                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">{item.title}</h4>
                    <p className="text-xs text-slate-500 mb-4">{item.duration} • {item.type}</p>
                  </div>
                  <div className="text-xs font-bold text-purple-600 flex items-center">
                    Launch Interactive Micro-Drill <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* INTERACTIVE REMEDIATION MICRO-DRILL MODAL */}
      {activeDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-600">
                <Brain className="w-4 h-4" /> {activeDrill.type}
              </div>
              <button
                onClick={() => setActiveDrill(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Target Drill Focus
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-snug">{activeDrill.title}</h3>
            </div>

            {/* Drill Prompt */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <p className="text-xs font-bold text-slate-700">{activeDrill.question}</p>
              {activeDrill.context && (
                <p className="text-sm font-serif text-slate-900 italic font-semibold pt-1">
                  &ldquo;{activeDrill.context}&rdquo;
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {activeDrill.options.map((opt, oIdx) => {
                const isSelected = selectedDrillOption === oIdx;
                const isCorrect = oIdx === activeDrill.correctIdx;

                let btnStyle = "border-slate-200 bg-white hover:border-purple-300 text-slate-800";
                if (drillAnswered) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-900 line-through";
                  }
                } else if (isSelected) {
                  btnStyle = "border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-600/20";
                }

                return (
                  <button
                    key={oIdx}
                    disabled={drillAnswered}
                    onClick={() => setSelectedDrillOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {drillAnswered && isCorrect && (
                      <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                        ✓ Correct
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Action */}
            {drillAnswered ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${selectedDrillOption === activeDrill.correctIdx ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <p className="font-bold mb-1">
                    {selectedDrillOption === activeDrill.correctIdx ? '🎉 Excellent Choice!' : '💡 Diagnostic Review:'}
                  </p>
                  <p>{activeDrill.explanation}</p>
                  <span className="mt-2 inline-block font-extrabold text-[11px] text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">
                    {activeDrill.bandImpact}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedDrillOption(null);
                      setDrillAnswered(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => setActiveDrill(null)}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20"
                  >
                    Completed Drill 🎯
                  </button>
                </div>
              </div>
            ) : (
              <button
                disabled={selectedDrillOption === null}
                onClick={() => setDrillAnswered(true)}
                className="w-full py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
              >
                Submit Answer for AI Grading
              </button>
            )}

          </div>
        </div>
      )}

      {/* OFFICIAL CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-10 flex flex-col space-y-6">
            
            {/* Certificate Header Action */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Official Candidate Verification
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Certificate Frame */}
            <div className="border-8 border-double border-amber-500/30 rounded-2xl p-8 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 text-center space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Award className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">PEN &amp; PAGE ACADEMIA</h2>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">IELTS &amp; CEFR Performance Accreditation</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-extrabold">This is to certify that</p>
                <h3 className="text-2xl font-black text-slate-900 font-serif">{candidateName}</h3>
                <p className="text-xs text-slate-500 font-medium">has successfully demonstrated official competence in</p>
                <p className="text-sm font-bold text-[#027FFF]">{activeAssessment.title}</p>
              </div>

              {/* Band Score Display */}
              <div className="inline-flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-amber-50 border-2 border-amber-300">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">Overall Band Score</span>
                <span className="text-4xl font-black text-amber-600 font-mono">{activeAssessment.overallBand.toFixed(1)}</span>
                <span className="text-[11px] font-bold text-amber-700 mt-0.5">CEFR Level: {activeAssessment.cefrLevel}</span>
              </div>

              {/* 4 Skill Criteria Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Listening</span>
                  <span className="text-base font-black text-slate-900 font-mono">{activeAssessment.fourSkills.listening.toFixed(1)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Reading</span>
                  <span className="text-base font-black text-slate-900 font-mono">{activeAssessment.fourSkills.reading.toFixed(1)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Writing</span>
                  <span className="text-base font-black text-slate-900 font-mono">{activeAssessment.fourSkills.writing.toFixed(1)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">Speaking</span>
                  <span className="text-base font-black text-slate-900 font-mono">{activeAssessment.fourSkills.speaking.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-left text-[10px] text-slate-400 font-medium">
                <div>
                  <p className="font-bold text-slate-700">Verification ID: PPA-2026-8941</p>
                  <p>Evaluation: {activeAssessment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Dr. Victoria Sterling</p>
                  <p>Lead Academic Assessment Director</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

