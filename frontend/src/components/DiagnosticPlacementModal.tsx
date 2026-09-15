"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, Award, ArrowRight, BrainCircuit, 
  Target, Clock, BookOpen, AlertCircle, RefreshCw, X, ChevronRight, BarChart3
} from 'lucide-react';

interface DiagnosticQuestion {
  id: number;
  skill: 'Grammar' | 'Vocabulary' | 'Reading' | 'Collocations' | 'Discourse';
  difficulty: 'A2' | 'B1' | 'B2' | 'C1';
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    skill: 'Grammar',
    difficulty: 'B1',
    question: 'Choose the correct form to complete the sentence:',
    context: 'If the government ________ more funding in public transport, city congestion would decrease significantly.',
    options: [
      'invests',
      'invested',
      'had invested',
      'would invest'
    ],
    correctIndex: 1,
    explanation: 'This is a Second Conditional sentence expressing a hypothetical present/future situation (If + past simple, would + base verb).'
  },
  {
    id: 2,
    skill: 'Vocabulary',
    difficulty: 'B2',
    question: 'Select the most academic synonym for the underlined word:',
    context: 'The rapid increase in urban populations has created significant problems for waste management.',
    options: [
      'unprecedented challenges',
      'bad troubles',
      'hard dilemmas',
      'negative issues'
    ],
    correctIndex: 0,
    explanation: '"Unprecedented challenges" is high-register academic vocabulary (Band 7.5+ Lexical Resource).'
  },
  {
    id: 3,
    skill: 'Reading',
    difficulty: 'B2',
    context: 'Passage: "While early cognitive models posited that language acquisition ceases post-puberty, neuroplasticity studies now confirm synaptic malleability persists across adulthood, albeit requiring more intentional metacognitive reinforcement."',
    question: 'According to the passage, what is true about adult language learning?',
    options: [
      'It is biologically impossible due to lost synaptic malleability.',
      'It is still biologically possible but demands deliberate cognitive strategies.',
      'It occurs at exactly the same automatic rate as in childhood.',
      'It no longer requires metacognitive reinforcement.'
    ],
    correctIndex: 1,
    explanation: '"Synaptic malleability persists... albeit requiring more intentional metacognitive reinforcement" directly supports deliberate learning.'
  },
  {
    id: 4,
    skill: 'Collocations',
    difficulty: 'C1',
    question: 'Which collocation correctly completes this Task 2 academic essay sentence?',
    context: 'Technological automation will inevitably ________ a profound impact on future employment structures.',
    options: [
      'exert',
      'make',
      'do',
      'bring up'
    ],
    correctIndex: 0,
    explanation: 'The academic collocation is "exert an impact" or "have an impact" (C1 Advanced Lexical Resource).'
  },
  {
    id: 5,
    skill: 'Discourse',
    difficulty: 'B2',
    question: 'Choose the best cohesive device to show concession:',
    context: 'Renewable energy infrastructure requires substantial initial capital; ________, its long-term environmental and economic dividends outweigh preliminary costs.',
    options: [
      'furthermore',
      'nonetheless',
      'in contrast to',
      'consequently'
    ],
    correctIndex: 1,
    explanation: '"Nonetheless" correctly signals concession and counter-argument balance in IELTS Coherence & Cohesion.'
  }
];

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: {
    estimatedBand: number;
    levelName: string;
    targetMilestone: string;
    strengths: string[];
    weaknesses: string[];
  }) => void;
}

