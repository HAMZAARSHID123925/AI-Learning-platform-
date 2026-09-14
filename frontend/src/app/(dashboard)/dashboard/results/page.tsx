"use client";
import { fetchWithAuth } from "@/lib/api";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Award, Target, BookOpen, AlertCircle, 
  ChevronRight, Brain, Zap, Clock
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Legend, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

import DashboardSidebar from '@/components/DashboardSidebar';

const skillData = [
  { subject: 'Grammar', A: 85, fullMark: 100 },
  { subject: 'Vocabulary', A: 65, fullMark: 100 },
  { subject: 'Fluency', A: 90, fullMark: 100 },
  { subject: 'Pronunciation', A: 75, fullMark: 100 },
  { subject: 'Coherence', A: 70, fullMark: 100 },
];

export default function ResultsPage() {
  const [weaknesses, setWeaknesses] = useState<{ severity?: number, value?: number, name: string, color?: string }[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'remediation'>('overview');

  useEffect(() => {
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

  const pieData = [
    { name: 'Listening', value: 25, color: '#027FFF' },
    { name: 'Grammar', value: 34, color: '#06B6D4' },
    { name: 'Reading', value: 25, color: '#F59E0B' },
    { name: 'Conversation', value: 8, color: '#EF4444' },
    { name: 'Vocabulary', value: 8, color: '#8B5CF6' }
  ];

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-800 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessment Results</h1>
            <p className="text-sm text-slate-500 mt-1">IELTS Speaking Mock Test #4 • Completed Today</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/analytics"
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" /> View Full Trajectory &amp; Certificate 🎓
            </Link>

            <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-sm">
              <Clock className="w-4 h-4 text-[#027FFF]" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Duration</p>
                <p className="text-xs text-slate-900 font-bold">14m 22s</p>
              </div>
            </div>
          </div>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Main Score Card */}
          <div className="col-span-1 lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
            <Award className="w-12 h-12 text-[#027FFF] mb-3" />
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Band Score</h2>
            <div className="text-6xl font-black text-slate-900 tracking-tight mb-2">7.5</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Zap className="w-3 h-3" />
              +0.5 from last test
            </div>
          </div>

          {/* Radar Chart (Strengths & Weaknesses) */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Student" dataKey="A" stroke="#027FFF" strokeWidth={2} fill="#027FFF" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Greatest Strength
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your <strong className="text-slate-900">Fluency</strong> is excellent. You speak naturally without long unnatural pauses.
                </p>
              </div>
              <div className="h-px w-full bg-slate-100"></div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Primary Weakness
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your <strong className="text-slate-900">Vocabulary</strong> (Lexical Resource) needs work. You repeat basic words like &quot;good&quot; and &quot;bad&quot;.
                </p>
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
                    data={weaknesses.length > 0 ? weaknesses : pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey={weaknesses.length > 0 ? 'severity' : 'value'}
                    stroke="none"
                    labelLine={false}
                  >
                    {(weaknesses.length > 0 ? weaknesses : pieData).map((entry, index) => (
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

        {/* TABS FOR REMEDIATION */}
        <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            Detailed Breakdown
          </button>
          <button 
            onClick={() => setActiveTab('remediation')}
            className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'remediation' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            AI Study Plan
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'overview' ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Examiner Feedback</h3>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>
                The candidate spoke at length without noticeable effort or loss of coherence. However, there were some hesitations as the candidate searched for language. 
                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mx-1">Complex sentences</span> were used well.
              </p>
              <p>
                The primary issue preventing a Band 8.0 is the reliance on simple <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded mx-1">vocabulary</span>. For example, instead of saying &quot;very big problem&quot;, the candidate could have used &quot;significant issue&quot; or &quot;major challenge&quot;.
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
                <p className="text-xs text-slate-500 font-medium">AI-Generated based on diagnosed lexical gaps</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-purple-300 transition-colors cursor-pointer group">
                <BookOpen className="w-6 h-6 text-purple-600 mb-3" />
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">Advanced Adjectives List</h4>
                <p className="text-xs text-slate-500 mb-4">12 min read • PDF Guide</p>
                <div className="text-xs font-bold text-purple-600 flex items-center">
                  Start Lesson <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-purple-300 transition-colors cursor-pointer group">
                <Target className="w-6 h-6 text-purple-600 mb-3" />
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">Idioms for Speaking Part 2</h4>
                <p className="text-xs text-slate-500 mb-4">18 min • Interactive Video</p>
                <div className="text-xs font-bold text-purple-600 flex items-center">
                  Start Lesson <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
