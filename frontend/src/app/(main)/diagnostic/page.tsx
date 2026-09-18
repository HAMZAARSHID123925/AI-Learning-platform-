"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Award, BrainCircuit, ArrowLeft, ArrowRight, CheckCircle2, 
  Sparkles, Clock, Target, BarChart3, RefreshCw, Zap, ShieldCheck,
  Code2, BookOpen, MessageSquare, Terminal, Cpu, Globe, GraduationCap
} from "lucide-react";
import { toast } from "@/components/ToastProvider";

interface DiagnosticQuestion {
  id: number;
  category: string;
  prompt: string;
  context?: string;
  options: string[];
  correctAnswer: string;
  impactMetric: string;
  explanation: string;
}

interface SubjectTrack {
  id: string;
  title: string;
  shortDesc: string;
  badge: string;
  iconName: string;
  color: string;
  durationMinutes: number;
  questionCount: number;
  skills: string[];
  questions: DiagnosticQuestion[];
}

const SUBJECT_TRACKS: SubjectTrack[] = [
  {
    id: "ielts_academic",
    title: "IELTS & Academic English",
    shortDesc: "Cambridge Band 9.0 grammar inversion, lexical resource collocations, and T/F/NG deduction.",
    badge: "Official Cambridge Criteria",
    iconName: "GraduationCap",
    color: "from-blue-600 to-indigo-700",
    durationMinutes: 10,
    questionCount: 6,
    skills: ["Syntactic Inversion", "Academic Collocations", "Reading Deduction", "Subordinate Clauses"],
    questions: [
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
        impactMetric: "Syntactic Inversion & Conditional Subjunctive Mastery",
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
        impactMetric: "C2 Academic Collocation Register",
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
        impactMetric: "Reading Inference & Deduction (T/F/NG)",
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
        impactMetric: "Band 8.5 Lexicon Precision",
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
        impactMetric: "Complex Subordinate Clause Coordination",
        explanation: "The dependent clause beginning with 'While' followed cleanly by a comma and independent clause represents correct Cambridge academic syntax."
      },
      {
        id: 6,
        category: "Cohesion & Transition",
        prompt: "Choose the optimal discourse linker to introduce a counter-perspective in Task 2:",
        context: "Many argue that online education lacks social immersion. ________, empirical surveys reveal high student engagement.",
        options: [
          "Conversly / On the other side",
          "Notwithstanding this assertion",
          "At the end of the day",
          "As a matter of fact"
        ],
        correctAnswer: "Notwithstanding this assertion",
        impactMetric: "Advanced Discourse Linkers (Coherence & Cohesion)",
        explanation: "'Notwithstanding this assertion' is an exemplary Band 8.5+ transitional phrase that substantiates nuanced argumentation."
      }
    ]
  },
  {
    id: "general_english",
    title: "General English & Fluency",
    shortDesc: "Everyday communication, CEFR grammar, situational idioms, and spoken sentence flow.",
    badge: "CEFR A1–C2 Standard",
    iconName: "Globe",
    color: "from-emerald-600 to-teal-700",
    durationMinutes: 8,
    questionCount: 5,
    skills: ["Verb Tenses & Conditionals", "Phrasal Verbs", "Prepositional Nuance", "Idiomatic Accuracy"],
    questions: [
      {
        id: 1,
        category: "Tenses & Aspect",
        prompt: "Select the most natural and grammatically correct option:",
        context: "By the time we arrive at the conference hall tomorrow morning, the keynote speaker ________ his presentation.",
        options: [
          "will have already begun",
          "will already begin",
          "already begins",
          "had already begun"
        ],
        correctAnswer: "will have already begun",
        impactMetric: "Future Perfect Aspect (C1 Mastery)",
        explanation: "The Future Perfect ('will have already begun') indicates an action that will be completed before a specified future time point."
      },
      {
        id: 2,
        category: "Phrasal Verbs",
        prompt: "Choose the phrasal verb that means 'to tolerate or endure a difficult situation':",
        context: "I really cannot ________ this continuous noise while trying to study for exams.",
        options: [
          "put up with",
          "give in to",
          "run out of",
          "look down on"
        ],
        correctAnswer: "put up with",
        impactMetric: "Idiomatic Phrasal Mastery",
        explanation: "'Put up with' means to tolerate or endure someone or something unpleasant."
      },
      {
        id: 3,
        category: "Conditionals",
        prompt: "Complete the third conditional sentence correctly:",
        context: "If she ________ about the traffic congestion, she would have taken the metro instead.",
        options: [
          "had known",
          "knew",
          "would know",
          "has known"
        ],
        correctAnswer: "had known",
        impactMetric: "Past Unreal Hypotheticals",
        explanation: "The third conditional takes 'had + past participle' in the if-clause and 'would have + past participle' in the main clause."
      },
      {
        id: 4,
        category: "Vocabulary & Register",
        prompt: "Select the phrase that is most appropriate for a professional workplace email:",
        options: [
          "I am writing to inquire regarding the project timeline update.",
          "Hey, tell me what is going on with the project.",
          "I want you to send me the project dates now.",
          "What is the status ASAP please?"
        ],
        correctAnswer: "I am writing to inquire regarding the project timeline update.",
        impactMetric: "Formal Business Register (B2/C1)",
        explanation: "'I am writing to inquire regarding...' provides the ideal polite, formal register for corporate communication."
      },
      {
        id: 5,
        category: "Prepositional Usage",
        prompt: "Choose the correct preposition to complete the sentence:",
        context: "She has been proficient ________ software engineering and data analysis since her undergraduate studies.",
        options: [
          "in",
          "at",
          "with",
          "for"
        ],
        correctAnswer: "in",
        impactMetric: "Collocational Prepositions",
        explanation: "'Proficient in' is the standard English collocation when referring to a skill, subject, or language."
      }
    ]
  },
  {
    id: "computer_science",
    title: "Computer Science & Programming",
    shortDesc: "Data structures, algorithmic complexity, Python syntax, and core software engineering concepts.",
    badge: "CS & Tech Diagnostic",
    iconName: "Code2",
    color: "from-purple-600 to-indigo-900",
    durationMinutes: 10,
    questionCount: 5,
    skills: ["Big-O Complexity", "Data Structures", "Python & JS Syntax", "System Fundamentals"],
    questions: [
      {
        id: 1,
        category: "Algorithmic Complexity",
        prompt: "What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black Tree)?",
        options: [
          "O(log n)",
          "O(n)",
          "O(1)",
          "O(n log n)"
        ],
        correctAnswer: "O(log n)",
        impactMetric: "Tree Search & Logarithmic Scaling",
        explanation: "A balanced BST halves the search space at each depth level, resulting in an O(log n) average and worst-case search complexity."
      },
      {
        id: 2,
        category: "Data Structures",
        prompt: "Which data structure operates on a Last-In, First-Out (LIFO) principle and is commonly used for function call stacks?",
        options: [
          "Stack",
          "Queue",
          "Hash Map",
          "Linked List"
        ],
        correctAnswer: "Stack",
        impactMetric: "LIFO Memory Architecture",
        explanation: "Stacks strictly follow Last-In, First-Out (LIFO), making them the foundation of call execution frames and recursive backtracking."
      },
      {
        id: 3,
        category: "Python Core",
        prompt: "What is the output of the following Python snippet?\n`nums = [1, 2, 3]; double = [x * 2 for x in nums if x > 1]`",
        options: [
          "[4, 6]",
          "[2, 4, 6]",
          "[2, 3]",
          "[4]"
        ],
        correctAnswer: "[4, 6]",
        impactMetric: "List Comprehension & Filtering",
        explanation: "The list comprehension filters items where `x > 1` (giving 2 and 3), and doubles them to yield `[4, 6]`."
      },
      {
        id: 4,
        category: "Web & API Architecture",
        prompt: "Which HTTP method is defined as idempotent and used to retrieve resources without modifying server state?",
        options: [
          "GET",
          "POST",
          "PATCH",
          "DELETE"
        ],
        correctAnswer: "GET",
        impactMetric: "RESTful HTTP Semantics",
        explanation: "HTTP GET requests are safe and idempotent; calling them multiple times produces identical outcomes without side effects."
      },
      {
        id: 5,
        category: "Concurrency & Memory",
        prompt: "In relational databases, what does the 'I' in the ACID transaction acronym stand for?",
        options: [
          "Isolation",
          "Integrity",
          "Indexing",
          "Idempotency"
        ],
        correctAnswer: "Isolation",
        impactMetric: "Database ACID Compliance",
        explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability."
      }
    ]
  },
  {
    id: "business_english",
    title: "Business & Executive Communication",
    shortDesc: "Executive reporting, client negotiations, diplomatic phrasing, and email etiquette.",
    badge: "Executive Workplace",
    iconName: "MessageSquare",
    color: "from-amber-600 to-orange-700",
    durationMinutes: 8,
    questionCount: 4,
    skills: ["Diplomatic Tone", "Stakeholder Negotiation", "Executive Summaries", "Email Register"],
    questions: [
      {
        id: 1,
        category: "Diplomatic Language",
        prompt: "Which sentence conveys constructive disagreement with maximum diplomatic tact?",
        options: [
          "While I appreciate your perspective, we might consider exploring alternative contingency options.",
          "Your proposal will definitely not work in this quarter.",
          "I disagree completely because your budget calculations are flawed.",
          "We cannot do what you said."
        ],
        correctAnswer: "While I appreciate your perspective, we might consider exploring alternative contingency options.",
        impactMetric: "Softened Assertions & Diplomatic Register",
        explanation: "Using modal softening ('might consider', 'while I appreciate') prevents defensiveness while steering strategy."
      },
      {
        id: 2,
        category: "Executive Precision",
        prompt: "Choose the most concise executive summary phrase to replace 'due to the fact that':",
        options: [
          "Because / As",
          "In light of the reality that",
          "Owing to the circumstance where",
          "Taking into true consideration that"
        ],
        correctAnswer: "Because / As",
        impactMetric: "Concision & Clutter Elimination",
        explanation: "Executive business writing prioritizes brevity; 'because' or 'as' directly replaces bloated 5-word phrases."
      },
      {
        id: 3,
        category: "Negotiation Terms",
        prompt: "In commercial contracting, what does a 'Force Majeure' clause protect against?",
        options: [
          "Unforeseeable external catastrophes (acts of God) preventing contract fulfillment",
          "Minor billing delays caused by currency fluctuations",
          "Staff resignations during peak delivery periods",
          "Marketing budget overspending"
        ],
        correctAnswer: "Unforeseeable external catastrophes (acts of God) preventing contract fulfillment",
        impactMetric: "Contractual Vocabulary",
        explanation: "Force Majeure relieves parties from liability upon the occurrence of extraordinary events beyond reasonable control."
      },
      {
        id: 4,
        category: "Client Relationship",
        prompt: "What is the best way to open an email acknowledging a customer complaint?",
        options: [
          "Thank you for bringing this issue to our attention. We are actively investigating...",
          "We received your complaint and will see if it is our fault.",
          "You should have contacted us earlier about this mistake.",
          "Why did this problem happen on your end?"
        ],
        correctAnswer: "Thank you for bringing this issue to our attention. We are actively investigating...",
        impactMetric: "Client Service Empathy & Assurance",
        explanation: "Opening with appreciation and immediate ownership establishes credibility and de-escalates tension."
      }
    ]
  }
];

