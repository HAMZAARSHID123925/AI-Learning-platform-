"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, BookOpen, BrainCircuit, CheckCircle2, XCircle, 
  RefreshCw, Award, ArrowRight, Play, Check, AlertCircle, HelpCircle,
  Clock, BarChart2, Star, Zap, Target, ArrowLeft
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Question {
  id: number;
  topicTag: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface CourseExamBank {
  courseTitle: string;
  subject: string;
  diagnosticQuestions: Question[];
  weakAreaPool: Record<string, Question[]>;
}

const COURSE_EXAM_BANKS: Record<string, CourseExamBank> = {
  "cs-101": {
    courseTitle: "Introduction to Computer Science & Python",
    subject: "Computer Science",
    diagnosticQuestions: [
      {
        id: 1,
        topicTag: "Variables & Data Types",
        question: "Which of the following is used to store multiple items in a single variable in Python?",
        options: ["List", "String", "Integer", "Function"],
        correctAnswer: 0,
        explanation: "Lists are used to store multiple ordered items in Python (e.g. `items = [1, 2, 3]`)."
      },
      {
        id: 2,
        topicTag: "Loops & Iteration",
        question: "How many times will `for i in range(3):` execute its code block?",
        options: ["2 times", "3 times", "4 times", "Infinite times"],
        correctAnswer: 1,
        explanation: "`range(3)` produces the sequence [0, 1, 2], which iterates exactly 3 times."
      },
      {
        id: 3,
        topicTag: "Functions & Scope",
        question: "What keyword is used to define a reusable function in Python?",
        options: ["func", "function", "def", "lambda"],
        correctAnswer: 2,
        explanation: "In Python, functions are defined using the `def` keyword (e.g. `def my_func():`)."
      },
      {
        id: 4,
        topicTag: "Conditionals & Logic",
        question: "What will `5 > 3 and 2 > 10` evaluate to in Python?",
        options: ["True", "False", "None", "SyntaxError"],
        correctAnswer: 1,
        explanation: "The `and` operator requires both sides to be True. Since `2 > 10` is False, the expression is False."
      },
      {
        id: 5,
        topicTag: "Data Structures",
        question: "Which Python data structure stores data as key-value pairs?",
        options: ["List", "Tuple", "Dictionary", "Set"],
        correctAnswer: 2,
        explanation: "Dictionaries (e.g. `{'name': 'Alex', 'age': 25}`) store data in key-value pairs."
      }
    ],
    weakAreaPool: {
      "Loops & Iteration": [
        {
          id: 101,
          topicTag: "Loops & Iteration",
          question: "What statement is used to immediately exit a running loop in Python?",
          options: ["continue", "break", "pass", "stop"],
          correctAnswer: 1,
          explanation: "`break` immediately terminates the innermost loop execution."
        },
        {
          id: 102,
          topicTag: "Loops & Iteration",
          question: "What will `while False:` do when executed?",
          options: ["Run forever", "Run once", "Never execute the loop body", "Throw an error"],
          correctAnswer: 2,
          explanation: "Since the condition is False from the start, the loop body is skipped entirely."
        }
      ],
      "Functions & Scope": [
        {
          id: 201,
          topicTag: "Functions & Scope",
          question: "What keyword is used inside a function to return a value back to the caller?",
          options: ["give", "send", "return", "output"],
          correctAnswer: 2,
          explanation: "The `return` statement ends function execution and passes the result back."
        }
      ],
      "Conditionals & Logic": [
        {
          id: 301,
          topicTag: "Conditionals & Logic",
          question: "Which keyword is used in Python for 'else if' conditional branches?",
          options: ["elseif", "elif", "else if", "when"],
          correctAnswer: 1,
          explanation: "`elif` is the Python syntax for chaining conditional tests."
        }
      ]
    }
  },
  "eng-201": {
    courseTitle: "Everyday English & Vocabulary Builder",
    subject: "English & Languages",
    diagnosticQuestions: [
      {
        id: 1,
        topicTag: "Subject-Verb Agreement",
        question: "Choose the sentence with correct subject-verb agreement:",
        options: [
          "Every student in the class have submitted their assignment.",
          "Every student in the class has submitted their assignment.",
          "Every students in the class was submitted.",
          "Every student are ready."
        ],
        correctAnswer: 1,
        explanation: "'Every student' is a singular subject and takes the singular verb 'has'."
      },
      {
        id: 2,
        topicTag: "Tenses & Conditionals",
        question: "Identify the correct conditional: 'If it rains tomorrow, we _______ indoors.'",
        options: ["will stay", "would stayed", "stayed", "had stayed"],
        correctAnswer: 0,
        explanation: "First Conditional uses [If + Present Simple, will + base verb] for future possibilities."
      },
      {
        id: 3,
        topicTag: "Vocabulary Precision",
        question: "Which word means 'showing great care and attention to detail'?",
        options: ["Meticulous", "Careless", "Ambiguous", "Hasty"],
        correctAnswer: 0,
        explanation: "'Meticulous' means very careful, precise, and attentive to every detail."
      },
      {
        id: 4,
        topicTag: "Passive Voice",
        question: "Which of the following is written in the passive voice?",
        options: [
          "The chef prepared the dinner.",
          "The dinner was prepared by the chef.",
          "The chef is preparing dinner.",
          "The chef will prepare dinner."
        ],
        correctAnswer: 1,
        explanation: "'The dinner was prepared by the chef' makes the receiver of the action the subject."
      },
      {
        id: 5,
        topicTag: "Paragraph Structure",
        question: "What is the primary role of a topic sentence in a paragraph?",
        options: [
          "To summarize the entire book",
          "To introduce the main idea of that specific paragraph",
          "To list definitions",
          "To end the essay"
        ],
        correctAnswer: 1,
        explanation: "A topic sentence introduces the controlling idea and purpose of the paragraph."
      }
    ],
    weakAreaPool: {
      "Subject-Verb Agreement": [
        {
          id: 401,
          topicTag: "Subject-Verb Agreement",
          question: "Neither the teacher nor the students _______ in the hall.",
          options: ["was", "were", "is", "has been"],
          correctAnswer: 1,
          explanation: "With 'neither... nor', the verb agrees with the subject closest to it ('students' &rarr; 'were')."
        }
      ],
      "Tenses & Conditionals": [
        {
          id: 501,
          topicTag: "Tenses & Conditionals",
          question: "If I _______ you, I would study for the test.",
          options: ["was", "were", "am", "have been"],
          correctAnswer: 1,
          explanation: "Second Conditional uses the subjunctive 'were' for hypothetical advice (If I were you)."
        }
      ]
    }
  },
  "math-301": {
    courseTitle: "Algebra & Problem Solving Masterclass",
    subject: "Mathematics",
    diagnosticQuestions: [
      {
        id: 1,
        topicTag: "Linear Equations",
        question: "Solve for x: 3x + 15 = 45",
        options: ["x = 5", "x = 10", "x = 15", "x = 20"],
        correctAnswer: 1,
        explanation: "Subtract 15: 3x = 30. Divide by 3: x = 10."
      },
      {
        id: 2,
        topicTag: "Percentages & Fractions",
        question: "What is 25% of 240?",
        options: ["50", "60", "70", "80"],
        correctAnswer: 1,
        explanation: "25% is 1/4th. 240 / 4 = 60."
      },
      {
        id: 3,
        topicTag: "Geometry & Angles",
        question: "What is the sum of interior angles in any triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: 1,
        explanation: "The interior angles of any planar triangle always sum to 180°."
      },
      {
        id: 4,
        topicTag: "Algebraic Simplification",
        question: "Simplify: 4(2x - 3) + 5",
        options: ["8x - 7", "8x - 12", "8x + 5", "6x - 7"],
        correctAnswer: 0,
        explanation: "Distribute 4: 8x - 12 + 5 = 8x - 7."
      },
      {
        id: 5,
        topicTag: "Square Roots & Exponents",
        question: "What is the square root of 144?",
        options: ["11", "12", "13", "14"],
        correctAnswer: 1,
        explanation: "12 * 12 = 144."
      }
    ],
    weakAreaPool: {
      "Linear Equations": [
        {
          id: 601,
          topicTag: "Linear Equations",
          question: "Solve for y: 2y - 8 = 14",
          options: ["y = 11", "y = 9", "y = 8", "y = 6"],
          correctAnswer: 0,
          explanation: "Add 8: 2y = 22. Divide by 2: y = 11."
        }
      ],
      "Percentages & Fractions": [
        {
          id: 701,
          topicTag: "Percentages & Fractions",
          question: "Convert 3/5 to a percentage:",
          options: ["30%", "50%", "60%", "75%"],
          correctAnswer: 2,
          explanation: "3/5 = 0.60 = 60%."
        }
      ]
    }
  }
};

export default function AIExamGeneratorPage() {
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get('courseId') || "cs-101";
  const modeParam = searchParams.get('mode') || "standard"; // 'diagnostic' | 'weak_points' | 'standard'

  const activeCourseBank = COURSE_EXAM_BANKS[courseIdParam] || COURSE_EXAM_BANKS["cs-101"];
  const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam);
  const [examMode, setExamMode] = useState<'diagnostic' | 'weak_points' | 'standard'>(
    modeParam === 'weak_points' ? 'weak_points' : modeParam === 'diagnostic' ? 'diagnostic' : 'standard'
  );

  // Stored weak points for current course
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [pastScores, setPastScores] = useState<number[]>([]);

  // Exam Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Load course weak points from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(`course_ai_history_${selectedCourseId}`);
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          setWeakTopics(parsed.weakTopics || []);
          setPastScores(parsed.scores || []);
        }
      } catch {
        // ignore
      }
    }
  }, [selectedCourseId]);

  // Auto-trigger if coming with mode=diagnostic or mode=weak_points
  useEffect(() => {
    if (modeParam === 'diagnostic' || modeParam === 'weak_points') {
      handleGenerateExam(modeParam);
    }
  }, []);

  const handleGenerateExam = (customMode?: 'diagnostic' | 'weak_points' | 'standard') => {
    const targetMode = customMode || examMode;
    setIsGenerating(true);

    setTimeout(() => {
      let pool: Question[] = [];
      const bank = COURSE_EXAM_BANKS[selectedCourseId] || COURSE_EXAM_BANKS["cs-101"];

      if (targetMode === 'weak_points' && weakTopics.length > 0) {
        // Build quiz targeting detected weak spots
        weakTopics.forEach(topic => {
          if (bank.weakAreaPool[topic]) {
            pool.push(...bank.weakAreaPool[topic]);
          }
        });
        if (pool.length === 0) {
          pool = bank.diagnosticQuestions;
        }
      } else {
        // Standard or initial diagnostic test
        pool = bank.diagnosticQuestions;
      }

      setQuestions(pool);
      setSelectedAnswers({});
      setCurrentQIndex(0);
      setExamActive(true);
      setSubmitted(false);
      setIsGenerating(false);
    }, 600);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQIndex]: optionIndex
    }));
  };

  const handleSubmitExam = () => {
    setSubmitted(true);

    // Analyze weak points
    const detectedWeak: string[] = [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      } else {
        if (!detectedWeak.includes(q.topicTag)) {
          detectedWeak.push(q.topicTag);
        }
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const updatedWeak = detectedWeak.length > 0 ? detectedWeak : [];

    setWeakTopics(updatedWeak);
    setPastScores(prev => [scorePct, ...prev]);

    // Save in localStorage for course adaptive loop
    if (typeof window !== 'undefined') {
      localStorage.setItem(`course_ai_history_${selectedCourseId}`, JSON.stringify({
        courseId: selectedCourseId,
        lastScore: scorePct,
        weakTopics: updatedWeak,
        scores: [scorePct, ...pastScores],
        lastAttemptDate: new Date().toLocaleDateString()
      }));
    }
  };

  const currentQ = questions[currentQIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score += 1;
    });
    return score;
  };

  const finalScore = submitted ? calculateScore() : 0;
  const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                Course AI Diagnostic &amp; Mastery Engine
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Auto-generated course tests &amp; smart weak-spot targeted retakes
              </p>
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
        <div className="max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          
          {!examActive ? (
            /* CONFIGURATION & GENERATION SCREEN */
            <div className="space-y-8">
              
              {/* Mode Hero */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-[#027FFF] text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-2xl space-y-3 relative z-10">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-100 bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-300" /> Adaptive Mastery Loop
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Course-Specific AI Test Generator
                  </h2>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Attempt your course placement test, find your knowledge gaps, and let the AI generate targeted drills that focus exactly on your weak points.
                  </p>
                </div>
              </div>

              {/* Course Selection & Weak Spot Status */}
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                
                {/* 1. Pick Enrolled Course */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    1. Select Enrolled Course
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(COURSE_EXAM_BANKS).map(([cId, data]) => {
                      const isSel = selectedCourseId === cId;
                      return (
                        <button
                          key={cId}
                          type="button"
                          onClick={() => setSelectedCourseId(cId)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSel 
                              ? "bg-blue-50 border-[#027FFF] text-[#027FFF] shadow-xs" 
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                            {data.subject}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                            {data.courseTitle}
                          </h4>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Detected Weak Points Badge Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-rose-500" /> AI Diagnostic Telemetry for this Course:
                    </span>
                    {pastScores.length > 0 && (
                      <span className="text-xs font-bold text-[#027FFF]">
                        Last Score: {pastScores[0]}%
                      </span>
                    )}
                  </div>

                  {weakTopics.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">
                        The AI detected weaknesses in the following syllabus topics:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.map(topic => (
                          <span key={topic} className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      No weak points recorded yet. Take the diagnostic test below to calibrate!
                    </div>
                  )}
                </div>

                {/* 3. Action Buttons: Diagnostic vs Targeted Retake */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExamMode('diagnostic');
                      handleGenerateExam('diagnostic');
                    }}
                    disabled={isGenerating}
                    className="py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Take Full Course Diagnostic Test
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExamMode('weak_points');
                      handleGenerateExam('weak_points');
                    }}
                    disabled={isGenerating || weakTopics.length === 0}
                    className={`py-4 px-6 rounded-2xl font-black text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      weakTopics.length > 0
                        ? "bg-[#027FFF] hover:bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Target Weak Points &amp; Retake ({weakTopics.length})
                  </button>
                </div>

              </div>
            </div>
          ) : (
            /* LIVE TEST & ANALYSIS SCREEN */
            <div className="space-y-6">
              
              {/* Header Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between flex-wrap gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#027FFF] font-bold text-xs">
                    {activeCourseBank.courseTitle}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Mode: <strong className="text-slate-900 capitalize">{examMode === 'weak_points' ? '🎯 Weak Points Targeted' : '📘 Diagnostic'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-600 font-bold">
                    Answered: <span className="text-[#027FFF]">{answeredCount}</span> / {totalQuestions}
                  </div>
                  {!submitted && (
                    <button
                      onClick={() => setExamActive(false)}
                      className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Exit Test
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted Analysis & Results */}
              {submitted && (
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-emerald-300 shadow-md space-y-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Assessment Complete!</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Results stored in student profile. AI has mapped your strong and weak areas.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Score</span>
                      <span className="text-2xl font-black text-slate-900">{finalScore} / {totalQuestions}</span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Mastery</span>
                      <span className={`text-2xl font-black ${percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                      <span className="text-xs text-slate-400 block uppercase font-bold">Weak Areas</span>
                      <span className="text-2xl font-black text-rose-600">
                        {weakTopics.length}
                      </span>
                    </div>
                  </div>

                  {/* Weak Topics Callout */}
                  {weakTopics.length > 0 ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left max-w-xl mx-auto space-y-2">
                      <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" /> Need Revision in:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {weakTopics.map(t => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 text-xs font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-rose-700 pt-1">
                        👉 Click <strong>"Retest My Weak Points"</strong> to generate questions specifically targeting these gaps!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold max-w-xl mx-auto">
                      🎉 Outstanding! 100% Mastery achieved across all course topics!
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    {weakTopics.length > 0 && (
                      <button
                        onClick={() => {
                          setExamMode('weak_points');
                          handleGenerateExam('weak_points');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Target className="w-4 h-4 text-amber-300" /> Retest My Weak Points Now
                      </button>
                    )}
                    <button
                      onClick={() => setExamActive(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Return to Course Menu
                    </button>
                  </div>
                </div>
              )}

              {/* Question Navigation Numbers */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {questions.map((q, idx) => {
                  const isCurrent = currentQIndex === idx;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isCorrect = submitted && selectedAnswers[idx] === q.correctAnswer;
                  const isWrong = submitted && selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correctAnswer;

                  let badgeClass = "bg-white border-slate-200 text-slate-600 hover:bg-slate-100";
                  if (isCurrent) badgeClass = "bg-[#027FFF] border-[#027FFF] text-white shadow-xs";
                  else if (isCorrect) badgeClass = "bg-emerald-100 border-emerald-300 text-emerald-800";
                  else if (isWrong) badgeClass = "bg-rose-100 border-rose-300 text-rose-800";
                  else if (isAnswered) badgeClass = "bg-blue-50 border-blue-200 text-[#027FFF]";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-10 h-10 rounded-xl font-black text-xs border flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${badgeClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Card */}
              {currentQ && (
                <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#027FFF] uppercase tracking-widest flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Topic: {currentQ.topicTag}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      Question {currentQIndex + 1} of {totalQuestions}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQIndex] === optIdx;
                      const isCorrect = currentQ.correctAnswer === optIdx;
                      
                      let optClass = "bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100";
                      if (submitted) {
                        if (isCorrect) {
                          optClass = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                        } else if (isSelected && !isCorrect) {
                          optClass = "bg-rose-50 border-rose-400 text-rose-900";
                        }
                      } else if (isSelected) {
                        optClass = "bg-blue-50 border-[#027FFF] text-[#027FFF] font-bold shadow-xs";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm">{opt}</span>
                          </div>
                          {submitted && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          )}
                          {submitted && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Shown when submitted) */}
                  {submitted && (
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs space-y-1">
                      <span className="font-extrabold flex items-center gap-1.5 text-indigo-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Explanation:
                      </span>
                      <p className="leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex(prev => prev - 1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQIndex < totalQuestions - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQIndex(prev => prev + 1)}
                          className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Next Question
                        </button>
                      ) : !submitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitExam}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer"
                        >
                          Submit &amp; Analyze Results
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
