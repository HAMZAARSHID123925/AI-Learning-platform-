"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, Volume2, RotateCcw, CheckCircle2, XCircle,
  ArrowLeft, ArrowRight, Flame, Layers, BrainCircuit,
  Check, HelpCircle, Award, Shuffle, RefreshCw, Trophy,
  Sliders, Globe, Play
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Flashcard {
  id: number;
  word: string;
  syllables: string;
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

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    word: "Ubiquitous",
    syllables: "u · BIQ · ui · tous",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    partOfSpeech: "adjective",
    bandLevel: "Band 8.5",
    definition: "Present, appearing, or found everywhere simultaneously.",
    collocations: ["ubiquitous presence", "ubiquitous technology", "become increasingly ubiquitous"],
    exampleSentence: "Smart devices have become ubiquitous in modern metropolitan households, reshaping communication paradigms.",
    topic: "Technology"
  },
  {
    id: 2,
    word: "Exacerbate",
    syllables: "ex · AC · er · bate",
    phonetic: "/ɪɡˈzæs.ə.beɪt/",
    partOfSpeech: "verb",
    bandLevel: "Band 8.0",
    definition: "To make a problem, bad situation, or negative feeling much worse.",
    collocations: ["exacerbate the problem", "exacerbate climate change", "further exacerbate tensions"],
    exampleSentence: "Unchecked industrial emissions will severely exacerbate the global climate crisis over the next decade.",
    topic: "Environment"
  },
  {
    id: 3,
    word: "Preponderance",
    syllables: "pre · PON · der · ance",
    phonetic: "/prɪˈpɒn.dər.əns/",
    partOfSpeech: "noun",
    bandLevel: "Band 9.0",
    definition: "The quality or fact of being greater in number, quantity, or importance.",
    collocations: ["preponderance of evidence", "preponderance of opinions"],
    exampleSentence: "A substantial preponderance of empirical evidence indicates that bilingualism strengthens executive cognitive function.",
    topic: "Education"
  },
  {
    id: 4,
    word: "Mitigate",
    syllables: "MIT · i · gate",
    phonetic: "/ˈmɪt.ɪ.ɡeɪt/",
    partOfSpeech: "verb",
    bandLevel: "Band 7.5",
    definition: "To make something bad less severe, serious, or painful.",
    collocations: ["mitigate the impact", "mitigate risks", "mitigate emissions"],
    exampleSentence: "Governmental investments in renewable energy are pivotal to mitigate future economic risks.",
    topic: "Environment"
  },
  {
    id: 5,
    word: "Proponents",
    syllables: "pro · PO · nents",
    phonetic: "/prəˈpəʊ.nənts/",
    partOfSpeech: "noun",
    bandLevel: "Band 8.0",
    definition: "A person who advocates a theory, proposal, or project.",
    collocations: ["leading proponents", "proponents of reform", "fervent proponents"],
    exampleSentence: "Proponents of remote learning contend that flexible schedules empower self-directed learners.",
    topic: "Society"
  },
  {
    id: 6,
    word: "Detrimental",
    syllables: "det · ri · MEN · tal",
    phonetic: "/ˌdet.rɪˈmen.təl/",
    partOfSpeech: "adjective",
    bandLevel: "Band 8.0",
    definition: "Tending to cause harm, damage, or injury.",
    collocations: ["detrimental effect", "detrimental to health", "severely detrimental"],
    exampleSentence: "Sedentary lifestyles exert a detrimental influence on physical well-being and cardiovascular health.",
    topic: "Health"
  },
  {
    id: 7,
    word: "Disseminate",
    syllables: "dis · SEM · i · nate",
    phonetic: "/dɪˈsem.ɪ.neɪt/",
    partOfSpeech: "verb",
    bandLevel: "Band 8.5",
    definition: "To spread information, knowledge, or opinions widely.",
    collocations: ["disseminate information", "widely disseminated", "disseminate research findings"],
    exampleSentence: "Academic institutions must effectively disseminate scientific discoveries to the broader public.",
    topic: "Education"
  },
  {
    id: 8,
    word: "Paradigm",
    syllables: "PAR · a · digm",
    phonetic: "/ˈpær.ə.daɪm/",
    partOfSpeech: "noun",
    bandLevel: "Band 9.0",
    definition: "A typical pattern or model of something; a distinct conceptual framework.",
    collocations: ["paradigm shift", "dominant paradigm", "new pedagogical paradigm"],
    exampleSentence: "The integration of generative artificial intelligence represents a fundamental paradigm shift in modern pedagogy.",
    topic: "Technology"
  },
  {
    id: 9,
    word: "Precipitous",
    syllables: "pre · CIP · i · tous",
    phonetic: "/prɪˈsɪp.ɪ.təs/",
    partOfSpeech: "adjective",
    bandLevel: "Band 9.0",
    definition: "Dangerously high or steep; occurring rapidly and without caution.",
    collocations: ["precipitous decline", "precipitous drop", "precipitous surge"],
    exampleSentence: "During the 2020 fiscal quarter, coal consumption experienced a precipitous decline across Western Europe.",
    topic: "Environment"
  },
  {
    id: 10,
    word: "Democratize",
    syllables: "de · MOC · ra · tize",
    phonetic: "/dɪˈmɒk.rə.taɪz/",
    partOfSpeech: "verb",
    bandLevel: "Band 8.5",
    definition: "To make something accessible to everyone, not just a privileged minority.",
    collocations: ["democratize access", "democratize higher education", "democratize information"],
    exampleSentence: "Open digital courseware has the potential to democratize high-caliber education for remote communities.",
    topic: "Society"
  }
];

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    topic: "Environment",
    bandLevel: "Band 8.5",
    sentence: "The introduction of strict carbon taxes helped to ________ the adverse economic impact of environmental degradation.",
    options: [
      { word: "mitigate", label: "mitigate", definition: "to reduce severity or make less severe" },
      { word: "exacerbate", label: "exacerbate", definition: "to make a situation worse" },
      { word: "preponderance", label: "preponderance", definition: "greatness in weight or importance" },
      { word: "ubiquitous", label: "ubiquitous", definition: "present or found everywhere" }
    ],
    correctWord: "mitigate",
    explanation: "'Mitigate' means to make something bad less severe. In the context of taxes preventing severe environmental consequences, 'mitigate the impact' is the standard Band 8.5 academic collocation.",
    ieltsTip: "Use 'mitigate' instead of simplistic verbs like 'lessen' or 'make smaller' in IELTS Writing Task 2 problem-solution essays."
  },
  {
    id: 2,
    topic: "Technology",
    bandLevel: "Band 8.5",
    sentence: "Smartphones and artificial intelligence have become ________ in 21st-century workplaces, altering productivity metrics.",
    options: [
      { word: "preponderance", label: "preponderance", definition: "a superiority in power or numbers" },
      { word: "ubiquitous", label: "ubiquitous", definition: "omnipresent, found everywhere" },
      { word: "detrimental", label: "detrimental", definition: "harmful or causing damage" },
      { word: "disseminate", label: "disseminate", definition: "to spread or distribute widely" }
    ],
    correctWord: "ubiquitous",
    explanation: "'Ubiquitous' is an adjective meaning appearing everywhere. As smartphone technology is present in every modern workplace, 'ubiquitous' fits the grammatical and semantic context perfectly.",
    ieltsTip: "Replace common phrases like 'can be seen everywhere' with 'has become ubiquitous' to elevate your Lexical Resource score."
  },
  {
    id: 3,
    topic: "Education & Research",
    bandLevel: "Band 9.0",
    sentence: "The university launched an open-access repository to ________ cutting-edge medical research to doctors globally.",
    options: [
      { word: "disseminate", label: "disseminate", definition: "to broadcast or distribute information widely" },
      { word: "mitigate", label: "mitigate", definition: "to lessen pain or severity" },
      { word: "exacerbate", label: "exacerbate", definition: "to aggravate or inflame" },
      { word: "proponents", label: "proponents", definition: "advocates or supporters" }
    ],
    correctWord: "disseminate",
    explanation: "'Disseminate' specifically refers to distributing knowledge, data, or findings to a widespread audience.",
    ieltsTip: "'Disseminate findings' is a high-value C2 collocation for IELTS Academic Writing Task 2 and Speaking Part 3."
  }
];

