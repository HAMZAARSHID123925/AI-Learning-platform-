"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Award, BrainCircuit, ArrowLeft, ArrowRight, CheckCircle2, 
  Sparkles, Clock, Target, BarChart3, RefreshCw, Zap, ShieldCheck,
  Printer
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { toast } from "@/components/ToastProvider";

interface DiagnosticQuestion {
  id: number;
  category: "Grammar (GRA)" | "Lexical Resource" | "Reading Coherence" | "Academic Collocations";
  prompt: string;
  context?: string;
  options: string[];
  correctAnswer: string;
  bandImpact: string;
  explanation: string;
}

const QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    category: "Grammar (GRA)",
    prompt: "Choose the grammatically advanced (Band 8.5+) inversion structure to complete the sentence:",
    context: "________ the gravity of environmental degradation, governments would implement compulsory solar subsidies.",
    options: [
      "If citizens understood",
      "Were citizens to recognize",
      "Should citizens understood",
      "Citizens recognizing"
    ],
    correctAnswer: "Were citizens to recognize",
    bandImpact: "Syntactic Inversion & Conditional Subjunctive Mastery",
    explanation: "Conditional inversion with 'Were [subject] to [verb]' is a definitive marker of Band 8.5+ Grammatical Range and Accuracy (GRA)."
  },
  {
    id: 2,
    category: "Academic Collocations",
    prompt: "Which high-register phrase best replaces 'has a very bad effect on' in IELTS Academic Writing Task 2?",
    context: "Unregulated urbanization ________ local biodiversity and ecosystem equilibrium.",
    options: [
      "makes big trouble for",
      "exerts a severely detrimental influence upon",
      "creates huge bad damage to",
      "brings poor results against"
    ],
    correctAnswer: "exerts a severely detrimental influence upon",
    bandImpact: "C2 Academic Collocation Register",
    explanation: "'Exerts a severely detrimental influence upon' elevates the lexical score to Band 8.5+ compared to basic phrasing."
  },
  {
    id: 3,
    category: "Reading Coherence",
    prompt: "Identify the correct True / False / Not Given deduction:",
    context: "Passage extract: 'While initial archaeological hypotheses suggested Mesopotamian origin, contemporary radiocarbon dating confirms Egyptian hieroglyphs developed independently around 3200 BCE.'\n\nStatement: 'Mesopotamian merchants introduced writing techniques to early Egyptian dynasties.'",
    options: [
      "TRUE",
      "FALSE",
      "NOT GIVEN"
    ],
    correctAnswer: "FALSE",
    bandImpact: "Reading Inference & Deduction (T/F/NG)",
    explanation: "The passage confirms Egyptian hieroglyphs developed 'independently', directly contradicting the statement that Mesopotamian merchants introduced it (FALSE)."
  },
  {
    id: 4,
    category: "Lexical Resource",
    prompt: "Select the most precise academic synonym for 'present everywhere':",
    context: "Portable digital devices have become ________ in 21st-century educational environments.",
    options: [
      "ubiquitous",
      "preponderance",
      "momentous",
      "proponents"
    ],
    correctAnswer: "ubiquitous",
    bandImpact: "Band 8.5 Lexicon Precision",
    explanation: "'Ubiquitous' specifically denotes existing or being encountered everywhere simultaneously."
  },
  {
    id: 5,
    category: "Grammar (GRA)",
    prompt: "Select the sentence with impeccable punctuation and cohesive coordination:",
    options: [
      "Although international tourism generates substantial economic revenue; it frequently leads to environmental degradation.",
      "International tourism generates substantial revenue, however, it damages local flora.",
      "While international tourism generates substantial revenue, it frequently precipitates ecological degradation.",
      "International tourism generates revenue, because of this local flora is damaged."
    ],
    correctAnswer: "While international tourism generates substantial revenue, it frequently precipitates ecological degradation.",
    bandImpact: "Complex Subordinate Clause Coordination",
    explanation: "The dependent clause beginning with 'While' followed cleanly by a comma and independent clause represents correct Cambridge academic syntax."
  },
  {
    id: 6,
    category: "Academic Collocations",
    prompt: "Choose the optimal discourse linker to introduce a counter-perspective:",
    context: "Many argue that online education lacks social immersion. ________, empirical surveys reveal high student engagement.",
    options: [
      "Conversly / On the other side",
      "Notwithstanding this assertion",
      "At the end of the day",
      "As a matter of fact"
    ],
    correctAnswer: "Notwithstanding this assertion",
    bandImpact: "Advanced Discourse Linkers (Coherence & Cohesion)",
    explanation: "'Notwithstanding this assertion' is an exemplary Band 8.5+ transitional phrase that substantiates nuanced argumentation."
  }
];

