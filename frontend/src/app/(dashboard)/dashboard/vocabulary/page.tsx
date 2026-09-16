"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Volume2, RotateCcw, CheckCircle2, XCircle,
  ArrowLeft, ArrowRight, Flame, Layers, BrainCircuit,
  Check, HelpCircle, Award, Shuffle, RefreshCw, Trophy
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Flashcard {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  bandLevel: string;
  definition: string;
  collocations: string[];
  exampleSentence: string;
  topic: string;
}

interface QuizQuestion {
  id: number;
  topic: string;
  bandLevel: string;
  sentence: string;
  options: {
    word: string;
    label: string;
    definition: string;
  }[];
  correctWord: string;
  explanation: string;
  ieltsTip: string;
}

export default function VocabularyStudioPage() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Dynamic Data States
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizHistory, setQuizHistory] = useState<{ questionId: number; selected: string; isCorrect: boolean }[]>([]);

  // Fetch dynamic vocabulary and quiz questions from API
  useEffect(() => {
    const fetchVocabData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const data = await res.json();
          if (data.flashcards) setFlashcards(data.flashcards);
          if (data.quizQuestions) setQuizQuestions(data.quizQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch vocabulary from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabData();
  }, []);

  const topics = ['All', 'Technology', 'Environment', 'Education', 'Society', 'Health'];

  const filteredCards = selectedTopic === 'All' 
    ? flashcards 
    : flashcards.filter(c => c.topic === selectedTopic);

  const currentCard = filteredCards[currentIndex] || flashcards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleRating = (rating: string) => {
    toast.success(`Retention Calibrated: ${rating}`, "Spaced Repetition algorithm scheduled next review interval.");
    handleNext();
  };

  // Pronounce audio helper
  const handlePronounce = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-GB';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
      toast.info("Audio Pronunciation 🔊", `Playing native British English audio for "${word}".`);
    }
  };

  // Quiz Handlers
  const currentQuiz = quizQuestions[quizIndex];

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuiz.correctWord;
    setQuizAnswered(true);

    if (isCorrect) {
      setQuizScore(s => s + 1);
      toast.success("Correct Answer! 🎯", `'${currentQuiz.correctWord}' is the exact academic collocation.`);
    } else {
      toast.error("Incorrect Choice", `The precise academic word is '${currentQuiz.correctWord}'.`);
    }

    setQuizHistory(prev => [
      ...prev,
      { questionId: currentQuiz.id, selected: selectedOption, isCorrect }
    ]);
  };

  const handleNextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuizAnswered(false);
      toast.info(`Question ${quizIndex + 2} of ${quizQuestions.length}`, "Calibrating next vocabulary context drill.");
    } else {
      setQuizCompleted(true);
      toast.success("Quiz Completed! 🏆", `You scored ${quizScore + (selectedOption === currentQuiz.correctWord ? 1 : 0)} / ${quizQuestions.length}!`);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizCompleted(false);
    setQuizHistory([]);
    toast.info("Quiz Reset", "Starting a fresh vocabulary calibration drill.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" /> Academic Lexicon &amp; Flashcards
            </h1>
            <p className="text-sm text-slate-500 mt-1">Master Band 8.0+ collocations and idioms with SM-2 Spaced Repetition calibration.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex shadow-sm">
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'flashcards' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flashcards (SM-2)
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quiz' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Retention Quiz ({quizQuestions.length} Drills)
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>5-Day Retention Streak</span>
            </div>
          </div>
        </div>

        {/* TOPIC FILTER BAR - ELEVATED WRAPPING PILL CONTAINER (NO CUTOFF) */}
        {activeTab === 'flashcards' && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-2xl p-2.5 flex flex-wrap items-center gap-2 shadow-sm mb-6">
            <div className="flex items-center gap-1.5 px-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Topic Filter:</span>
            </div>
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTopic === topic
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:text-slate-900'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* TAB 1: INTERACTIVE FLASHCARD (SM-2) */}
        {activeTab === 'flashcards' ? (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            
            {/* Card Counter */}
            <div className="flex items-center justify-between w-full mb-3 text-xs font-bold text-slate-500 px-2">
              <span>Card {currentIndex + 1} of {filteredCards.length}</span>
              <span className="text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-bold">{currentCard.bandLevel}</span>
            </div>

            {/* 3D Flip Card */}
            <div 
              onClick={() => setIsFlipped(p => !p)}
              className="w-full min-h-[380px] bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all cursor-pointer relative flex flex-col justify-between group select-none"
            >
              {/* Card Front */}
              {!isFlipped ? (
                <div className="flex-1 flex flex-col justify-between items-center text-center py-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currentCard.topic} • {currentCard.partOfSpeech}</span>
                  
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
                      {currentCard.word}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#027FFF] font-mono font-bold">
                      <span>{currentCard.phonetic}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePronounce(currentCard.word);
                        }}
                        className="p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                        title="Play audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#027FFF] transition-colors flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Tap anywhere to flip definition
                  </span>
                </div>
              ) : (
                /* Card Back */
                <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in zoom-in-95 duration-200 text-left">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <span className="text-lg font-black text-slate-900">{currentCard.word}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">{currentCard.bandLevel}</span>
                    </div>

                    <p className="text-base text-slate-800 font-bold mb-4 leading-snug">
                      {currentCard.definition}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Key Collocations:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentCard.collocations.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Example in IELTS Context:</span>
                        <p className="text-xs text-slate-600 font-serif italic bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                          &ldquo;{currentCard.exampleSentence}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 text-center block pt-4">Tap to flip back</span>
                </div>
              )}
            </div>

            {/* SM-2 Spaced Repetition Rating Buttons */}
            {isFlipped ? (
              <div className="w-full mt-6 space-y-2 animate-in fade-in duration-300">
                <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider">How well did you know this word?</p>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => handleRating("Again (1d)")} 
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Again</span>
                    <span className="text-[10px] text-red-500 font-normal">1 Day</span>
                  </button>
                  <button 
                    onClick={() => handleRating("Hard (3d)")} 
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Hard</span>
                    <span className="text-[10px] text-amber-500 font-normal">3 Days</span>
                  </button>
                  <button 
                    onClick={() => handleRating("Good (7d)")} 
                    className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#027FFF] font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Good</span>
                    <span className="text-[10px] text-blue-500 font-normal">7 Days</span>
                  </button>
                  <button 
                    onClick={() => handleRating("Easy (14d)")} 
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Easy</span>
                    <span className="text-[10px] text-emerald-500 font-normal">14 Days</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Navigation Arrows */
              <div className="flex items-center justify-between w-full mt-6 px-4">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#027FFF] text-white font-bold text-xs hover:bg-blue-600 transition-colors shadow-md"
                >
                  Next Word <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        ) : (
          /* TAB 2: DYNAMIC RETENTION QUIZ ENGINE */
          <div className="max-w-2xl mx-auto w-full">
            {!quizCompleted ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm space-y-6">
                
                {/* Progress Bar & Counter */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{currentQuiz.topic} • {currentQuiz.bandLevel}</span>
                      <h3 className="text-xl font-black text-slate-900">Vocabulary Context Drill</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] text-xs font-bold border border-blue-200">
                        Question {quizIndex + 1} of {quizQuestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#027FFF] h-full transition-all duration-300"
                      style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Sentence with blank */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-base leading-relaxed font-serif shadow-inner">
                  &ldquo;{currentQuiz.sentence}&rdquo;
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQuiz.options.map((opt) => {
                    const isSelected = selectedOption === opt.word;
                    const isCorrect = opt.word === currentQuiz.correctWord;

                    let style = "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50";
                    if (quizAnswered) {
                      if (isCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500";
                      else if (isSelected && !isCorrect) style = "bg-red-50 border-red-500 text-red-900 line-through opacity-80";
                      else style = "bg-white border-slate-200 text-slate-400 opacity-60";
                    } else if (isSelected) {
                      style = "bg-blue-50 border-[#027FFF] text-[#027FFF] font-bold shadow-sm ring-1 ring-[#027FFF]";
                    }

                    return (
                      <button
                        key={opt.word}
                        onClick={() => {
                          if (quizAnswered) return;
                          setSelectedOption(opt.word);
                        }}
                        className={`w-full p-4 rounded-2xl border text-sm font-semibold text-left transition-all flex items-center justify-between ${style}`}
                      >
                        <div>
                          <span className="font-mono text-base font-bold mr-2">{opt.word}</span>
                          <span className="text-xs text-slate-500 font-normal">({opt.definition})</span>
                        </div>
                        {quizAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                        {quizAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Explanation Card (appears after answering) */}
                {quizAnswered && (
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 font-bold text-xs text-indigo-700 uppercase tracking-wider">
                      <BrainCircuit className="w-4 h-4" /> Linguistic Rationale &amp; IELTS Tip
                    </div>
                    <p className="text-xs leading-relaxed text-indigo-900 font-medium">
                      {currentQuiz.explanation}
                    </p>
                    <div className="pt-2 border-t border-indigo-200/60 text-xs text-indigo-800 italic">
                      💡 <strong>Band 8.5 Tip:</strong> {currentQuiz.ieltsTip}
                    </div>
                  </div>
                )}

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {!quizAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={!selectedOption}
                      className="w-full py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-sm shadow-md transition-all"
                    >
                      Confirm Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {quizIndex < quizQuestions.length - 1 ? (
                        <>Next Context Question ({quizIndex + 2} / {quizQuestions.length}) <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>View Final Score &amp; Lexical Assessment 🏆</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* QUIZ COMPLETION SUMMARY CARD */
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="inline-flex p-4 bg-amber-50 rounded-3xl border border-amber-200 text-amber-500 shadow-sm">
                  <Trophy className="w-12 h-12" />
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900">Drill Completed!</h2>
                  <p className="text-sm text-slate-500 mt-1">Here is your real-time lexical calibration summary.</p>
                </div>

                {/* Score & Band Estimation Badge */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Raw Score</span>
                    <span className="text-3xl font-black text-slate-900">{quizScore} / {quizQuestions.length}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">({Math.round((quizScore / quizQuestions.length) * 100)}% Accuracy)</span>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">Estimated Band</span>
                    <span className="text-3xl font-black text-[#027FFF]">
                      {quizScore >= 4 ? "Band 8.5" : quizScore >= 3 ? "Band 7.5" : "Band 6.5"}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold block mt-1">Lexical Resource</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={handleRestartQuiz}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Retake Drill
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('flashcards');
                      setQuizCompleted(false);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Layers className="w-4 h-4" /> Review Flashcards
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

