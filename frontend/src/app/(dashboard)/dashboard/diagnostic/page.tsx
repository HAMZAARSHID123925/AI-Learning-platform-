"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Award, BrainCircuit, ArrowLeft, ArrowRight, CheckCircle2, 
  Sparkles, Clock, Target, BarChart3, RefreshCw, Zap, ShieldCheck,
  Code2, BookOpen, MessageSquare, Terminal, Cpu, Globe, GraduationCap,
  Printer
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
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
    id: "computer_science",
    title: "Computer Science & Python",
    shortDesc: "Computational logic, algorithmic time complexity (Big-O), data structures, and Python programming fundamentals.",
    badge: "CS & Software Engineering",
    iconName: "Code2",
    color: "from-blue-600 to-indigo-700",
    durationMinutes: 8,
    questionCount: 5,
    skills: ["Big-O Complexity", "Recursive Trees & Stacks", "Python Comprehensions", "REST API Semantics", "ACID Transactions"],
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
        category: "Database Engineering",
        prompt: "In relational database transactions, what does the 'I' in the ACID acronym guarantee?",
        options: [
          "Isolation (Concurrent transactions execute without interference)",
          "Integrity (Data types match schema constraints)",
          "Indexing (B-Tree lookups are automatically generated)",
          "Idempotency (Queries can be retried without duplicate writes)"
        ],
        correctAnswer: "Isolation (Concurrent transactions execute without interference)",
        impactMetric: "ACID Concurrency Compliance",
        explanation: "Isolation ensures concurrent transactions execute in a manner that leaves the database in the same state as if they had executed serially."
      }
    ]
  },
  {
    id: "mathematics",
    title: "Higher Mathematics & Calculus",
    shortDesc: "Differential calculus, linear transformations, quadratic equations, and geometric problem solving.",
    badge: "STEM & Applied Mathematics",
    iconName: "BrainCircuit",
    color: "from-amber-600 to-orange-700",
    durationMinutes: 8,
    questionCount: 5,
    skills: ["Derivatives & Rates of Change", "Matrix Algebra", "Quadratic Roots", "Definite Integrals", "Vector Operations"],
    questions: [
      {
        id: 1,
        category: "Calculus",
        prompt: "What is the derivative of f(x) = 3x³ - 5x² + 7 with respect to x?",
        options: [
          "f'(x) = 9x² - 10x",
          "f'(x) = 9x³ - 10x² + 7",
          "f'(x) = 6x² - 5x",
          "f'(x) = 3x² - 5x + 7"
        ],
        correctAnswer: "f'(x) = 9x² - 10x",
        impactMetric: "Polynomial Power Rule Differentiation",
        explanation: "Applying the power rule d/dx[xⁿ] = n·xⁿ⁻¹ gives 3·3x² - 5·2x + 0 = 9x² - 10x."
      },
      {
        id: 2,
        category: "Algebra",
        prompt: "What are the roots of the quadratic equation x² - 7x + 12 = 0?",
        options: [
          "x = 3 and x = 4",
          "x = -3 and x = -4",
          "x = 2 and x = 6",
          "x = -2 and x = -6"
        ],
        correctAnswer: "x = 3 and x = 4",
        impactMetric: "Quadratic Factorization & Root Finding",
        explanation: "Factoring (x - 3)(x - 4) = 0 gives solutions x = 3 and x = 4."
      },
      {
        id: 3,
        category: "Linear Algebra",
        prompt: "What does the determinant of a 2x2 transformation matrix geometrically represent?",
        options: [
          "The scale factor by which the transformation alters area",
          "The perimeter of the transformed unit circle",
          "The exact angle of 2D rotation",
          "The number of eigenvalues in the vector space"
        ],
        correctAnswer: "The scale factor by which the transformation alters area",
        impactMetric: "Geometric Matrix Transformation",
        explanation: "The determinant of a 2x2 matrix measures the factor by which area expands or contracts under that linear mapping."
      },
      {
        id: 4,
        category: "Integral Calculus",
        prompt: "Evaluate the definite integral ∫ from 0 to 2 of (2x) dx:",
        options: [
          "4",
          "2",
          "8",
          "6"
        ],
        correctAnswer: "4",
        impactMetric: "Fundamental Theorem of Calculus",
        explanation: "The antiderivative is x². Evaluating from 0 to 2 gives 2² - 0² = 4."
      },
      {
        id: 5,
        category: "Probability",
        prompt: "If two fair 6-sided dice are rolled simultaneously, what is the probability of rolling a sum of 7?",
        options: [
          "6/36 (1/6)",
          "5/36",
          "7/36",
          "1/12"
        ],
        correctAnswer: "6/36 (1/6)",
        impactMetric: "Combinatorial Sample Space",
        explanation: "The combinations yielding 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) totaling 6 outcomes out of 36 (1/6)."
      }
    ]
  },
  {
    id: "academic_english",
    title: "Academic English & Rhetoric",
    shortDesc: "Band 8.5+ syntactic inversion, academic vocabulary collocations, and logical argumentation.",
    badge: "Linguistics & Advanced Writing",
    iconName: "GraduationCap",
    color: "from-emerald-600 to-teal-700",
    durationMinutes: 8,
    questionCount: 5,
    skills: ["Syntactic Inversion", "Academic Collocations", "Reading Deduction", "Subordinate Coordination", "Discourse Linkers"],
    questions: [
      {
        id: 1,
        category: "Grammar & Syntax",
        prompt: "Choose the grammatically advanced inversion structure to complete the sentence:",
        context: "________ the gravity of environmental degradation, governments would implement compulsory solar subsidies.",
        options: [
          "Were citizens to recognize",
          "If citizens understood",
          "Should citizens understood",
          "Citizens recognizing"
        ],
        correctAnswer: "Were citizens to recognize",
        impactMetric: "Conditional Subjunctive Inversion",
        explanation: "Conditional inversion with 'Were [subject] to [verb]' is a definitive marker of advanced Grammatical Range."
      },
      {
        id: 2,
        category: "Academic Collocations",
        prompt: "Which high-register phrase best replaces 'has a very bad effect on' in formal essays?",
        context: "Unregulated urbanization ________ local biodiversity and ecosystem equilibrium.",
        options: [
          "exerts a severely detrimental influence upon",
          "makes big trouble for",
          "creates huge bad damage to",
          "brings poor results against"
        ],
        correctAnswer: "exerts a severely detrimental influence upon",
        impactMetric: "C2 Academic Collocation Register",
        explanation: "'Exerts a severely detrimental influence upon' elevates the lexical score compared to basic conversational phrasing."
      },
      {
        id: 3,
        category: "Vocabulary Precision",
        prompt: "Select the most precise academic synonym for 'present everywhere simultaneously':",
        context: "Portable digital devices have become ________ in 21st-century educational environments.",
        options: [
          "ubiquitous",
          "preponderance",
          "momentous",
          "proponents"
        ],
        correctAnswer: "ubiquitous",
        impactMetric: "Lexicon Precision (C2 Register)",
        explanation: "'Ubiquitous' specifically denotes existing or being encountered everywhere simultaneously."
      },
      {
        id: 4,
        category: "Complex Coordination",
        prompt: "Select the sentence with impeccable punctuation and cohesive coordination:",
        options: [
          "While international tourism generates substantial revenue, it frequently precipitates ecological degradation.",
          "Although international tourism generates substantial economic revenue; it frequently leads to environmental degradation.",
          "International tourism generates substantial revenue, however, it damages local flora.",
          "International tourism generates revenue, because of this local flora is damaged."
        ],
        correctAnswer: "While international tourism generates substantial revenue, it frequently precipitates ecological degradation.",
        impactMetric: "Subordinate Clause Coordination",
        explanation: "The dependent clause beginning with 'While' followed cleanly by a comma and independent clause represents correct academic syntax."
      },
      {
        id: 5,
        category: "Discourse Linkers",
        prompt: "Choose the optimal discourse linker to introduce a counter-perspective:",
        context: "Many argue that online education lacks social immersion. ________, empirical surveys reveal high student engagement.",
        options: [
          "Notwithstanding this assertion",
          "Conversly / On the other side",
          "At the end of the day",
          "As a matter of fact"
        ],
        correctAnswer: "Notwithstanding this assertion",
        impactMetric: "Advanced Discourse Nuance",
        explanation: "'Notwithstanding this assertion' is an exemplary transitional phrase that substantiates nuanced argumentation."
      }
    ]
  },
  {
    id: "applied_science",
    title: "Applied Science & Physics",
    shortDesc: "Newtonian mechanics, gravitational orbits, energy thermodynamics, and empirical inquiry.",
    badge: "Physical Sciences & Research",
    iconName: "Globe",
    color: "from-purple-600 to-pink-700",
    durationMinutes: 8,
    questionCount: 5,
    skills: ["Kinematics & Gravity", "Thermodynamics", "Electromagnetism", "Scientific Method", "Orbital Mechanics"],
    questions: [
      {
        id: 1,
        category: "Classical Mechanics",
        prompt: "According to Newton's Second Law of Motion, if net force F is doubled while mass m remains constant, what happens to acceleration a?",
        options: [
          "Acceleration doubles (a' = 2a)",
          "Acceleration is halved (a' = a/2)",
          "Acceleration quadruples (a' = 4a)",
          "Acceleration remains unchanged"
        ],
        correctAnswer: "Acceleration doubles (a' = 2a)",
        impactMetric: "Newtonian Force Proportionality",
        explanation: "F = ma ➔ a = F/m. Doubling force F directly doubles acceleration a."
      },
      {
        id: 2,
        category: "Astrophysics & Gravity",
        prompt: "How does the gravitational force between two planets change if the distance between their centers is tripled?",
        options: [
          "It decreases to 1/9 of its original strength",
          "It decreases to 1/3 of its original strength",
          "It increases by 3 times",
          "It decreases to 1/6 of its original strength"
        ],
        correctAnswer: "It decreases to 1/9 of its original strength",
        impactMetric: "Inverse-Square Law Formulation",
        explanation: "Newton's law of universal gravitation follows an inverse-square relationship F ∝ 1/r². Tripling r scales force by 1/3² = 1/9."
      },
      {
        id: 3,
        category: "Thermodynamics",
        prompt: "What fundamental physical principle states that total energy in an isolated system remains constant over time?",
        options: [
          "First Law of Thermodynamics (Conservation of Energy)",
          "Second Law of Thermodynamics (Entropy Increase)",
          "Bernoulli's Principle",
          "Heisenberg Uncertainty Principle"
        ],
        correctAnswer: "First Law of Thermodynamics (Conservation of Energy)",
        impactMetric: "Thermodynamic Energy Conservation",
        explanation: "The First Law of Thermodynamics establishes that energy cannot be created or destroyed, only converted from one form to another."
      },
      {
        id: 4,
        category: "Optics & Waves",
        prompt: "What wave phenomenon describes the change in observed frequency when a wave source moves relative to an observer?",
        options: [
          "Doppler Effect",
          "Refraction",
          "Diffraction",
          "Photoelectric Effect"
        ],
        correctAnswer: "Doppler Effect",
        impactMetric: "Wave Mechanics & Frequency Shift",
        explanation: "The Doppler Effect causes a higher pitch/frequency as a source approaches and lower frequency as it recedes."
      },
      {
        id: 5,
        category: "Electromagnetism",
        prompt: "Which particle carries the fundamental negative electric charge in atomic structures?",
        options: [
          "Electron",
          "Proton",
          "Neutron",
          "Positron"
        ],
        correctAnswer: "Electron",
        impactMetric: "Atomic & Particle Physics",
        explanation: "Electrons carry a fundamental negative electrical charge (-1.602 × 10⁻¹⁹ C) orbiting the atomic nucleus."
      }
    ]
  }
];