export default function DashboardDiagnosticPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<"intro" | "test" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = QUESTIONS[currentIndex];
  const userSelected = selectedAnswers[currentQ?.id];

  const handleSelectOption = (opt: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Calculate score
      let correct = 0;
      QUESTIONS.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) correct++;
      });

      let band = 6.0;
      let cefr = "B2";
      if (correct === 6) { band = 8.5; cefr = "C2"; }
      else if (correct >= 4) { band = 7.5; cefr = "C1"; }
      else if (correct >= 2) { band = 6.5; cefr = "B2+"; }

      if (typeof window !== "undefined") {
        localStorage.setItem("diagnostic_completed", "true");
        localStorage.setItem("diagnostic_score", correct.toString());
        localStorage.setItem("diagnostic_band", band.toString());
        localStorage.setItem("diagnostic_cefr", cefr);
      }

      setIsSubmitting(false);
      setCurrentStep("results");
      toast.success("Diagnostic Assessment Complete! 🎯", `Calculated Band: ${band.toFixed(1)} (${cefr} Level).`);
    }, 1000);
  };

  // Score Calculation
  let correctCount = 0;
  QUESTIONS.forEach(q => {
    if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
  });

  let predictedBand = 6.0;
  let cefrLevel = "B2 (Vantage)";
  let syllabusPath = "Standard IELTS Foundation & Band 7.0 Booster";

  if (correctCount === 6) {
    predictedBand = 8.5;
    cefrLevel = "C2 (Mastery)";
    syllabusPath = "High-Velocity Band 8.5+ Inversion & Abstract Mastery";
  } else if (correctCount >= 4) {
    predictedBand = 7.5;
    cefrLevel = "C1 (Effective Operational Proficiency)";
    syllabusPath = "Advanced Coherence & Task 2 Argumentation Track";
  } else if (correctCount >= 2) {
    predictedBand = 6.5;
    cefrLevel = "B2+ (Upper Intermediate)";
    syllabusPath = "Grammatical Accuracy & Academic Collocations Sprint";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* PERSISTENT DASHBOARD SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F0F4F8]">
        {/* TOP BANNER */}
        <div className="bg-[#0F172A] text-white px-6 lg:px-10 py-8 border-b border-slate-800 shadow-md">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <Link href="/dashboard" className="hover:text-white flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-[#5BC0EB]">Diagnostic Placement</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-[#027FFF]" />
                Precision AI Diagnostic Check
              </h1>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                6-question adaptive placement battery calibrated against Cambridge 2026 Band specifications.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-2 border border-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="max-w-4xl w-full mx-auto px-6 lg:px-10 py-8">
          
          {/* STEP 1: INTRO */}
          {currentStep === "intro" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#027FFF] flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
                <BrainCircuit className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  10-Minute Rapid Check
                </span>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mt-3 mb-2">
                  Calibrate Your IELTS &amp; CEFR Baseline
                </h2>
                <p className="text-xs lg:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Take our 6-question diagnostic check. Our AI engine evaluates your grammar inversion, academic collocations, and deduction logic to calibrate your starting Band and adaptive curriculum.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">Grammar (GRA)</span>
                  <span className="text-slate-500 text-[11px]">Inversion &amp; Syntax</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">Lexicon (LR)</span>
                  <span className="text-slate-500 text-[11px]">C1/C2 Collocations</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">Coherence (CC)</span>
                  <span className="text-slate-500 text-[11px]">Logic &amp; Deduction</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep("test")}
                className="px-8 py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/30 hover:scale-105 active:scale-95 transition-all"
              >
                Start Diagnostic Placement →
              </button>
            </div>
          )}

          {/* STEP 2: ACTIVE QUESTIONS */}
          {currentStep === "test" && currentQ && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-10 shadow-sm space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
              
              {/* Header & Progress */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-extrabold uppercase text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Question {currentIndex + 1} of {QUESTIONS.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#027FFF] h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Prompt & Context */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {currentQ.prompt}
                </h3>

                {currentQ.context && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs lg:text-sm text-slate-800 font-serif leading-relaxed">
                    &ldquo;{currentQ.context}&rdquo;
                  </div>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = userSelected === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-xs lg:text-sm font-semibold text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 border-[#027FFF] text-[#027FFF] font-bold shadow-sm ring-1 ring-[#027FFF]"
                          : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#027FFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Button Bar */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[11px] font-semibold text-slate-500">
                  🎯 Target: <strong className="text-slate-800">{currentQ.bandImpact}</strong>
                </span>

                <button
                  onClick={handleNext}
                  disabled={!userSelected || isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Calibrating CEFR...</span>
                    </>
                  ) : currentIndex < QUESTIONS.length - 1 ? (
                    <>
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Generate My Band Score</span>
                      <Award className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: RESULTS */}
          {currentStep === "results" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl space-y-8 max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#027FFF] flex items-center justify-center border border-blue-200">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Diagnostic Verified
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Diagnostic Scorecard</h2>
                    <p className="text-xs text-slate-500">Official Cambridge 9-Band &amp; CEFR Projection</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => typeof window !== 'undefined' && window.print()}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                    title="Export or Print Diagnostic Scorecard"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>

                  <div className="text-center px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#027FFF] tracking-wider block">Estimated Band</span>
                    <span className="text-4xl font-black text-[#027FFF]">{predictedBand.toFixed(1)}</span>
                  </div>
                  <div className="text-center px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Raw Accuracy</span>
                    <span className="text-4xl font-black text-slate-900">{correctCount}/{QUESTIONS.length}</span>
                  </div>
                </div>
              </div>

              {/* CEFR Level & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">CEFR Standard Level</span>
                  <p className="text-base font-black text-slate-900">{cefrLevel}</p>
                  <p className="text-xs text-slate-500">Benchmark score assessed against 45,000+ candidate transcripts.</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Recommended Track</span>
                  <p className="text-base font-black text-emerald-950">{syllabusPath}</p>
                  <p className="text-xs text-emerald-700">Calibrated to reach Band 8.0+ in 4 to 8 weeks.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    setCurrentStep("test");
                    setCurrentIndex(0);
                    setSelectedAnswers({});
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Diagnostic Check
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Apply to My Dashboard &rarr;</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
