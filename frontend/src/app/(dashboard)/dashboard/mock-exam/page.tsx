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

interface ReadingPassage {
  id: string;
  title: string;
  topic: string;
  paragraphs: { label: string; text: string }[];
  questions: ReadingQuestion[];
}

const EXAM_BATTERY_CATALOG: ReadingPassage[] = [
  {
    id: 'test-1',
    title: 'The Emergence of Early Writing Systems and Cognitive Expansion',
    topic: 'Archaeology & Cognitive History',
    paragraphs: [
      {
        label: "Paragraph A",
        text: "The transition of human societies from oral traditions to documented inscription represents one of the most profound leaps in cognitive archaeology. While symbolic cave paintings date back over 40,000 years, true proto-cuneiform systems materialized in ancient Mesopotamia around 3400 BCE. These early clay tokens and pictographs were primarily administrative tools, engineered not for poetic expression, but for quantifying agricultural surplus, grain distribution, and livestock inventories."
      },
      {
        label: "Paragraph B",
        text: "As economic trade expanded across the Fertile Crescent, the inherent limitations of pictographic tokens became insurmountable. Scribes required a medium capable of conveying abstract linguistic nuance and grammatical tense. The critical innovation occurred when pictographs transformed into phonograms—symbols representing speech sounds rather than tangible physical objects. This phonetization drastically reduced the total symbol inventory needed to transcribe spoken language."
      },
      {
        label: "Paragraph C",
        text: "Simultaneously in the Nile River Valley, Egyptian hieroglyphic script evolved alongside monumental architecture. Contrary to earlier twentieth-century academic hypotheses suggesting Mesopotamian origin, contemporary radiocarbon dating of tomb inscriptions at Abydos confirms that Egyptian hieroglyphs developed independently as early as 3200 BCE, driven largely by sacred royal rituals and ceremonial cosmology."
      }
    ],
    questions: [
      {
        id: 1,
        type: 'tfng',
        prompt: "The earliest Mesopotamian proto-cuneiform scripts were initially conceived to record religious and poetic literature.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph A explicitly states early proto-cuneiform was engineered for administrative purposes (agricultural surplus, grain, livestock), not poetic expression."
      },
      {
        id: 2,
        type: 'tfng',
        prompt: "The shift to phonograms allowed scribes to convey abstract concepts with fewer individual symbols.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "TRUE",
        explanation: "Paragraph B confirms that phonetization enabled abstract linguistic nuance and drastically reduced the total symbol inventory."
      },
      {
        id: 3,
        type: 'tfng',
        prompt: "Egyptian hieroglyphic writing was originally introduced into Egypt by Mesopotamian merchants.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph C notes that radiocarbon dating at Abydos confirms Egyptian hieroglyphs developed independently, contrary to earlier theories of Mesopotamian origin."
      },
      {
        id: 4,
        type: 'mcq',
        prompt: "According to Paragraph A, what was the primary catalyst for early token inscription?",
        options: [
          "Religious cosmology and funeral rituals",
          "Quantification and logistics of economic surplus",
          "Inter-regional military communication",
          "Documenting genealogical ancestry"
        ],
        correctAnswer: "Quantification and logistics of economic surplus",
        explanation: "Paragraph A states tokens were administrative tools for quantifying agricultural surplus and inventories."
      }
    ]
  },
  {
    id: 'test-2',
    title: 'Smart Grids and the Global Renewable Energy Transition',
    topic: 'Sustainable Engineering & Climate Logistics',
    paragraphs: [
      {
        label: "Paragraph A",
        text: "The integration of intermittent renewable energy sources, specifically photovoltaic arrays and offshore wind turbines, presents a fundamental challenge to twentieth-century centralized power architectures. Traditional grids operate on deterministic dispatch principles where supply continuously mirrors anticipated demand. In contrast, variable generation requires bidirectional decentralized monitoring networks capable of sub-second load balancing."
      },
      {
        label: "Paragraph B",
        text: "Automated smart grid telemetry incorporates machine learning algorithms to forecast weather variations and regulate localized battery energy storage systems (BESS). By buffering surplus solar generation during peak diurnal cycles and redistributing stored megawatts during evening demand surges, smart networks curtail transmission losses by up to eighteen percent."
      },
      {
        label: "Paragraph C",
        text: "Nevertheless, infrastructural retrofitting remains constrained by capital expenditure hurdles across developing nations. While OECD countries have committed substantial fiscal subsidies toward high-voltage direct current (HVDC) interconnectors, developing economies continue to rely on legacy coal-fired baseload facilities to prevent catastrophic blackouts."
      }
    ],
    questions: [
      {
        id: 1,
        type: 'tfng',
        prompt: "Traditional centralized power grids were designed around deterministic electricity supply forecasting.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "TRUE",
        explanation: "Paragraph A explicitly affirms traditional grids operate on deterministic dispatch principles matching supply to anticipated demand."
      },
      {
        id: 2,
        type: 'tfng',
        prompt: "Smart grids completely eliminate the necessity for energy storage infrastructure.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph B states smart grid telemetry actively regulates Battery Energy Storage Systems (BESS) to buffer surplus power."
      },
      {
        id: 3,
        type: 'tfng',
        prompt: "All developing nations have already phased out coal baseload facilities in favor of HVDC interconnectors.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph C clarifies that developing nations continue relying on coal facilities due to heavy capital expenditure hurdles."
      },
      {
        id: 4,
        type: 'mcq',
        prompt: "What is the recorded reduction in transmission losses achieved by smart storage redistribution?",
        options: [
          "Up to eighteen percent",
          "Exactly forty percent",
          "Between five and eight percent",
          "Over fifty percent"
        ],
        correctAnswer: "Up to eighteen percent",
        explanation: "Paragraph B specifically documents that smart networks curtail transmission losses by up to eighteen percent."
      }
    ]
  },
  {
    id: 'test-3',
    title: 'Linguistic Relativity and Executive Cognitive Neuroplasticity',
    topic: 'Neuroscience & Applied Linguistics',
    paragraphs: [
      {
        label: "Paragraph A",
        text: "The Sapir-Whorf hypothesis, which posits that language structure fundamentally sculpts human perceptual cognition, has undergone profound empirical re-evaluation in cognitive neuroscience. Early deterministic models suggesting humans cannot conceptualize ideas absent from their native lexicon have been discarded in favor of nuanced linguistic relativity paradigms."
      },
      {
        label: "Paragraph B",
        text: "Functional Magnetic Resonance Imaging (fMRI) studies demonstrate that lifelong bilingual individuals exhibit heightened gray-matter density in the dorsolateral prefrontal cortex. Navigating dual syntactic systems requires continuous inhibitory control, suppressing intrusive grammatical forms from the non-target language. This neurocognitive exercise fortifies executive attention and delays clinical dementia onset by an average of 4.5 years."
      },
      {
        label: "Paragraph C",
        text: "However, debate persists regarding whether grammatical gender distinctions alter non-linguistic object categorization. While German speakers frequently describe 'keys' (feminine in German) with aesthetic adjectives like 'delicate', Spanish speakers (where 'key' is masculine) emphasize utility and strength, suggesting lexical gender exerts a subtle subconscious framing influence."
      }
    ],
    questions: [
      {
        id: 1,
        type: 'tfng',
        prompt: "Contemporary neuroscientists have accepted radical linguistic determinism as entirely validated.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph A states early deterministic models have been discarded in favor of nuanced linguistic relativity paradigms."
      },
      {
        id: 2,
        type: 'tfng',
        prompt: "Lifelong bilingualism is linked to an average delay of 4.5 years in the onset of clinical dementia.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "TRUE",
        explanation: "Paragraph B states bilingual cognitive exercise fortifies attention and delays clinical dementia onset by an average of 4.5 years."
      },
      {
        id: 3,
        type: 'tfng',
        prompt: "The dorsolateral prefrontal cortex shows diminished activity during dual-language switching.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctAnswer: "FALSE",
        explanation: "Paragraph B notes heightened gray-matter density and continuous inhibitory activity in this brain region."
      },
      {
        id: 4,
        type: 'mcq',
        prompt: "According to Paragraph C, how do grammatical gender classifications influence perception?",
        options: [
          "They exert a subtle subconscious framing influence on descriptive descriptors",
          "They completely prevent speakers from understanding foreign concepts",
          "They permanently restrict spatial reasoning capacity",
          "They have zero documented correlation with cognitive linguistics"
        ],
        correctAnswer: "They exert a subtle subconscious framing influence on descriptive descriptors",
        explanation: "Paragraph C notes that grammatical gender differences in German and Spanish exert a subtle subconscious framing influence."
      }
    ]
  }
];