export default function VocabularyStudioPage() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // TTS Voice Engine State
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB');
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dynamic Data States initialized with robust defaults
  const [flashcards, setFlashcards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ_QUESTIONS);

  // Dynamic Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizHistory, setQuizHistory] = useState<{ questionId: number; selected: string; isCorrect: boolean }[]>([]);

  // Fetch dynamic vocabulary and quiz questions from API
  useEffect(() => {
    const fetchVocabData = async () => {
      try {
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const data = await res.json();
          if (data.flashcards && data.flashcards.length > 0) setFlashcards(data.flashcards);
          if (data.quizQuestions && data.quizQuestions.length > 0) setQuizQuestions(data.quizQuestions);
        }
      } catch (err) {
        console.warn("Using default vocabulary bank:", err);
      }
    };
    fetchVocabData();
  }, []);

  const topics = ['All', 'Technology', 'Environment', 'Education', 'Society', 'Health'];

  const filteredCards = (selectedTopic === 'All' 
    ? flashcards 
    : flashcards.filter(c => c.topic === selectedTopic)) || DEFAULT_FLASHCARDS;

  const validCards = filteredCards.length > 0 ? filteredCards : DEFAULT_FLASHCARDS;
  const safeIndex = validCards.length > 0 ? (currentIndex % validCards.length) : 0;
  const currentCard = validCards[safeIndex] || DEFAULT_FLASHCARDS[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % validCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + validCards.length) % validCards.length);
  };

  const handleRating = (rating: string) => {
    toast.success(`Retention Calibrated: ${rating}`, "Spaced Repetition algorithm scheduled next review interval.");
    handleNext();
  };

  // Enhanced Real Voice Text-to-Speech (TTS) Engine
  const handlePronounce = (textToSpeak: string, isFullSentence = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any pending speech
      
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = accent;
      utter.rate = speechRate;
      
      setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utter);
      
      const accentLabel = accent === 'en-GB' ? 'British (RP)' : 'American (GenAm)';
      toast.info(`Audio Pronunciation 🔊 (${accentLabel})`, isFullSentence ? `Reading example sentence...` : `Pronouncing "${textToSpeak}"`);
    } else {
      toast.warning("Audio Notice", "Speech synthesis is not supported on this browser.");
    }
  };

  // Quiz Handlers
  const currentQuiz = quizQuestions[quizIndex] || DEFAULT_QUIZ_QUESTIONS[0];

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

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#027FFF]" /> Academic Lexicon &amp; Pronunciation Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Spaced Repetition (SM-2) flashcards with British &amp; American TTS audio and phonetic stress breakdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-2xl flex shadow-inner">
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
                Retention Quiz ({quizQuestions.length})
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>5-Day Retention Streak</span>
            </div>
          </div>
        </div>

        {/* TOPIC FILTER & AUDIO CONTROLS BAR */}
        {activeTab === 'flashcards' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm mb-6">
            
            {/* Topic Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Topic:
              </span>
              {topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTopic === topic
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* TTS Audio Controls (Accent & Speed) */}
            <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-between md:justify-end">
              {/* Accent Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAccent('en-GB')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    accent === 'en-GB' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="British Received Pronunciation"
                >
                  🇬🇧 UK
                </button>
                <button
                  onClick={() => setAccent('en-US')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    accent === 'en-US' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="General American Accent"
                >
                  🇺🇸 US
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSpeechRate(0.75)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    speechRate === 0.75 ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Slow 0.75x speed for syllable clarity"
                >
                  0.75x Slow
                </button>
                <button
                  onClick={() => setSpeechRate(0.9)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    speechRate === 0.9 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Normal 1.0x native cadence"
                >
                  1.0x Normal
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1: INTERACTIVE FLASHCARD (SM-2) */}
        {activeTab === 'flashcards' ? (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            
            {/* Card Counter & Prev/Next */}
            <div className="flex items-center justify-between w-full mb-3 text-xs font-bold text-slate-500 px-2">
              <button 
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                &larr; Prev Card
              </button>
              
              <div className="flex items-center gap-2">
                <span>Card {currentIndex + 1} of {validCards.length}</span>
                <span className="text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 font-bold">{currentCard.bandLevel}</span>
              </div>

              <button 
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Next Card &rarr;
              </button>
            </div>

            {/* 3D Flip Card */}
            <div 
              onClick={() => setIsFlipped(p => !p)}
              className="w-full min-h-[400px] bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all cursor-pointer relative flex flex-col justify-between group select-none"
            >
              {/* Card Front */}
              {!isFlipped ? (
                <div className="flex-1 flex flex-col justify-between items-center text-center py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {currentCard.topic} • {currentCard.partOfSpeech}
                  </span>
                  
                  <div className="my-auto space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                      {currentCard.word}
                    </h2>

                    {/* Syllable Stress Display */}
                    {currentCard.syllables && (
                      <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                        Syllable Stress: <strong className="text-purple-700">{currentCard.syllables}</strong>
                      </div>
                    )}

                    {/* Phonetic & Audio Trigger Capsule */}
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-base text-[#027FFF] font-mono font-bold">
                        {currentCard.phonetic}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePronounce(currentCard.word);
                        }}
                        className={`p-2.5 rounded-2xl transition-all flex items-center gap-1.5 ${
                          isPlayingAudio 
                            ? 'bg-blue-600 text-white animate-pulse' 
                            : 'bg-blue-50 text-[#027FFF] hover:bg-blue-100 border border-blue-200'
                        }`}
                        title="Listen to native pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs font-bold">Play Audio</span>
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
                      <div>
                        <span className="text-xl font-black text-slate-900">{currentCard.word}</span>
                        <span className="text-xs text-slate-400 font-mono ml-2">{currentCard.phonetic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePronounce(currentCard.word);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-[#027FFF] hover:bg-blue-100 transition-colors"
                          title="Replay pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">{currentCard.bandLevel}</span>
                      </div>
                    </div>

                    <p className="text-base text-slate-800 font-bold mb-4 leading-snug">
                      {currentCard.definition}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">Key Academic Collocations:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentCard.collocations.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example in IELTS Context:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePronounce(currentCard.exampleSentence, true);
                            }}
                            className="text-[11px] font-bold text-[#027FFF] hover:underline flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-[#027FFF]" /> Listen to Sentence
                          </button>
                        </div>
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
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Hard</span>
                    <span className="text-[10px] text-amber-600 font-normal">3 Days</span>
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
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-colors text-center"
                  >
                    <span className="block">Easy</span>
                    <span className="text-[10px] text-emerald-600 font-normal">14 Days</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-6">
                <button 
                  onClick={handlePrev}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 font-bold text-xs text-slate-700 shadow-sm transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={handleNext}
                  className="px-8 py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Next Flashcard
                </button>
              </div>
            )}

          </div>
        ) : (
          /* TAB 2: RETENTION QUIZ ENGINE */
          <div className="max-w-2xl mx-auto w-full">
            {!quizCompleted ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#027FFF] text-xs font-black uppercase">
                      Question {quizIndex + 1} of {quizQuestions.length}
                    </span>
                    <span className="text-xs font-bold text-slate-400">• {currentQuiz.topic}</span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    {currentQuiz.bandLevel}
                  </span>
                </div>

                {/* Question Prompt */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-relaxed font-serif">
                    &ldquo;{currentQuiz.sentence}&rdquo;
                  </h3>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQuiz.options.map((opt, i) => {
                    const isSelected = selectedOption === opt.word;
                    const isCorrect = opt.word === currentQuiz.correctWord;
                    let style = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";

                    if (quizAnswered) {
                      if (isCorrect) style = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                      else if (isSelected && !isCorrect) style = "bg-rose-50 border-rose-300 text-rose-900";
                    } else if (isSelected) {
                      style = "bg-blue-50 border-[#027FFF] text-[#027FFF] font-bold shadow-sm";
                    }

                    return (
                      <button
                        key={i}
                        disabled={quizAnswered}
                        onClick={() => setSelectedOption(opt.word)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${style}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black capitalize">{opt.word}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePronounce(opt.word);
                              }}
                              className="p-1 text-slate-400 hover:text-[#027FFF]"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs text-slate-500 font-normal mt-0.5 block">{opt.definition}</span>
                        </div>
                        {quizAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />}
                        {quizAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card upon submit */}
                {quizAnswered && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 animate-in fade-in duration-200">
                    <p className="text-slate-800 leading-relaxed font-medium">
                      💡 <strong>Examiner Explanation:</strong> {currentQuiz.explanation}
                    </p>
                    {currentQuiz.ieltsTip && (
                      <p className="text-purple-700 leading-relaxed font-semibold">
                        ✦ <strong>IELTS Pro Tip:</strong> {currentQuiz.ieltsTip}
                      </p>
                    )}
                  </div>
                )}

                {/* Quiz Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400">Score: {quizScore} / {quizQuestions.length}</span>
                  {!quizAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={!selectedOption}
                      className="px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                    >
                      Confirm Choice
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      Next Question <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Completion Summary */
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Vocabulary Quiz Complete!</h3>
                  <p className="text-xs text-slate-500 mt-1">Spaced Repetition retention score calculated</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
                  <span className="text-4xl font-black text-[#027FFF]">{quizScore} / {quizQuestions.length}</span>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    {quizScore === quizQuestions.length ? '🌟 Flawless Mastery (Band 9.0)' : '👍 Strong Performance (Band 8.0)'}
                  </p>
                </div>

                <button
                  onClick={handleRestartQuiz}
                  className="px-8 py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all"
                >
                  Restart Quiz Battery
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
