"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Award, Target, BookOpen, AlertCircle, 
  ChevronRight, Brain, Zap, Clock
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell
} from 'recharts';

// Mock Data for the Radar Chart
const skillData = [
  { subject: 'Grammar', A: 85, fullMark: 100 },
  { subject: 'Vocabulary', A: 65, fullMark: 100 },
  { subject: 'Fluency', A: 90, fullMark: 100 },
  { subject: 'Pronunciation', A: 75, fullMark: 100 },
  { subject: 'Coherence', A: 70, fullMark: 100 },
];

export default function ResultsPage() {
  const [weaknesses, setWeaknesses] = useState<{ severity?: number, value?: number, name: string, color?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('http://localhost:8000/api/v1/students/me/weakness-flags', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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
    { name: 'Grammar', value: 34, color: '#5BC0EB' },
    { name: 'Reading', value: 25, color: '#FFB800' },
    { name: 'Conversation', value: 8, color: '#F43F5E' },
    { name: 'Vocabulary', value: 8, color: '#8B5CF6' }
  ];
  const [activeTab, setActiveTab] = useState<'overview' | 'remediation'>('overview');

  return (
    <div className="flex h-screen bg-[#050B14] text-slate-200 overflow-hidden font-sans">
      
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Assessment Results</h1>
            <p className="text-slate-400 mt-1">IELTS Speaking Mock Test #4 • Completed Today</p>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
            <Clock className="w-5 h-5 text-[#5BC0EB]" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Duration</p>
              <p className="text-sm text-white font-bold">14m 22s</p>
            </div>
          </div>
        </div>

        {/* TOP METRICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Main Score Card */}
          <div className="col-span-1 lg:col-span-1 bg-gradient-to-br from-[#027FFF]/20 to-[#0B1221] border border-[#027FFF]/30 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(2,127,255,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#027FFF] rounded-full blur-[80px] opacity-30"></div>
            <Award className="w-12 h-12 text-[#5BC0EB] mb-4" />
            <h2 className="text-slate-300 font-semibold mb-1">Overall Band Score</h2>
            <div className="text-7xl font-black text-white tracking-tighter mb-2">7.5</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Zap className="w-3 h-3" />
              +0.5 from last test
            </div>
          </div>

          {/* Radar Chart (Strengths & Weaknesses) */}
          <div className="col-span-1 lg:col-span-2 bg-[#0f182c] border border-white/5 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="w-full sm:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Student" dataKey="A" stroke="#027FFF" strokeWidth={2} fill="#027FFF" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Greatest Strength
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Your <strong className="text-white">Fluency</strong> is excellent. You speak naturally without long unnatural pauses.
                </p>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  Primary Weakness
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Your <strong className="text-white">Vocabulary</strong> (Lexical Resource) needs work. You repeat basic words like &quot;good&quot; and &quot;bad&quot;.
                </p>
              </div>
            </div>
          </div>
          {/* PIE CHART FOR WEAKNESS DISTRIBUTION */}
          <div className="col-span-1 lg:col-span-1 bg-[#0f182c] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-2 self-start w-full text-center">Score Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weaknesses.length > 0 ? weaknesses : pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey={weaknesses.length > 0 ? 'severity' : 'value'}
                    stroke="none"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {(weaknesses.length > 0 ? weaknesses : pieData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || ['#027FFF', '#5BC0EB', '#FFB800', '#F43F5E', '#8B5CF6'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B1221', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABS FOR REMEDIATION */}
        <div className="flex items-center gap-8 border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#5BC0EB] text-[#5BC0EB]' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Detailed Breakdown
          </button>
          <button 
            onClick={() => setActiveTab('remediation')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'remediation' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            AI Study Plan
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'overview' ? (
          <div className="bg-[#0f182c] border border-white/5 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Examiner Feedback</h3>
            <div className="space-y-6 text-slate-400 leading-loose">
              <p>
                The candidate spoke at length without noticeable effort or loss of coherence. However, there were some hesitations as the candidate searched for language. 
                <span className="text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded mx-1">Complex sentences</span> were used well.
              </p>
              <p>
                The primary issue preventing a Band 8.0 is the reliance on simple <span className="text-rose-400 font-semibold bg-rose-400/10 px-2 py-0.5 rounded mx-1">vocabulary</span>. For example, instead of saying &quot;very big problem&quot;, the candidate could have used &quot;significant issue&quot; or &quot;major challenge&quot;.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-900/20 to-[#0f182c] border border-purple-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your Custom Remediation Path</h3>
                <p className="text-sm text-purple-300/70">AI-Generated based on your weaknesses</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0B1221] border border-white/5 p-5 rounded-2xl hover:border-purple-500/30 transition-colors cursor-pointer group">
                <BookOpen className="w-6 h-6 text-purple-400 mb-3" />
                <h4 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">Advanced Adjectives List</h4>
                <p className="text-xs text-slate-500 mb-4">12 min read • PDF Guide</p>
                <div className="text-xs font-semibold text-purple-400 flex items-center">
                  Start Lesson <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              
              <div className="bg-[#0B1221] border border-white/5 p-5 rounded-2xl hover:border-purple-500/30 transition-colors cursor-pointer group">
                <Target className="w-6 h-6 text-purple-400 mb-3" />
                <h4 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">Idioms for Speaking Part 2</h4>
                <p className="text-xs text-slate-500 mb-4">18 min • Interactive Video</p>
                <div className="text-xs font-semibold text-purple-400 flex items-center">
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
