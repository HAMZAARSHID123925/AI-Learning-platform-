'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Brain, CheckCircle2, XCircle, 
  HelpCircle, RotateCcw, Award, Sparkles, 
  ChevronRight, Lightbulb, Zap, Clock,
  Filter, Check, AlertTriangle, BookOpen, Layers
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { toast } from '@/components/ToastProvider';

interface TransformationQuestion {
  id: string;
  category: 'Inversion & Subjunctive' | 'Fixed Idioms & Prepositions' | 'Passives & Impersonal' | 'Nominalization & Phrasals';
  leadSentence: string;
  keyWord: string;
  startText: string;
  endText: string;
  acceptedAnswers: string[];
  mark1Explanation: string; // Syntactic structure mark
  mark2Explanation: string; // Lexical collocation mark
  examinerNotes: string;
}

const TRANSFORMATION_BANK: TransformationQuestion[] = [
  {
    id: 'c2-q1',
    category: 'Inversion & Subjunctive',
    leadSentence: 'If the government had not intervened, the financial institution would have collapsed.',
    keyWord: 'INTERVENTION',
    startText: 'Had it',
    endText: 'government, the financial institution would have collapsed.',
    acceptedAnswers: [
      'not been for the intervention of the',
      'not been for the governmental intervention of the',
      'not been for the direct intervention of the'
    ],
    mark1Explanation: 'Condition inversion past conditional: "not been for"',
    mark2Explanation: 'Nominalized prepositional phrase: "the intervention of the"',
    examinerNotes: '"Had it not been for [noun phrase]" is a high-frequency C2 inversion structure used to express hypothetical past conditions without using the word "if".'
  },
  {
    id: 'c2-q2',
    category: 'Inversion & Subjunctive',
    leadSentence: 'You must not reveal the confidential details under any circumstances.',
    keyWord: 'NO',
    startText: 'Under',
    endText: 'confidential details be revealed.',
    acceptedAnswers: [
      'no circumstances must the',
      'no circumstances should the',
      'no circumstances are the'
    ],
    mark1Explanation: 'Negative limiting adverbial: "no circumstances"',
    mark2Explanation: 'Subject-auxiliary inversion: "must/should the"',
    examinerNotes: 'Fronting negative adverbials like "Under no circumstances" triggers mandatory subject-auxiliary inversion in formal academic and C2 English.'
  },
  {
    id: 'c2-q3',
    category: 'Fixed Idioms & Prepositions',
    leadSentence: 'She decided to resign without thinking carefully about the consequences.',
    keyWord: 'SPUR',
    startText: 'She resigned',
    endText: 'without thinking carefully about the consequences.',
    acceptedAnswers: [
      'on the spur of the moment',
      'upon the spur of the moment'
    ],
    mark1Explanation: 'Fixed idiomatic preposition: "on the spur"',
    mark2Explanation: 'Idiom completion: "of the moment"',
    examinerNotes: '"On the spur of the moment" is a classic C2 idiomatic fixed phrase meaning to act impulsively without premeditation.'
  },
  {
    id: 'c2-q4',
    category: 'Passives & Impersonal',
    leadSentence: 'People claim that the ancient manuscript dates back to the twelfth century.',
    keyWord: 'PURPORTED',
    startText: 'The ancient manuscript',
    endText: 'to the twelfth century.',
    acceptedAnswers: [
      'is purported to date back',
      'is purported to go back',
      'is widely purported to date back'
    ],
    mark1Explanation: 'Impersonal passive reporting structure: "is purported"',
    mark2Explanation: 'Dependent perfective/infinitive collocation: "to date back"',
    examinerNotes: '"To be purported to [infinitive]" elevates standard passive reporting verbs ("believed to", "said to") to Band 8.5+ academic precision.'
  },
  {
    id: 'c2-q5',
    category: 'Nominalization & Phrasals',
    leadSentence: 'The sudden economic crisis resulted in widespread job losses across the country.',
    keyWord: 'RISE',
    startText: 'The sudden economic crisis',
    endText: 'widespread job losses across the country.',
    acceptedAnswers: [
      'gave rise to',
      'has given rise to'
    ],
    mark1Explanation: 'Idiomatic phrasal verb: "gave rise"',
    mark2Explanation: 'Dependent preposition: "to"',
    examinerNotes: '"Give rise to [noun]" is a high-level academic causative phrase replacing the basic connector "caused" or "led to".'
  },
  {
    id: 'c2-q6',
    category: 'Fixed Idioms & Prepositions',
    leadSentence: 'Whether we approve the funding is entirely up to the board of directors.',
    keyWord: 'DISCRETION',
    startText: 'The approval of the funding is',
    endText: 'the board of directors.',
    acceptedAnswers: [
      'at the discretion of',
      'left to the discretion of',
      'entirely at the discretion of'
    ],
    mark1Explanation: 'Prepositional locator: "at the / left to the"',
    mark2Explanation: 'Institutional noun phrase: "discretion of"',
    examinerNotes: '"At the discretion of [authority]" is formal legalistic and executive English indicating sole decision-making authority.'
  }
];