export default function DiagnosticPlacementPage() {
  const router = useRouter();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ielts_academic");
  const [currentStep, setCurrentStep] = useState<"choose_subject" | "test" | "results">("choose_subject");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSubject = SUBJECT_TRACKS.find(s => s.id === selectedSubjectId) || SUBJECT_TRACKS[0];
  const questions = activeSubject.questions;
  const currentQ = questions[currentIndex] || questions[0];
  const userSelected = selectedAnswers[currentQ.id];

  const handleStartTest = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCurrentStep("test");
  };

  const handleSelectOption = (opt: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep("results");
      toast.success(`${activeSubject.title} Complete! 🎯`, "Diagnostic score and customized curriculum generated.");
    }, 1200);
  };

  // Score Calculation
  let correctCount = 0;
  questions.forEach(q => {
    if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
  });

  const accuracyPct = Math.round((correctCount / questions.length) * 100);

  // Subject-specific score interpretations
  let estimatedLevel = "Intermediate (B2)";
  let scoreBadge = "Band 7.0";
  let recommendedTrack = "Targeted Mastery Sprint";

  if (activeSubject.id === "ielts_academic") {
    if (correctCount === 6) {
      scoreBadge = "Band 8.5+";
      estimatedLevel = "C2 (Mastery)";
      recommendedTrack = "IELTS Band 8.5+ Inversion & Syntactic Mastery Course";
    } else if (correctCount >= 4) {
      scoreBadge = "Band 7.5";
      estimatedLevel = "C1 (Operational Proficiency)";
      recommendedTrack = "Academic Writing Task 2 & Speaking Fluency Track";
    } else if (correctCount >= 2) {
      scoreBadge = "Band 6.5";
      estimatedLevel = "B2+ (Upper Intermediate)";
      recommendedTrack = "Grammatical Range & Academic Collocations Sprint";
    } else {
      scoreBadge = "Band 5.5";
      estimatedLevel = "B1 (Intermediate)";
      recommendedTrack = "Core IELTS Foundation & Vocabulary Accelerator";
    }
  } else if (activeSubject.id === "general_english") {
    if (correctCount >= 4) {
      scoreBadge = "C1 / C2";
      estimatedLevel = "Advanced Fluent";
      recommendedTrack = "Nuanced Idiomatic English & Spoken Precision";
    } else if (correctCount >= 2) {
      scoreBadge = "B2";
      estimatedLevel = "Upper Intermediate";
      recommendedTrack = "Complex Tenses & Professional Speaking Mastery";
    } else {
      scoreBadge = "B1";
      estimatedLevel = "Intermediate";
      recommendedTrack = "English Grammar & Everyday Conversational Basics";
    }
  } else if (activeSubject.id === "computer_science") {
    if (correctCount >= 4) {
      scoreBadge = "Senior / Advanced";
      estimatedLevel = "Tier 1 CS Specialist";
      recommendedTrack = "Full-Stack System Design & Advanced Algorithms";
    } else if (correctCount >= 2) {
      scoreBadge = "Mid-Level";
      estimatedLevel = "Practicing Developer";
      recommendedTrack = "Data Structures, Python Optimization & API Architecture";
    } else {
      scoreBadge = "Junior / Foundation";
      estimatedLevel = "Tech Novice";
      recommendedTrack = "Python & Web Development Fundamentals";
    }
  } else {
    // Business English
    if (correctCount >= 3) {
      scoreBadge = "Executive Level";
      estimatedLevel = "C1 Corporate Register";
      recommendedTrack = "Executive Pitching & Stakeholder Negotiation Masterclass";
    } else {
      scoreBadge = "Associate Level";
      estimatedLevel = "B2 Business Communication";
      recommendedTrack = "Professional Workplace Email & Meeting Etiquette";
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#027FFF] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              PP
            </span>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              PPAcademia <span className="text-[#027FFF]">Diagnostic Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Subject Engine</span>
          </div>
        </div>

        {/* STEP 1: CHOOSE SUBJECT TRACK */}
        {currentStep === "choose_subject" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Customized Assessment Matrix
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Select Your Diagnostic Subject
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose a domain to benchmark your current skills. Our adaptive diagnostic testing engine evaluates your baseline proficiency in under 10 minutes.
              </p>
            </div>

            {/* Subject Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUBJECT_TRACKS.map((subject) => {
                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-3xl p-7 border-2 border-slate-200/80 hover:border-[#027FFF] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                          {subject.badge}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#027FFF]" />
                          <span>~{subject.durationMinutes} mins</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">
                          {subject.title}
                        </h2>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {subject.shortDesc}
                        </p>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {subject.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {subject.questionCount} Calibrated Questions
                      </span>
                      <button
                        onClick={() => handleStartTest(subject.id)}
                        className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Proof Strip */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 flex flex-wrap items-center justify-around gap-6 text-center text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Examiner-calibrated question bank</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant score &amp; telemetry breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Automatic personalized course matching</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE QUESTION TEST BATTERY */}
        {currentStep === "test" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-10 shadow-sm space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
            
            {/* Header & Progress */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentStep("choose_subject")}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Switch Subject
                  </button>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-extrabold uppercase text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {currentQ.category}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#027FFF] h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Prompt & Context */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {currentQ.prompt}
              </h2>

              {currentQ.context && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-line">
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
                    className={`w-full p-4 rounded-2xl border text-sm font-semibold text-left transition-all flex items-center justify-between ${
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
              <span className="text-xs font-semibold text-slate-500">
                🎯 Focus: <strong className="text-slate-800">{currentQ.impactMetric}</strong>
              </span>

              <button
                onClick={handleNext}
                disabled={!userSelected || isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-[#027FFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Submissions...</span>
                  </>
                ) : currentIndex < questions.length - 1 ? (
                  <>
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Generate Assessment Score</span>
                    <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: RESULTS & SCORECARD */}
        {currentStep === "results" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-12 shadow-xl space-y-8 max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#027FFF] flex items-center justify-center border border-blue-200 shrink-0">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {activeSubject.title} Verified
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Diagnostic Scorecard</h2>
                  <p className="text-xs text-slate-500">Calibrated assessment breakdown based on question accuracy.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-[#027FFF] tracking-wider block">Assessed Level</span>
                  <span className="text-3xl font-black text-[#027FFF]">{scoreBadge}</span>
                </div>
                <div className="text-center px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Raw Accuracy</span>
                  <span className="text-3xl font-black text-slate-900">{correctCount}/{questions.length}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Skill Tier Placement</span>
                <p className="text-base font-black text-slate-900">{estimatedLevel}</p>
                <p className="text-xs text-slate-500">Overall test accuracy: <strong>{accuracyPct}%</strong> across evaluated competencies.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Recommended Curriculum</span>
                <p className="text-base font-black text-emerald-950">{recommendedTrack}</p>
                <p className="text-xs text-emerald-700">Curated modules designed to accelerate your competency.</p>
              </div>
            </div>

            {/* Questions Detailed Review Accordion / List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#027FFF]" /> Detailed Question Breakdown
              </h3>
              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Q{idx + 1}: {q.prompt}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {isCorrect ? "Correct (+1.0)" : "Incorrect (0.0)"}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        <strong>Your answer:</strong> {userAns || "No answer"} {isCorrect ? "✓" : `(Correct: ${q.correctAnswer})`}
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
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setCurrentStep("choose_subject")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Test Another Subject
              </button>

              <button
                onClick={() => router.push("/courses")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>View Recommended Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
