"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, CheckCircle2, Clock, Award, Star, 
  BookOpen, BrainCircuit, BarChart2, Calendar, 
  Flame, Target, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import DashboardSidebar from '@/components/DashboardSidebar';

interface SubjectProgress {
  subject: string;
  icon: string;
  hoursSpent: number;
  completedLessons: number;
  totalLessons: number;
  avgScore: number;
  color: string;
}

const SUBJECT_METRICS: SubjectProgress[] = [
  {
    subject: "Computer Science & Python",
    icon: "💻",
    hoursSpent: 6.5,
    completedLessons: 8,
    totalLessons: 12,
    avgScore: 92,
    color: "#027FFF"
  },
  {
    subject: "English & Communication",
    icon: "📖",
    hoursSpent: 4.8,
    completedLessons: 7,
    totalLessons: 10,
    avgScore: 88,
    color: "#8B5CF6"
  },
  {
    subject: "Mathematics & Problem Solving",
    icon: "📐",
    hoursSpent: 3.2,
    completedLessons: 4,
    totalLessons: 15,
    avgScore: 85,
    color: "#10B981"
  }
];

const WEEKLY_STUDY_DATA = [
  { day: "Mon", hours: 1.5, quizzes: 2 },
  { day: "Tue", hours: 2.0, quizzes: 3 },
  { day: "Wed", hours: 1.0, quizzes: 1 },
  { day: "Thu", hours: 2.5, quizzes: 4 },
  { day: "Fri", hours: 3.0, quizzes: 5 },
  { day: "Sat", hours: 2.5, quizzes: 3 },
  { day: "Sun", hours: 2.0, quizzes: 2 },
];

const RECENT_TEST_RECORDS = [
  {
    id: "rec-1",
    title: "Python Fundamentals & Loops Quiz",
    subject: "Computer Science",
    date: "Today, 3:15 PM",
    score: 95,
    status: "Passed (Grade A)"
  },
  {
    id: "rec-2",
    title: "English Academic Writing Diagnostic",
    subject: "English & Languages",
    date: "Yesterday",
    score: 88,
    status: "Passed (Grade A-)"
  },
  {
    id: "rec-3",
    title: "Algebra & Linear Equations Practice",
    subject: "Mathematics",
    date: "Sep 15, 2026",
    score: 90,
    status: "Passed (Grade A)"
  },
  {
    id: "rec-4",
    title: "General Science: Solar System Test",
    subject: "Science",
    date: "Sep 12, 2026",
    score: 82,
    status: "Passed (Grade B+)"
  }
];

export default function MyProgressPage() {
  const totalHours = SUBJECT_METRICS.reduce((acc, s) => acc + s.hoursSpent, 0).toFixed(1);
  const totalCompletedLessons = SUBJECT_METRICS.reduce((acc, s) => acc + s.completedLessons, 0);
  const totalLessons = SUBJECT_METRICS.reduce((acc, s) => acc + s.totalLessons, 0);
  const overallPercentage = Math.round((totalCompletedLessons / totalLessons) * 100);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#027FFF] border border-blue-200 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 text-[#027FFF]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                My Progress &amp; Analytics
              </h1>
              <p className="text-xs text-slate-500 font-medium">Visual learning summary, study consistency streak, and test history</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Learning Streak</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">5 Days 🔥</p>
              <span className="text-[11px] text-emerald-600 font-bold">Active everyday this week</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Total Study Time</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#027FFF]">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalHours} Hours</p>
              <span className="text-[11px] text-slate-500 font-medium">+2.5 hrs from last week</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Avg. Quiz Score</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Star className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">89.4%</p>
              <span className="text-[11px] text-purple-600 font-bold">Grade A Performance</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Curriculum Done</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{overallPercentage}%</p>
              <span className="text-[11px] text-slate-500 font-medium">{totalCompletedLessons} of {totalLessons} lessons finished</span>
            </div>
          </div>

          {/* Weekly Learning Activity Chart */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900">Weekly Study Consistency</h3>
                <p className="text-xs text-slate-500">Daily hours spent learning across all courses</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-3 h-3 rounded-full bg-[#027FFF]" /> Hours Learned
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_STUDY_DATA}>
                  <defs>
                    <linearGradient id="colorHours" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#027FFF" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#027FFF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#FFFFFF' }}
                    formatter={(value: any) => [`${value} Hours`, 'Study Time']}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#027FFF" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Mastery Progress Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Subject Mastery Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SUBJECT_METRICS.map((sub, idx) => {
                const pct = Math.round((sub.completedLessons / sub.totalLessons) * 100);
                return (
                  <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{sub.icon}</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {sub.avgScore}% Avg Score
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900">{sub.subject}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.hoursSpent} Hours Studied</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-900">{pct}% ({sub.completedLessons}/{sub.totalLessons})</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${pct}%`, backgroundColor: sub.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Test History (Past Results) */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Recent Exam &amp; Quiz Records</h3>
                <p className="text-xs text-slate-500">Official quiz submissions and practice test history</p>
              </div>

              <Link
                href="/dashboard/ai-exam"
                className="text-xs font-bold text-[#027FFF] hover:underline flex items-center gap-1"
              >
                Take New Practice Exam <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {RECENT_TEST_RECORDS.map((rec) => (
                <div key={rec.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {rec.score}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                      <span className="text-[11px] text-slate-400">{rec.subject} • {rec.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {rec.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
