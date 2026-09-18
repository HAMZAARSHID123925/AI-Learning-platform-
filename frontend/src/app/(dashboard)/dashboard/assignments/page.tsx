"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, CheckCircle2, Clock, AlertCircle, FileText, 
  Upload, Send, Star, ChevronRight, Check, X, Sparkles
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { toast } from '@/components/ToastProvider';

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  subject: string;
  dueDate: string;
  dueStatus: 'today' | 'upcoming' | 'submitted' | 'graded';
  description: string;
  instructions: string[];
  maxScore: number;
  submittedDate?: string;
  score?: number;
  teacherFeedback?: string;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-py-1",
    title: "Python Lab: Build a Simple Temperature Converter",
    courseTitle: "Introduction to Computer Science & Python",
    subject: "Computer Science",
    dueDate: "Tomorrow, 5:00 PM",
    dueStatus: "today",
    description: "Write a short Python function that converts Celsius temperatures to Fahrenheit and prints the result.",
    instructions: [
      "Use the formula: (Celsius * 9/5) + 32",
      "Include user input for temperature",
      "Add comments explaining your logic"
    ],
    maxScore: 100
  },
  {
    id: "asg-math-2",
    title: "Algebra Problem Set: Solving Linear Equations",
    courseTitle: "Mathematics & Problem Solving Masterclass",
    subject: "Mathematics",
    dueDate: "Friday, 11:59 PM",
    dueStatus: "upcoming",
    description: "Complete problems 1 through 8 from Worksheet #3 on two-step linear equations.",
    instructions: [
      "Show all intermediate arithmetic steps",
      "Check your answers by substituting values back into the equation"
    ],
    maxScore: 50
  },
  {
    id: "asg-eng-3",
    title: "Paragraph Writing: Cause & Effect on Climate Change",
    courseTitle: "English Mastery: Grammar & Academic Writing",
    subject: "English & Languages",
    dueDate: "Completed",
    dueStatus: "graded",
    description: "Write a cohesive 150-word paragraph detailing the causes of renewable energy adoption.",
    instructions: [
      "Use at least 3 academic transition words",
      "Ensure proper subject-verb agreement"
    ],
    maxScore: 100,
    submittedDate: "Sep 16, 2026",
    score: 95,
    teacherFeedback: "Outstanding vocabulary and syntactic cohesion! Excellent use of transitional connectors."
  },
  {
    id: "asg-sci-4",
    title: "Science Lab Report: Photosynthesis & Light Absorption",
    courseTitle: "General Science: How the Universe Works",
    subject: "Science",
    dueDate: "Completed",
    dueStatus: "graded",
    description: "Summarize the experiment on plant starch production under natural vs artificial light.",
    instructions: [
      "Identify the independent and dependent variables",
      "Write a 3-sentence conclusion based on your graph"
    ],
    maxScore: 100,
    submittedDate: "Sep 14, 2026",
    score: 88,
    teacherFeedback: "Good explanation of results. Make sure to define the control group more clearly next time."
  }
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(INITIAL_ASSIGNMENTS[0]);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingList = assignments.filter(a => a.dueStatus === 'today' || a.dueStatus === 'upcoming');
  const completedList = assignments.filter(a => a.dueStatus === 'submitted' || a.dueStatus === 'graded');

  const handleSubmitAssignment = () => {
    if (!submissionText.trim()) {
      toast.error("Empty Submission", "Please enter your answer or notes before submitting.");
      return;
    }
    if (!selectedAsg) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setAssignments(prev => prev.map(a => {
        if (a.id === selectedAsg.id) {
          return {
            ...a,
            dueStatus: 'graded' as const,
            submittedDate: "Just now",
            score: 92,
            teacherFeedback: "Great submission! Automatically reviewed by AI Assistant and queued for teacher verification."
          };
        }
        return a;
      }));

      toast.success("Submitted Successfully! 🎉", "Your homework has been submitted and graded.");
      setSubmissionText("");
      setIsSubmitting(false);
      setActiveTab('completed');
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#027FFF] border border-blue-200 flex items-center justify-center shadow-xs">
              <ClipboardList className="w-5 h-5 text-[#027FFF]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                Assignments &amp; Homework
              </h1>
              <p className="text-xs text-slate-500 font-medium">Track your assigned homework, submit tasks, and review grades</p>
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
        <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Due This Week</span>
                <p className="text-2xl font-black text-slate-900">{pendingList.length} Tasks</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Completed &amp; Graded</span>
                <p className="text-2xl font-black text-slate-900">{completedList.length} Tasks</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Average Score</span>
                <p className="text-2xl font-black text-slate-900">91.5%</p>
              </div>
            </div>
          </div>

          {/* Tab Filter (Pending vs Graded) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => {
                setActiveTab('pending');
                setSelectedAsg(pendingList[0] || null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pending'
                  ? "bg-[#027FFF] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Pending Homework</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {pendingList.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('completed');
                setSelectedAsg(completedList[0] || null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'completed'
                  ? "bg-[#027FFF] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Completed &amp; Graded</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {completedList.length}
              </span>
            </button>
          </div>

          {/* Two-Column Grid: List & Detail Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left: Task List */}
            <div className="lg:col-span-1 space-y-3">
              {(activeTab === 'pending' ? pendingList : completedList).map((asg) => {
                const isSelected = selectedAsg?.id === asg.id;
                return (
                  <button
                    key={asg.id}
                    onClick={() => setSelectedAsg(asg)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-blue-50/70 border-[#027FFF] shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {asg.subject}
                      </span>
                      {asg.dueStatus === 'today' ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          Due Today
                        </span>
                      ) : asg.dueStatus === 'upcoming' ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {asg.dueDate}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Score: {asg.score}/{asg.maxScore}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {asg.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {asg.courseTitle}
                    </p>
                  </button>
                );
              })}

              {(activeTab === 'pending' ? pendingList : completedList).length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No tasks in this list</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All assignments are up to date!</p>
                </div>
              )}
            </div>

            {/* Right: Task Details & Submission Panel */}
            {selectedAsg ? (
              <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#027FFF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {selectedAsg.subject}
                    </span>
                    <span className="text-xs text-slate-500">• {selectedAsg.courseTitle}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedAsg.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedAsg.description}
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Instructions &amp; Requirements
                  </h3>
                  <div className="space-y-2">
                    {selectedAsg.instructions.map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If Graded: Show Teacher Feedback */}
                {selectedAsg.dueStatus === 'graded' && (
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Graded by Instructor
                      </span>
                      <span className="text-sm font-black text-emerald-700">
                        Score: {selectedAsg.score} / {selectedAsg.maxScore} ({Math.round(((selectedAsg.score || 0) / selectedAsg.maxScore) * 100)}%)
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      "{selectedAsg.teacherFeedback}"
                    </p>
                  </div>
                )}

                {/* Submission Box (If Pending) */}
                {selectedAsg.dueStatus !== 'graded' && selectedAsg.dueStatus !== 'submitted' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Your Submission &amp; Work
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Type or paste your homework solution, code, or essay here..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#027FFF] transition-colors"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => toast.info("File Upload", "Attach PDF, DOCX or code files (Max 25MB).")}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Attach File
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmitAssignment}
                        className="px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-black text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Homework
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

          </div>

        </div>
      </main>
    </div>
  );
}
