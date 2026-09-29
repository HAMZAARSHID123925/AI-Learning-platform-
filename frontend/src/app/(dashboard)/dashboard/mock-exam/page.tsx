"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Code2, BrainCircuit, GraduationCap, Atom, Clock, ArrowLeft, CheckCircle2, 
  Play, Pause, RotateCcw, Volume2, Highlighter, HelpCircle,
  ChevronRight, Award, AlertCircle, Sparkles, RefreshCw, Printer,
  BookOpen, Terminal, Check
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface ExamQuestion {
  id: number;
  category: string;
  prompt: string;
  context?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface ExamBattery {
  id: string;
  disciplineId: 'cs' | 'math' | 'english' | 'science';
  title: string;
  discipline: string;
  topic: string;
  badge: string;
  icon: React.ElementType;
  timeLimitMinutes: number;
  color: string;
  questions: ExamQuestion[];
}

const EXAM_BATTERIES: ExamBattery[] = [
  {
    id: 'exam-cs',
    disciplineId: 'cs',
    title: 'CS & Python Algorithmic Assessment',
    discipline: 'Computer Science',
    topic: 'Data Structures, Big-O & Systems',
    badge: 'CS 101 Benchmark',
    icon: Code2,
    timeLimitMinutes: 20,
    color: 'from-blue-600 to-indigo-700',
    questions: [
      {
        id: 1,
        category: 'Algorithmic Complexity',
        prompt: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree?',
        options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
        correctAnswer: 'O(n)',
        explanation: 'In an unbalanced BST, elements can form a degenerate linear chain (linked list), causing worst-case search to degrade to O(n).'
      },
      {
        id: 2,
        category: 'Python 3.12 Syntax',
        prompt: 'What is the output of `[x**2 for x in [1, 2, 3, 4] if x % 2 == 0]`?',
        options: ['[4, 16]', '[1, 9]', '[2, 4]', '[4, 9, 16]'],
        correctAnswer: '[4, 16]',
        explanation: 'The list comprehension filters for even numbers (2 and 4), and squares them to yield [4, 16].'
      },
      {
        id: 3,
        category: 'Memory Architecture',
        prompt: 'Which data structure is fundamentally utilized to manage recursive function call execution frames?',
        options: ['Call Stack (LIFO)', 'FIFO Queue', 'B-Tree Index', 'Circular Buffer'],
        correctAnswer: 'Call Stack (LIFO)',
        explanation: 'Execution frames are pushed and popped from the call stack following Last-In, First-Out (LIFO) order.'
      },
      {
        id: 4,
        category: 'Database Concurrency',
        prompt: 'Which ACID property guarantees that partial transactions are never committed to storage if a system error occurs?',
        options: ['Atomicity', 'Isolation', 'Consistency', 'Durability'],
        correctAnswer: 'Atomicity',
        explanation: 'Atomicity ensures that transactions execute as an indivisible unit: either all operations succeed or all are rolled back.'
      }
    ]
  },
  {
    id: 'exam-math',
    disciplineId: 'math',
    title: 'Calculus, Matrices & Algebra Examination',
    discipline: 'Mathematics',
    topic: 'Differential Calculus & Linear Transformations',
    badge: 'MATH 301 Benchmark',
    icon: BrainCircuit,
    timeLimitMinutes: 20,
    color: 'from-amber-600 to-orange-700',
    questions: [
      {
        id: 1,
        category: 'Differential Calculus',
        prompt: 'Compute the second derivative f\'\'(x) of f(x) = 2x⁴ - 3x² + 5:',
        options: ['f\'\'(x) = 24x² - 6', 'f\'\'(x) = 8x³ - 6x', 'f\'\'(x) = 24x³ - 6x', 'f\'\'(x) = 12x² - 6'],
        correctAnswer: 'f\'\'(x) = 24x² - 6',
        explanation: 'First derivative is f\'(x) = 8x³ - 6x. Differentiating once more yields f\'\'(x) = 24x² - 6.'
      },
      {
        id: 2,
        category: 'Linear Algebra',
        prompt: 'What does a determinant of zero det(A) = 0 indicate about a 2x2 square transformation matrix?',
        options: [
          'The matrix is non-invertible and collapses 2D space into a lower dimension',
          'The transformation rotates the vector space by exactly 90 degrees',
          'The matrix has two identical positive real eigenvalues',
          'The transformation preserves spatial area without scaling'
        ],
        correctAnswer: 'The matrix is non-invertible and collapses 2D space into a lower dimension',
        explanation: 'When det(A) = 0, the linear mapping squashes area to 0, meaning it cannot be inverted (singular matrix).'
      },
      {
        id: 3,
        category: 'Integral Calculus',
        prompt: 'Evaluate the definite integral ∫ from 1 to 3 of (3x²) dx:',
        options: ['26', '27', '24', '18'],
        correctAnswer: '26',
        explanation: 'The antiderivative is x³. Evaluating from 1 to 3 gives 3³ - 1³ = 27 - 1 = 26.'
      },
      {
        id: 4,
        category: 'Polynomial Roots',
        prompt: 'What are the solutions to the equation 2x² - 8 = 0?',
        options: ['x = ±2', 'x = 4', 'x = ±4', 'x = 2'],
        correctAnswer: 'x = ±2',
        explanation: '2x² = 8 ➔ x² = 4 ➔ x = ±2.'
      }
    ]
  },
  {
    id: 'exam-english',
    disciplineId: 'english',
    title: 'Academic Rhetoric & Linguistics Battery',
    discipline: 'Academic English',
    topic: 'Textual Deduction, Syntactic Inversion & C2 Lexicon',
    badge: 'ENG 201 Benchmark',
    icon: GraduationCap,
    timeLimitMinutes: 20,
    color: 'from-emerald-600 to-teal-700',
    questions: [
      {
        id: 1,
        category: 'Reading Deduction',
        prompt: 'Identify the correct deduction from the passage:',
        context: 'While 20th-century hypotheses attributed the invention of writing solely to Mesopotamia, recent radiocarbon dating at Abydos proves Egyptian hieroglyphs emerged independently around 3200 BCE.',
        options: [
          'TRUE: Egyptian hieroglyphs developed without Mesopotamian introduction',
          'FALSE: Mesopotamian merchants brought writing into Egypt',
          'NOT GIVEN: Mesopotamian writing ceased after 3200 BCE'
        ],
        correctAnswer: 'TRUE: Egyptian hieroglyphs developed without Mesopotamian introduction',
        explanation: 'The text affirms Egyptian hieroglyphs emerged independently, confirming they were not imported from Mesopotamia.'
      },
      {
        id: 2,
        category: 'Syntactic Inversion',
        prompt: 'Select the grammatically impeccable inversion sentence:',
        options: [
          'Rarely have researchers witnessed such dramatic neuroplastic adaptation.',
          'Rarely researchers have witnessed such dramatic neuroplastic adaptation.',
          'Rarely did researchers witnessed such dramatic neuroplastic adaptation.',
          'Rarely had researchers witness such dramatic neuroplastic adaptation.'
        ],
        correctAnswer: 'Rarely have researchers witnessed such dramatic neuroplastic adaptation.',
        explanation: 'Negative adverbial \'Rarely\' triggers subject-auxiliary inversion with past participle \'witnessed\'.'
      },
      {
        id: 3,
        category: 'Academic Collocation',
        prompt: 'Choose the most scholarly phrase to replace "has a big bad effect on":',
        options: [
          'exerts a severely detrimental influence upon',
          'creates huge problems against',
          'brings a lot of hard damages to',
          'makes a critical bad trouble for'
        ],
        correctAnswer: 'exerts a severely detrimental influence upon',
        explanation: '\'Exerts a severely detrimental influence upon\' represents advanced C2 academic collocation register.'
      },
      {
        id: 4,
        category: 'Discourse Cohesion',
        prompt: 'Which cohesive connector best introduces empirical contrast?',
        options: ['Notwithstanding this assertion', 'For that reason', 'As a consequence', 'In addition to this'],
        correctAnswer: 'Notwithstanding this assertion',
        explanation: '\'Notwithstanding this assertion\' establishes formal concessions before counter-argumentation.'
      }
    ]
  },
  {
    id: 'exam-science',
    disciplineId: 'science',
    title: 'Applied Physics & Orbital Mechanics Test',
    discipline: 'Physical Sciences',
    topic: 'Newtonian Dynamics, Thermodynamics & Waves',
    badge: 'SCI 401 Benchmark',
    icon: Atom,
    timeLimitMinutes: 20,
    color: 'from-purple-600 to-pink-700',
    questions: [
      {
        id: 1,
        category: 'Newtonian Dynamics',
        prompt: 'If net force F applied to an object of constant mass m is doubled, what occurs to acceleration a?',
        options: [
          'Acceleration doubles (a\' = 2a)',
          'Acceleration is halved (a\' = a/2)',
          'Acceleration quadruples (a\' = 4a)',
          'Acceleration remains constant'
        ],
        correctAnswer: 'Acceleration doubles (a\' = 2a)',
        explanation: 'By F = ma, a = F/m. Doubling force directly doubles acceleration.'
      },
      {
        id: 2,
        category: 'Astrophysics & Gravity',
        prompt: 'According to Newton\'s Law of Universal Gravitation, how does force scale if distance between masses is doubled?',
        options: [
          'It decreases to 1/4 of its initial value',
          'It decreases to 1/2 of its initial value',
          'It doubles',
          'It decreases to 1/8 of its initial value'
        ],
        correctAnswer: 'It decreases to 1/4 of its initial value',
        explanation: 'Gravitational force obeys the inverse-square law F ∝ 1/r². Doubling r reduces force by 1/2² = 1/4.'
      },
      {
        id: 3,
        category: 'Thermodynamics',
        prompt: 'What fundamental principle states that entropy in an isolated system never spontaneously decreases?',
        options: [
          'Second Law of Thermodynamics',
          'First Law of Thermodynamics',
          'Third Law of Thermodynamics',
          'Zeroth Law of Thermodynamics'
        ],
        correctAnswer: 'Second Law of Thermodynamics',
        explanation: 'The Second Law states that the total entropy of an isolated system always increases over time (ΔS ≥ 0).'
      },
      {
        id: 4,
        category: 'Wave Mechanics',
        prompt: 'What wave phenomenon causes the frequency of sound to appear higher as a siren approaches?',
        options: ['Doppler Effect', 'Refraction', 'Diffraction', 'Polarization'],
        correctAnswer: 'Doppler Effect',
        explanation: 'The Doppler Effect compresses incoming wavefronts, elevating perceived pitch/frequency as the source approaches.'
      }
    ]
  }
];

export default function MockExamPage() {
  const [selectedBatteryId, setSelectedBatteryId] = useState<string>('exam-cs');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1200); // 20 mins
  const [timerActive, setTimerActive] = useState(true);

  const activeBattery = EXAM_BATTERIES.find(b => b.id === selectedBatteryId) || EXAM_BATTERIES[0];
  const questions = activeBattery.questions;

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

  const handleSelectBattery = (id: string) => {
    setSelectedBatteryId(id);
    const chosen = EXAM_BATTERIES.find(b => b.id === id) || EXAM_BATTERIES[0];
    setUserAnswers({});
    setSubmitted(false);
    setTimerSeconds(chosen.timeLimitMinutes * 60);
    setTimerActive(true);
    toast.success(`Loaded ${chosen.title}`, "Timed multi-subject examination ready.");
  };

  const handleSelectAnswer = (qId: number, val: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = () => {
    setSubmitted(true);
    setTimerActive(false);

    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) correctCount++;
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    toast.success("Examination Submitted! 🎯", `Final Score: ${scorePct}% (${correctCount}/${questions.length} Correct)`);
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setSubmitted(false);
    setTimerSeconds(activeBattery.timeLimitMinutes * 60);
    setTimerActive(true);
  };

  // Score Calculation
  let correctCount = 0;
  questions.forEach(q => {
    if (userAnswers[q.id] === q.correctAnswer) correctCount++;
  });
  const scorePct = Math.round((correctCount / questions.length) * 100);
  const letterGrade = scorePct >= 90 ? 'A+' : scorePct >= 75 ? 'A' : scorePct >= 50 ? 'B' : 'C';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F0F4F8]">
        
        {/* TOP BANNER */}
        <div className="bg-[#0F172A] text-white px-6 lg:px-10 py-8 border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <Link href="/dashboard" className="hover:text-white flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-[#5BC0EB]">Academy Examination Hub</span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Award className="w-7 h-7 text-[#027FFF]" />
                Universal Multi-Discipline Mock Examinations
              </h1>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Timed institutional examination batteries across Computer Science, Mathematics, Linguistics, and Physical Sciences.
              </p>
            </div>

            {/* Timer Strip */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <Clock className={`w-5 h-5 ${timerSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
              <div>
                <span className="text-[10px] uppercase font-bold text-white/70 block">Time Remaining</span>
                <span className="text-xl font-mono font-black text-white">{formatTime(timerSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN STAGE */}
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 space-y-8">
          
          {/* 1. DISCIPLINE SELECTOR CARDS */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
              Select Examination Discipline:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXAM_BATTERIES.map((battery) => {
                const IconComp = battery.icon;
                const isSelected = selectedBatteryId === battery.id;
                return (
                  <button
                    key={battery.id}
                    onClick={() => handleSelectBattery(battery.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#027FFF] shadow-md ring-2 ring-[#027FFF]/30'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#027FFF] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {battery.timeLimitMinutes}m
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {battery.discipline}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {battery.topic}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400">{battery.questions.length} Questions</span>
                      <span className={isSelected ? 'text-[#027FFF]' : 'text-slate-600'}>
                        {isSelected ? 'Active' : 'Switch'} →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. QUESTION STAGE & RESULTS */}
          {!submitted ? (
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#027FFF] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {activeBattery.badge}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {activeBattery.title}
                  </h2>
                </div>

                <span className="text-xs font-bold text-slate-500">
                  {Object.keys(userAnswers).length} of {questions.length} Answered
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-[#027FFF] tracking-wider">
                        Question {idx + 1} • {q.category}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {q.prompt}
                    </p>

                    {q.context && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic font-serif">
                        &ldquo;{q.context}&rdquo;
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isChosen = userAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                              isChosen
                                ? 'bg-blue-50 border-[#027FFF] text-[#027FFF] ring-1 ring-[#027FFF]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && <CheckCircle2 className="w-4 h-4 text-[#027FFF] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleResetExam}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Answers
                </button>

                <button
                  onClick={handleSubmitExam}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-8 py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Submit &amp; Grade Examination</span>
                  <Award className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* SCORECARD */
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-xl space-y-8 animate-in zoom-in-95 duration-300">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#027FFF] flex items-center justify-center border border-blue-200 shrink-0">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {activeBattery.discipline} Official Scorecard
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">{activeBattery.title}</h2>
                    <p className="text-xs text-slate-500">Completed in under {activeBattery.timeLimitMinutes} minutes.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => typeof window !== 'undefined' && window.print()}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Print Scorecard"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>

                  <div className="text-center px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#027FFF] tracking-wider block">Grade</span>
                    <span className="text-3xl font-black text-[#027FFF]">{letterGrade}</span>
                  </div>
                  <div className="text-center px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Score</span>
                    <span className="text-3xl font-black text-slate-900">{scorePct}%</span>
                  </div>
                </div>
              </div>

              {/* Granular Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Detailed Answer Telemetry &amp; Solutions</h3>
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const ans = userAnswers[q.id];
                    const isCorrect = ans === q.correctAnswer;
                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Q{idx + 1}: {q.prompt}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? 'Correct (+1.0)' : 'Incorrect (0.0)'}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          <strong>Your Answer:</strong> {ans || 'Unanswered'} {isCorrect ? '✓' : `(Correct: ${q.correctAnswer})`}
                        </p>
                        <p className="text-slate-500 italic">
                          💡 {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleResetExam}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Examination
                </button>

                <Link
                  href="/dashboard"
                  className="px-8 py-3 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 transition-all flex items-center gap-2"
                >
                  <span>Return to Dashboard &rarr;</span>
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
