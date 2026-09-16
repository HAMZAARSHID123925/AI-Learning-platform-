"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Headphones, BookOpen, Clock, ArrowLeft, CheckCircle2, 
  Play, Pause, RotateCcw, Volume2, Highlighter, HelpCircle,
  ChevronRight, Award, AlertCircle, Sparkles, RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface ReadingQuestion {
  id: number;
  type: 'tfng' | 'mcq' | 'fill';
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface ListeningQuestion {
  id: number;
  section: number;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export default function MockExamPage() {
  const [examType, setExamType] = useState<'reading' | 'listening'>('reading');
  const [timerSeconds, setTimerSeconds] = useState(3600); // 60 mins for Reading
  const [timerActive, setTimerActive] = useState(true);
  const [highlightActive, setHighlightActive] = useState(false);

  // Dynamic Exam Datasets
  const [readingPassage, setReadingPassage] = useState<{ title: string; paragraphs: { label: string; text: string }[] }>({
    title: "",
    paragraphs: []
  });
  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Audio Player State (Listening)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(32); // percentage

  // User Answers
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scoreReport, setScoreReport] = useState<any>(null);

  // Fetch dynamic mock exam data from API
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/mock-exams');
        if (res.ok) {
          const data = await res.json();
          if (data.readingPassage) setReadingPassage(data.readingPassage);
          if (data.readingQuestions) setReadingQuestions(data.readingQuestions);
          if (data.listeningQuestions) setListeningQuestions(data.listeningQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch mock exam from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0 && !submitted) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, submitted]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSwitchExam = (type: 'reading' | 'listening') => {
    setExamType(type);
    setSubmitted(false);
    setScoreReport(null);
    setTimerSeconds(type === 'reading' ? 3600 : 1800); // 60 mins vs 30 mins
  };

  const handleSelectAnswer = (qId: number, val: string) => {
    if (submitted) return;
    if (examType === 'reading') {
      setReadingAnswers(prev => ({ ...prev, [qId]: val }));
    } else {
      setListeningAnswers(prev => ({ ...prev, [qId]: val }));
    }
  };

  const handleSubmitExam = () => {
    const activeQuestions = examType === 'reading' ? readingQuestions : listeningQuestions;
    const userAnswers = examType === 'reading' ? readingAnswers : listeningAnswers;

    let correctCount = 0;
    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = activeQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    // Official IELTS Band Calculation conversion
    let band = 5.0;
    if (percentage === 100) band = 9.0;
    else if (percentage >= 75) band = 8.0;
    else if (percentage >= 50) band = 7.0;
    else if (percentage >= 25) band = 6.0;

    setScoreReport({
      correctCount,
      total,
      percentage,
      band,
      timeSpentSeconds: (examType === 'reading' ? 3600 : 1800) - timerSeconds
    });

    setSubmitted(true);
    setTimerActive(false);
    toast.success("Mock Exam Evaluated! 🎉", `Achieved Band ${band.toFixed(1)} (${correctCount}/${total} Correct).`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F4F8]">
        
        {/* TOP BAR */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-px h-6 bg-slate-200"></div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {examType === 'reading' ? (
                  <BookOpen className="w-4 h-4 text-[#027FFF]" />
                ) : (
                  <Headphones className="w-4 h-4 text-purple-600" />
                )}
                IELTS 4-Skill Mock Exam Studio
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Cambridge Standard Academic Simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Exam Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex">
              <button
                onClick={() => handleSwitchExam('reading')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  examType === 'reading' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Reading Module (60m)
              </button>
              <button
                onClick={() => handleSwitchExam('listening')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  examType === 'listening' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                Listening Lab (30m)
              </button>
            </div>

            {/* Timer Capsule */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className={`text-xs font-black font-mono ${timerSeconds < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                {formatTime(timerSeconds)}
              </span>
            </div>

            {!submitted && (
              <button
                onClick={handleSubmitExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Submit Exam
              </button>
            )}
          </div>
        </header>

        {/* EXAM CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          {/* SCORE BANNER (IF SUBMITTED) */}
          {submitted && scoreReport && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 mb-8 shadow-md animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Assessment Evaluation Complete</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Official IELTS 9-Band Result for {examType === 'reading' ? 'Academic Reading' : 'Listening Lab'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#027FFF] tracking-wider block">Estimated Band</span>
                    <span className="text-3xl font-black text-[#027FFF]">{scoreReport.band.toFixed(1)}</span>
                  </div>
                  <div className="text-center px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Raw Accuracy</span>
                    <span className="text-3xl font-black text-slate-900">{scoreReport.correctCount}/{scoreReport.total}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-slate-600">
                  Review your answers and evidence justifications highlighted in green/red below.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setScoreReport(null);
                    setReadingAnswers({});
                    setListeningAnswers({});
                    setTimerSeconds(examType === 'reading' ? 3600 : 1800);
                    setTimerActive(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Test
                </button>
              </div>
            </div>
          )}

          {/* MODULE 1: READING PASSAGE SPLIT PANE */}
          {examType === 'reading' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Pane: Reading Passage with Highlighter */}
              <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passage 1 of 3</span>
                  <button
                    onClick={() => {
                      setHighlightActive(p => !p);
                      toast.info(highlightActive ? "Highlighter Off" : "Highlighter Active 🖍️", "Select passage text to mark keywords.");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      highlightActive ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>Highlight Mode</span>
                  </button>
                </div>

                <h2 className="text-xl font-black text-slate-900 mb-6 leading-snug">
                  {readingPassage.title}
                </h2>

                <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-serif">
                  {readingPassage.paragraphs.map((p, i) => (
                    <div key={i} className="space-y-1">
                      <span className="font-sans font-bold text-xs text-[#027FFF] block uppercase tracking-wider">{p.label}</span>
                      <p className={`p-2 rounded-xl transition-colors ${highlightActive ? 'cursor-text hover:bg-amber-50/50' : ''}`}>
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Pane: Reading Questions */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Questions 1–4</h3>
                    <span className="text-xs font-bold text-slate-500">True / False / Not Given &amp; Multiple Choice</span>
                  </div>

                  <div className="space-y-8">
                    {readingQuestions.map((q) => {
                      const userChoice = readingAnswers[q.id];
                      const isCorrect = userChoice === q.correctAnswer;

                      return (
                        <div key={q.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                          <p className="text-sm font-bold text-slate-900 leading-relaxed">
                            <span className="text-[#027FFF] mr-2">Q{q.id}.</span>
                            {q.prompt}
                          </p>

                          {/* Options Radio Pills */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                            {q.options?.map((opt) => {
                              const isSelected = userChoice === opt;

                              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                              if (isSelected) {
                                btnStyle = 'bg-[#027FFF] border-[#027FFF] text-white shadow-md';
                              }
                              if (submitted) {
                                if (opt === q.correctAnswer) {
                                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                                } else if (isSelected && !isCorrect) {
                                  btnStyle = 'bg-red-50 border-red-400 text-red-700 line-through';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleSelectAnswer(q.id, opt)}
                                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* Answer Justification if Submitted */}
                          {submitted && (
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed mt-2 ${isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                              <p className="font-bold mb-0.5">{isCorrect ? '✓ Correct' : `✗ Incorrect (Correct: ${q.correctAnswer})`}</p>
                              <p className="text-slate-600">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* MODULE 2: LISTENING LAB */
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Audio Track Player Card */}
              <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Section 1: University Housing Accommodation Inquiry</h3>
                      <p className="text-xs text-slate-400">British Accent • Dialogue between Student &amp; Housing Officer</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-emerald-400">
                    Audio Quality: 320kbps
                  </span>
                </div>

                {/* Scrubber & Waveform Mock */}
                <div className="space-y-3 pt-2">
                  <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden cursor-pointer">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-[#027FFF] rounded-full" style={{ width: `${audioProgress}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>01:14</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setIsPlayingAudio(p => !p);
                          toast.info(isPlayingAudio ? "Audio Paused" : "Playing Track 🎧", "Listen carefully to the recorded dialogue.");
                        }}
                        className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md"
                      >
                        {isPlayingAudio ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </button>
                    </div>
                    <span>03:45</span>
                  </div>
                </div>
              </div>

              {/* Listening Questions Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Section 1 Questions</h3>
                  <span className="text-xs font-bold text-slate-500">Listen and select the appropriate answer</span>
                </div>

                <div className="space-y-8">
                  {listeningQuestions.map((q) => {
                    const userChoice = listeningAnswers[q.id];
                    const isCorrect = userChoice === q.correctAnswer;

                    return (
                      <div key={q.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          <span className="text-purple-600 mr-2">Q{q.id}.</span>
                          {q.prompt}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {q.options?.map((opt) => {
                            const isSelected = userChoice === opt;

                            let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                            if (isSelected) {
                              btnStyle = 'bg-purple-600 border-purple-600 text-white shadow-md';
                            }
                            if (submitted) {
                              if (opt === q.correctAnswer) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'bg-red-50 border-red-400 text-red-700 line-through';
                              }
                            }

                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelectAnswer(q.id, opt)}
                                className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {submitted && (
                          <div className={`p-3.5 rounded-2xl text-xs leading-relaxed mt-2 ${isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
                            <p className="font-bold mb-0.5">{isCorrect ? '✓ Correct' : `✗ Incorrect (Correct: ${q.correctAnswer})`}</p>
                            <p className="text-slate-600">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