export default function TransformationsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ mark1: boolean; mark2: boolean; total: number } | null>(null);
  const [userScoreTotal, setUserScoreTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filtered list
  const filteredQuestions = selectedCategory === 'All'
    ? TRANSFORMATION_BANK
    : TRANSFORMATION_BANK.filter(q => q.category === selectedCategory);

  const activeQuestion = filteredQuestions[currentIndex] || TRANSFORMATION_BANK[0];

  // Count user words in gap
  const inputWords = userInput.trim().split(/\s+/).filter(Boolean);
  const wordCount = inputWords.length;
  const isLengthValid = wordCount >= 3 && wordCount <= 6;

  const handleReset = () => {
    setUserInput('');
    setIsSubmitted(false);
    setScore(null);
    setShowExplanation(false);
  };

  const handleNextQuestion = () => {
    handleReset();
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, ' ');
  };

  const handleSubmitAnswer = () => {
    if (wordCount < 1) {
      toast.warning('Input Required', 'Please enter your transformed sentence clause.');
      return;
    }

    if (wordCount < 3 || wordCount > 6) {
      toast.warning('Word Count Violation ⚠️', `Cambridge C2 rules require strictly between 3 and 6 words (you wrote ${wordCount} words).`);
    }

    const normalizedUser = normalize(userInput);
    
    // Check if key word was used and unchanged
    const normalizedKey = activeQuestion.keyWord.toLowerCase();
    if (!normalizedUser.includes(normalizedKey)) {
      toast.error('Keyword Missing!', `You must include the root word "${activeQuestion.keyWord}" unchanged.`);
    }

    const isExactMatch = activeQuestion.acceptedAnswers.some(ans => normalize(ans) === normalizedUser);

    let marks = 0;
    let m1 = false;
    let m2 = false;

    if (isExactMatch && isLengthValid) {
      marks = 2;
      m1 = true;
      m2 = true;
    } else if (normalizedUser.includes(normalizedKey) && isLengthValid) {
      // Partial credit check (1 mark)
      marks = 1;
      m1 = true;
      m2 = false;
    }

    setScore({ mark1: m1, mark2: m2, total: marks });
    setIsSubmitted(true);
    setShowExplanation(true);

    if (marks === 2) {
      setUserScoreTotal(s => s + 2);
      setStreak(st => st + 1);
      toast.success('Flawless C2 Transformation! 🎯', 'Full 2/2 marks awarded for syntax and collocation.');
    } else if (marks === 1) {
      setUserScoreTotal(s => s + 1);
      toast.info('Partial Credit (1/2)', 'Key structure detected, but check lexical precision.');
    } else {
      setStreak(0);
      toast.error('Incorrect Transformation', 'Review the examiner explanation below to master this rule.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-[#027FFF]" /> Cambridge C2 Key Word Transformations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Authentic Use of English Part 4 &amp; IELTS Band 8.5+ syntactic agility drills with strict 3–6 word constraints.
            </p>
          </div>

          {/* Telemetry Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Streak</span>
                <span className="text-xs font-black text-slate-900">{streak} Correct</span>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#027FFF]" />
              <div>
                <span className="text-[10px] text-[#027FFF] font-bold uppercase block">Total Marks</span>
                <span className="text-xs font-black text-[#027FFF]">{userScoreTotal} Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-xs font-extrabold uppercase text-slate-400 mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </span>
          {['All', 'Inversion & Subjunctive', 'Fixed Idioms & Prepositions', 'Passives & Impersonal', 'Nominalization & Phrasals'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); handleReset(); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#027FFF] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Drill Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Question Card */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              
              {/* Question Meta */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black uppercase">
                    Question {currentIndex + 1} of {filteredQuestions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    • {activeQuestion.category}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-500">
                  Cambridge Rule: <strong className="text-slate-800">3 to 6 words</strong>
                </div>
              </div>

              {/* Lead Sentence */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Original Lead Sentence:
                </span>
                <p className="text-sm font-semibold text-slate-800 font-serif leading-relaxed">
                  &ldquo;{activeQuestion.leadSentence}&rdquo;
                </p>
              </div>

              {/* Keyword Display */}
              <div className="flex items-center justify-center my-2">
                <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F172A] text-white shadow-md border border-slate-700 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-extrabold block">
                    Given Root Keyword (Do Not Change):
                  </span>
                  <span className="text-lg font-black tracking-wider text-cyan-400 font-mono">
                    {activeQuestion.keyWord}
                  </span>
                </div>
              </div>

              {/* Gapped Target Sentence & Input Field */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Complete the second sentence so it has a similar meaning:
                </span>

                <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed font-serif">
                    <span className="text-slate-900 font-bold">{activeQuestion.startText}</span>
                    <span className="mx-2 px-3 py-1 rounded-lg bg-white border border-blue-300 text-[#027FFF] font-mono text-xs font-bold shadow-inner inline-block">
                      [ ... Your 3–6 Word Clause ... ]
                    </span>
                    <span className="text-slate-900 font-bold">{activeQuestion.endText}</span>
                  </p>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isSubmitted}
                      placeholder={`Type missing clause including ${activeQuestion.keyWord}...`}
                      className="w-full p-4 rounded-xl bg-white border-2 border-slate-300 focus:border-[#027FFF] text-slate-900 font-bold text-sm outline-none transition-all shadow-sm font-serif"
                    />

                    {/* Real-time word count guard */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className={`font-bold flex items-center gap-1 ${
                        isLengthValid ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {wordCount} words {wordCount < 3 ? '(min 3 required)' : wordCount > 6 ? '(max 6 exceeded!)' : '(valid length)'}
                      </span>
                      <span className="text-slate-400 font-medium">Do not change the word &quot;{activeQuestion.keyWord}&quot;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Input
                </button>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={wordCount === 0}
                    className="px-8 py-3 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Check Transformation
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Examiner Pedagogical Feedback Card */}
            {isSubmitted && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#027FFF]" /> Examiner Marking Breakdown
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#027FFF] text-xs font-black">
                    Score: {score?.total || 0} / 2 Marks
                  </div>
                </div>

                {/* 2-Mark Visual Allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    score?.mark1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {score?.mark1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <div>
                      <span className="font-bold block">Mark 1 (Syntactic Structure):</span>
                      <p className="text-[11px] opacity-90">{activeQuestion.mark1Explanation}</p>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                    score?.mark2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {score?.mark2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    <div>
                      <span className="font-bold block">Mark 2 (Lexical Collocation):</span>
                      <p className="text-[11px] opacity-90">{activeQuestion.mark2Explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Accepted Canonical Answers */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Official Cambridge Accepted Answers:
                  </span>
                  <div className="space-y-1">
                    {activeQuestion.acceptedAnswers.map((ans, idx) => (
                      <p key={idx} className="text-xs font-mono font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-emerald-600 font-black">✓</span> {activeQuestion.startText} <span className="text-[#027FFF] underline">{ans}</span> {activeQuestion.endText}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Deep Grammatical Rule Note */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold mb-1 text-amber-950">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Examiner Grammar Rule:</span>
                  </div>
                  <p>{activeQuestion.examinerNotes}</p>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: C2 Mastery Scale & Rules Guide */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Cambridge C2 Scale Card */}
            <div className="bg-gradient-to-br from-[#0F172A] to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CEFR C2 Proficiency
                </span>
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>

              <h3 className="text-lg font-black text-white">Cambridge Use of English Part 4</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Key Word Transformations test your capacity to rephrase complex thoughts with complete structural flexibility.
              </p>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Word Limit Rule:</span>
                  <span className="text-cyan-300 font-mono">3 to 6 words</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Keyword Rule:</span>
                  <span className="text-cyan-300">Keep unchanged</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">Contractions:</span>
                  <span className="text-cyan-300">Count as 2 words</span>
                </div>
              </div>
            </div>

            {/* Quick Grammar Cheat-Sheet */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> High-Band Formula Cheat-Sheet
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-purple-700 block mb-0.5">Had it not been for...</span>
                  <span className="text-slate-500 text-[11px]">Replaces &quot;If it hadn&apos;t happened...&quot;</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-blue-700 block mb-0.5">Under no circumstances...</span>
                  <span className="text-slate-500 text-[11px]">Triggers inversion: &quot;...must you go.&quot;</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-emerald-700 block mb-0.5">Is purported to be...</span>
                  <span className="text-slate-500 text-[11px]">High-register passive reporting verb.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