const DEFAULT_LISTENING_QUESTIONS: ListeningQuestion[] = [
  {
    id: 1,
    section: 1,
    prompt: "Customer inquiry reference number:",
    options: ["CR-9482-B", "CR-4982-A", "TR-9482-B", "CR-9428-C"],
    correctAnswer: "CR-9482-B",
    explanation: "The caller confirms the file reference code ending in '9482-B'."
  },
  {
    id: 2,
    section: 1,
    prompt: "Preferred relocation start date:",
    options: ["14th November", "18th November", "24th November", "1st December"],
    correctAnswer: "18th November",
    explanation: "The student agent books the slot for Friday the 18th of November."
  },
  {
    id: 3,
    section: 2,
    prompt: "Which facility has recently been upgraded in the campus library?",
    options: [
      "Soundproof private podcast studios",
      "24-hour quiet study pods",
      "Automated book return conveyor",
      "High-resolution digital microfilm archive"
    ],
    correctAnswer: "24-hour quiet study pods",
    explanation: "The university guide mentions the brand-new 24-hour acoustic study pods installed last semester."
  }
];

export default function MockExamPage() {
  const [examType, setExamType] = useState<'reading' | 'listening'>('reading');
  const [timerSeconds, setTimerSeconds] = useState(3600); // 60 mins for Reading
  const [timerActive, setTimerActive] = useState(true);
  const [highlightActive, setHighlightActive] = useState(false);

  // Multi-Test Battery Selection
  const [activeBatteryIndex, setActiveBatteryIndex] = useState(0);
  const currentPassage = EXAM_BATTERY_CATALOG[activeBatteryIndex] || EXAM_BATTERY_CATALOG[0];

  // Dynamic Exam Datasets
  const [readingPassage, setReadingPassage] = useState<ReadingPassage>(currentPassage);
  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>(currentPassage.questions);
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>(DEFAULT_LISTENING_QUESTIONS);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  // Audio Player State (Listening)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(32); // percentage

  // User Answers
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scoreReport, setScoreReport] = useState<any>(null);

  // Switch Battery
  const handleSelectBattery = (index: number) => {
    setActiveBatteryIndex(index);
    const chosen = EXAM_BATTERY_CATALOG[index];
    setReadingPassage(chosen);
    setReadingQuestions(chosen.questions);
    setReadingAnswers({});
    setSubmitted(false);
    setScoreReport(null);
    setTimerSeconds(3600);
    setTimerActive(true);
    toast.success(`Loaded Battery: ${chosen.topic}`, "Full academic test loaded.");
  };

  // AI Shuffle Exam
  const handleShuffleAiExam = () => {
    setIsGeneratingExam(true);
    setTimeout(() => {
      const nextIndex = (activeBatteryIndex + 1) % EXAM_BATTERY_CATALOG.length;
      setActiveBatteryIndex(nextIndex);
      const chosen = EXAM_BATTERY_CATALOG[nextIndex];
      setReadingPassage(chosen);
      setReadingQuestions(chosen.questions);
      setReadingAnswers({});
      setSubmitted(false);
      setScoreReport(null);
      setTimerSeconds(3600);
      setTimerActive(true);
      setIsGeneratingExam(false);
      toast.success("AI Generated New Exam 🪄", `Loaded "${chosen.title.slice(0, 30)}..."`);
    }, 600);
  };

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

          <div className="flex items-center gap-3">
            {/* Battery Selector for Reading */}
            {examType === 'reading' && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {EXAM_BATTERY_CATALOG.map((bat, idx) => (
                  <button
                    key={bat.id}
                    onClick={() => handleSelectBattery(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      activeBatteryIndex === idx ? 'bg-white text-[#027FFF] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Test {idx + 1}
                  </button>
                ))}
                <button
                  onClick={handleShuffleAiExam}
                  disabled={isGeneratingExam}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:opacity-95 transition-opacity"
                >
                  <Sparkles className={`w-3 h-3 ${isGeneratingExam ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingExam ? 'Generating...' : 'AI New 🪄'}</span>
                </button>
              </div>
            )}

            {/* Exam Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex">
              <button
                onClick={() => handleSwitchExam('reading')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  examType === 'reading' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Reading (60m)
              </button>
              <button
                onClick={() => handleSwitchExam('listening')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  examType === 'listening' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                Listening (30m)
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
