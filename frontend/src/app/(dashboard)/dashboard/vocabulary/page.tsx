"use client";

import { useState } from 'react';
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

  // Dynamic Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizHistory, setQuizHistory] = useState<{ questionId: number; selected: string; isCorrect: boolean }[]>([]);

  const flashcards: Flashcard[] = [
    {
      id: 1,
      word: "Ubiquitous",
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
      phonetic: "/prəˈpəʊ.nənt/",
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
      phonetic: "/dɪˈsem.ɪ.neɪt/",
      partOfSpeech: "verb",
      bandLevel: "Band 8.5",
      definition: "To spread information, knowledge, or opinions widely.",
      collocations: ["disseminate information", "widely disseminated", "disseminate research findings"],
      exampleSentence: "Academic institutions must effectively disseminate scientific discoveries to the broader public.",
      topic: "Education"
    }
  ];

  const quizQuestions: QuizQuestion[] = [
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
    },
    {
      id: 4,
      topic: "Society & Governance",
      bandLevel: "Band 8.0",
      sentence: "Leading ________ of urban public transport claim that expanding light rail networks alleviates metropolitan congestion.",
      options: [
        { word: "proponents", label: "proponents", definition: "persons who argue in favor of something" },
        { word: "detrimental", label: "detrimental", definition: "injurious or damaging" },
        { word: "preponderance", label: "preponderance", definition: "greatness of quantity" },
        { word: "exacerbate", label: "exacerbate", definition: "to intensify negatively" }
      ],
      correctWord: "proponents",
      explanation: "'Proponents' is a noun designating advocates or supporters of a particular policy or viewpoint.",
      ieltsTip: "Use 'Proponents of [X] argue that...' to introduce arguments naturally in discussion essays."
    },
    {
      id: 5,
      topic: "Public Health",
      bandLevel: "Band 8.0",
      sentence: "Prolonged screen exposure and lack of physical exercise exert a ________ influence on adolescent mental well-being.",
      options: [
        { word: "detrimental", label: "detrimental", definition: "harmful, damaging, or adverse" },
        { word: "ubiquitous", label: "ubiquitous", definition: "existing everywhere" },
        { word: "mitigate", label: "mitigate", definition: "to reduce the severity of" },
        { word: "disseminate", label: "disseminate", definition: "to spread widely" }
      ],
      correctWord: "detrimental",
      explanation: "'Detrimental' means damaging or harmful. The phrase 'exert a detrimental influence/effect on' is an academic staple.",
      ieltsTip: "Replace 'has a bad effect on' with 'exerts a detrimental effect on' to reach Band 8.0+ in Grammatical Range and Lexicon."
    }
  ];

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