export default function DashboardDiagnosticPage() {
  const router = useRouter();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("computer_science");
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
      let correct = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) correct++;
      });

      const accuracyPct = Math.round((correct / questions.length) * 100);

      if (typeof window !== "undefined") {
        localStorage.setItem(`diagnostic_${activeSubject.id}_score`, correct.toString());
        localStorage.setItem(`diagnostic_${activeSubject.id}_accuracy`, accuracyPct.toString());
        localStorage.setItem(`diagnostic_${activeSubject.id}_completed`, "true");
        localStorage.setItem("diagnostic_last_subject", activeSubject.id);
      }

      setIsSubmitting(false);
      setCurrentStep("results");
      toast.success(`${activeSubject.title} Complete! 🎯`, "Diagnostic score and customized curriculum generated.");
    }, 1000);
  };

  // Score Calculation
  let correctCount = 0;
  questions.forEach(q => {
    if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
  });

  const accuracyPct = Math.round((correctCount / questions.length) * 100);

  let estimatedLevel = "Intermediate";
  let scoreBadge = "92% (A)";
  let recommendedTrack = "Full-Stack Computer Science & Python Mastery";
  let recommendedCourseId = "cs-101";

  if (activeSubject.id === "computer_science") {
    recommendedCourseId = "cs-101";
    if (correctCount >= 4) {
      scoreBadge = "98% (A+)";
      estimatedLevel = "Advanced CS Specialist";
      recommendedTrack = "Full-Stack Computer Science & Python Mastery (Module 3 & 4 Acceleration)";
    } else if (correctCount >= 2) {
      scoreBadge = "84% (B+)";
      estimatedLevel = "Intermediate Programmer";
      recommendedTrack = "Full-Stack Computer Science & Python Mastery (Core Data Structures)";
    } else {
      scoreBadge = "68% (C)";
      estimatedLevel = "Foundational Learner";
      recommendedTrack = "Full-Stack Computer Science & Python Mastery (Syntax & Logic Sprint)";
    }
  } else if (activeSubject.id === "mathematics") {
    recommendedCourseId = "math-301";
    if (correctCount >= 4) {
      scoreBadge = "96% (A+)";
      estimatedLevel = "Advanced Calculus Mastery";
      recommendedTrack = "Advanced Mathematics, Calculus & Linear Algebra (Multivariable Track)";
    } else if (correctCount >= 2) {
      scoreBadge = "82% (B+)";
      estimatedLevel = "Intermediate Mathematics";
      recommendedTrack = "Advanced Mathematics, Calculus & Linear Algebra (Differential Equations)";
    } else {
      scoreBadge = "65% (C)";
      estimatedLevel = "Algebraic Foundation";
      recommendedTrack = "Advanced Mathematics, Calculus & Linear Algebra (Core Algebra)";
    }
  } else if (activeSubject.id === "academic_english") {
    recommendedCourseId = "eng-201";
    if (correctCount >= 4) {
      scoreBadge = "Band 8.5+ (C2)";
      estimatedLevel = "C2 Academic Mastery";
      recommendedTrack = "Academic English, Rhetoric & Advanced Writing (Syntactic Inversion)";
    } else if (correctCount >= 2) {
      scoreBadge = "Band 7.5 (C1)";
      estimatedLevel = "C1 Operational Proficiency";
      recommendedTrack = "Academic English, Rhetoric & Advanced Writing (Essay Cohesion)";
    } else {
      scoreBadge = "Band 6.0 (B2)";
      estimatedLevel = "B2 Upper Intermediate";
      recommendedTrack = "Academic English, Rhetoric & Advanced Writing (Foundations)";
    }
  } else {
    // Applied Science
    recommendedCourseId = "sci-401";
    if (correctCount >= 4) {
      scoreBadge = "95% (A+)";
      estimatedLevel = "Advanced Physical Sciences";
      recommendedTrack = "Applied Physics, Mechanics & Space Exploration (Orbital Mechanics)";
    } else if (correctCount >= 2) {
      scoreBadge = "80% (B+)";
      estimatedLevel = "Intermediate Physics";
      recommendedTrack = "Applied Physics, Mechanics & Space Exploration (Newtonian Dynamics)";
    } else {
      scoreBadge = "62% (C)";
      estimatedLevel = "General Science Basics";
      recommendedTrack = "Applied Physics, Mechanics & Space Exploration (Core Principles)";
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* PERSISTENT DASHBOARD SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN VIEWPORT */}
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
                <span className="text-[#5BC0EB]">Multi-Discipline Diagnostic</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-[#027FFF]" />
                Universal Academy Diagnostic Placement
              </h1>
              <p className="text-xs lg:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Adaptive baseline tests across Computer Science, Higher Mathematics, Academic English, and Applied Sciences.
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
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-10 py-8">
          
          {/* STEP 1: CHOOSE SUBJECT */}
          {currentStep === "choose_subject" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#027FFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Select Diagnostic Discipline
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-3 mb-1">
                  Calibrate Your Academic Baseline
                </h2>
                <p className="text-xs text-slate-500 max-w-xl">
                  Select any subject track below to evaluate your skill mastery level and generate an AI-tailored study roadmap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SUBJECT_TRACKS.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-[#027FFF] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {subject.badge}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#027FFF]" />
                          <span>~{subject.durationMinutes} mins</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">
                        {subject.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {subject.shortDesc}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {subject.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] font-semibold text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        {subject.questionCount} Questions
                      </span>
                      <button
                        onClick={() => handleStartTest(subject.id)}
                        className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-[#027FFF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVE QUESTIONS */}
          {currentStep === "test" && currentQ && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-10 shadow-sm space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
              
              {/* Header & Progress */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentStep("choose_subject")}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Tracks
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
                      className={`w-full p-4 rounded-2xl border text-xs lg:text-sm font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
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
                  🎯 Focus: <strong className="text-slate-800">{currentQ.impactMetric}</strong>
                </span>

                <button
                  onClick={handleNext}
                  disabled={!userSelected || isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Calibrating...</span>
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
                      {activeSubject.title} Verified
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Diagnostic Scorecard</h2>
                    <p className="text-xs text-slate-500">Benchmark assessment breakdown and learning recommendations.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => typeof window !== 'undefined' && window.print()}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Export or Print Diagnostic Scorecard"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span className="hidden sm:inline">Export PDF</span>
                  </button>

                  <div className="text-center px-5 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-[#027FFF] tracking-wider block">Assessed Level</span>
                    <span className="text-3xl font-black text-[#027FFF]">{scoreBadge}</span>
                  </div>
                  <div className="text-center px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Accuracy</span>
                    <span className="text-3xl font-black text-slate-900">{correctCount}/{questions.length}</span>
                  </div>
                </div>
              </div>

              {/* Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Skill Tier Placement</span>
                  <p className="text-base font-black text-slate-900">{estimatedLevel}</p>
                  <p className="text-xs text-slate-500">Overall test accuracy: <strong>{accuracyPct}%</strong> across evaluated competencies.</p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Recommended Track</span>
                  <p className="text-base font-black text-emerald-950">{recommendedTrack}</p>
                  <p className="text-xs text-emerald-700">Matched to your baseline performance.</p>
                </div>
              </div>

              {/* Question Breakdown List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#027FFF]" /> Question Analysis
                </h3>
                <div className="space-y-2">
                  {questions.map((q, idx) => {
                    const userAns = selectedAnswers[q.id];
                    const isCorrect = userAns === q.correctAnswer;
                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1 text-xs">
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
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => setCurrentStep("choose_subject")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Test Another Subject
                </button>

                <button
                  onClick={() => router.push(`/courses/${recommendedCourseId}`)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-[#027FFF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Course Pathway &rarr;</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