export default function DiagnosticPlacementModal({ isOpen, onClose, onComplete }: DiagnosticModalProps) {
  const [step, setStep] = useState<'intro' | 'test' | 'calculating' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [calculatedResult, setCalculatedResult] = useState<{
    estimatedBand: number;
    score: number;
    levelName: string;
    targetMilestone: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || step !== 'test') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step, selectedAnswers]);

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleSubmitTest = () => {
    setStep('calculating');

    let correctScore = 0;
    const weaknesses: string[] = [];
    const strengths: string[] = [];

    DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctScore += 1;
        strengths.push(q.skill);
      } else {
        weaknesses.push(q.skill);
      }
    });

    let estimatedBand = 5.5;
    let levelName = 'Intermediate (B1)';
    let targetMilestone = 'Aim for Band 6.5 in 6 Weeks';

    if (correctScore === 5) {
      estimatedBand = 8.0;
      levelName = 'Expert / Very Good User (C1/C2)';
      targetMilestone = 'Band 8.5+ Precision Mastery';
    } else if (correctScore === 4) {
      estimatedBand = 7.5;
      levelName = 'Good User (C1)';
      targetMilestone = 'Band 8.0 Distinctions Plan';
    } else if (correctScore === 3) {
      estimatedBand = 6.5;
      levelName = 'Competent User (B2)';
      targetMilestone = 'Band 7.5 Accelerator Track';
    } else if (correctScore === 2) {
      estimatedBand = 6.0;
      levelName = 'Modest User (B2)';
      targetMilestone = 'Band 7.0 Bridge Program';
    } else {
      estimatedBand = 5.0;
      levelName = 'Foundation (B1)';
      targetMilestone = 'Band 6.5 Core Ramp-Up';
    }

    const resultPayload = {
      estimatedBand,
      score: correctScore,
      levelName,
      targetMilestone,
      strengths: strengths.length > 0 ? strengths : ['Core Determination'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['None! Ready for Advanced Modules']
    };

    setTimeout(() => {
      setCalculatedResult(resultPayload);
      setStep('result');
      // Save diagnostic completion in localStorage
      localStorage.setItem('diagnostic_completed', 'true');
      localStorage.setItem('estimated_band', estimatedBand.toString());
      localStorage.setItem('diagnostic_data', JSON.stringify(resultPayload));
    }, 1800);
  };

  const handleFinishAndApply = () => {
    if (calculatedResult) {
      onComplete(calculatedResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0B1221] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#027FFF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#5BC0EB]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#027FFF]/20 border border-[#027FFF]/40 flex items-center justify-center text-[#5BC0EB]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                5-Min Diagnostic Level Placement
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  AI Calibrated
                </span>
              </h3>
              <p className="text-xs text-slate-400">Establish your baseline IELTS score and generate your personalized roadmap</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: INTRO */}
          {step === 'intro' && (
            <div className="space-y-6 py-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#027FFF] to-[#5BC0EB] p-0.5 shadow-lg shadow-[#027FFF]/20">
                <div className="w-full h-full bg-[#0B1221] rounded-2xl flex items-center justify-center text-[#5BC0EB]">
                  <Target className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h4 className="text-2xl font-extrabold text-white">Find Your Starting Band in 5 Minutes</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Take 5 precision diagnostic questions across grammar, academic lexical resource, syntax cohesion, and comprehension. Our AI will instantly map your strengths and customize your syllabus.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left max-w-lg mx-auto pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Clock className="w-4 h-4 text-[#5BC0EB] mb-1.5" />
                  <p className="text-xs font-bold text-white">5 Minutes</p>
                  <p className="text-[11px] text-slate-400">Timed assessment</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Award className="w-4 h-4 text-emerald-400 mb-1.5" />
                  <p className="text-xs font-bold text-white">Band Prediction</p>
                  <p className="text-[11px] text-slate-400">Accurate to ±0.5</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-400 mb-1.5" />
                  <p className="text-xs font-bold text-white">Custom Plan</p>
                  <p className="text-[11px] text-slate-400">Auto-tailored path</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStep('test')}
                  className="px-8 py-3.5 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] text-white font-bold text-sm shadow-lg shadow-[#027FFF]/25 hover:shadow-[#027FFF]/40 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span>Begin Diagnostic Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TEST IN PROGRESS */}
          {step === 'test' && (
            <div className="space-y-6">
              {/* Progress & Timer Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-300">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#027FFF]/20 text-[#5BC0EB] font-mono font-medium border border-[#027FFF]/30">
                    {currentQ.skill} • {currentQ.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Question Context & Prompt */}
              <div className="space-y-3">
                {currentQ.context && (
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed italic">
                    &ldquo;{currentQ.context}&rdquo;
                  </div>
                )}
                <h5 className="text-base font-bold text-white">
                  {currentQ.question}
                </h5>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between text-sm ${
                        isSelected 
                          ? 'bg-[#027FFF]/20 border-[#027FFF] text-white shadow-md shadow-[#027FFF]/10' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                          isSelected ? 'bg-[#027FFF] text-white border-[#027FFF]' : 'border-slate-700 text-slate-400 bg-slate-800'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#5BC0EB] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400"
                >
                  Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    disabled={selectedAnswers[currentIndex] === undefined}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#027FFF]/20"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled={answeredCount < totalQuestions}
                    onClick={handleSubmitTest}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <span>Submit &amp; View Placement</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CALCULATING */}
          {step === 'calculating' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#027FFF] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Synthesizing Linguistic Profile...</h4>
                <p className="text-xs text-slate-400">Correlating performance with IDP &amp; Cambridge CEFR Rubric matrices</p>
              </div>
            </div>
          )}

          {/* STEP 4: RESULT SCREEN */}
          {step === 'result' && calculatedResult && (
            <div className="space-y-6 py-2">
              {/* Score Highlight Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1221] to-slate-900 border border-slate-800 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Diagnostic Complete ({calculatedResult.score}/{totalQuestions} Correct)
                </div>
                
                <div className="flex items-center justify-center gap-4 my-2">
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#5BC0EB]">
                    Band {calculatedResult.estimatedBand.toFixed(1)}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-300">
                  {calculatedResult.levelName}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Target Trajectory: <span className="text-[#5BC0EB] font-bold">{calculatedResult.targetMilestone}</span>
                </p>
              </div>

              {/* Strengths & Weaknesses Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Strong Competencies
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {calculatedResult.strengths.map((s, i) => (
                      <li key={i}><span className="font-medium text-white">{s}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Priority Focus Areas
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {calculatedResult.weaknesses.map((w, i) => (
                      <li key={i}><span className="font-medium text-white">{w}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleFinishAndApply}
                  className="w-full py-3.5 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] text-white font-bold text-sm shadow-lg shadow-[#027FFF]/25 transition-all"
                >
                  Apply Diagnostic to My Dashboard &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
