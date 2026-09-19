"use client";

import React from "react";
import Link from "next/link";
import { 
  Code2, BrainCircuit, GraduationCap, Globe, Award, ShieldCheck, 
  Sparkles, Clock, Target, Users, CheckCircle2, ArrowRight, 
  BookOpen, Terminal, Atom, TrendingUp, Compass, Layers, 
  Lightbulb, Zap, Check, Cpu, BarChart3, ChevronRight, MessageSquare
} from "lucide-react";

export default function AboutPage() {
  const ACADEMY_METRICS = [
    { value: "4+", label: "Core Academic Disciplines", sub: "CS, Math, English & Sciences" },
    { value: "98.6%", label: "Curriculum Mastery Rate", sub: "Verified assessment benchmark" },
    { value: "45,000+", label: "Active Global Scholars", sub: "Across 140+ countries" },
    { value: "<10s", label: "AI Feedback Latency", sub: "Real-time step-by-step guidance" },
  ];

  const ACADEMY_PILLARS = [
    {
      icon: Code2,
      badge: "Software & Systems",
      title: "Computational Thinking & Software Engineering",
      color: "from-blue-600 to-indigo-700",
      accentBg: "bg-blue-50 text-[#027FFF] border-blue-200",
      description: "From Python fundamentals and algorithmic time complexity (Big-O) to full-stack microservices, relational databases, and distributed cloud computing.",
      skills: ["Data Structures & Algorithms", "Python 3.12 Sandboxes", "System Design & REST APIs", "Database Concurrency"]
    },
    {
      icon: BrainCircuit,
      badge: "STEM & Analysis",
      title: "Higher Mathematics & Analytical Calculus",
      color: "from-amber-600 to-orange-700",
      accentBg: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Rigorous mathematical reasoning covering differential calculus, multivariable optimization, linear algebra transformations, and combinatorial sample spaces.",
      skills: ["Differential & Integral Calculus", "Linear Transformations", "Matrix Algebra & Determinants", "Probability Modeling"]
    },
    {
      icon: GraduationCap,
      badge: "Humanities & Writing",
      title: "Academic Rhetoric & Advanced Linguistics",
      color: "from-emerald-600 to-teal-700",
      accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Precision communication training with Band 8.5+ syntactic inversion, high-register vocabulary collocations, critical discourse synthesis, and thesis writing.",
      skills: ["Syntactic Inversion Structures", "C2 Academic Collocations", "Logical Deduction & Thesis Defense", "Discourse Cohesion"]
    },
    {
      icon: Atom,
      badge: "Empirical Research",
      title: "Applied Physics & Space Sciences",
      color: "from-purple-600 to-pink-700",
      accentBg: "bg-purple-50 text-purple-700 border-purple-200",
      description: "Investigating the fundamental laws of nature: Newtonian mechanics, thermodynamics, electromagnetism, wave Doppler optics, and orbital astrophysics.",
      skills: ["Classical Mechanics & Kinematics", "Thermodynamic Conservation", "Wave & Particle Dynamics", "Orbital Gravity Models"]
    }
  ];

  const FACULTY_MEMBERS = [
    {
      name: "Dr. Alan Turing-Vance",
      role: "Dean of Computer Science & Systems",
      credentials: "Ph.D. Computer Science, Cambridge",
      experience: "Ex-DeepMind Research Fellow. 14+ years architecting distributed systems, neural compilers, and automated algorithmic problem sets.",
      badge: "Computer Science",
      icon: Code2,
      badgeColor: "bg-blue-50 text-[#027FFF] border-blue-200"
    },
    {
      name: "Prof. Katherine Chen, Ph.D.",
      role: "Chair of Applied Mathematics",
      credentials: "Ph.D. Pure Mathematics, MIT",
      experience: "Former Stanford Faculty. Author of over 30 peer-reviewed papers on linear transformations, differential geometry, and numerical optimization.",
      badge: "Mathematics",
      icon: BrainCircuit,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      name: "Prof. Eleanor Vance",
      role: "Director of Linguistics & Rhetoric",
      credentials: "M.A. Applied Linguistics, Oxford",
      experience: "Senior international exam auditor and Cambridge assessor. Mentored 15,000+ candidates through high-register academic writing and rhetorical debate.",
      badge: "Academic English",
      icon: GraduationCap,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      name: "Dr. Julian Thorne",
      role: "Head of Physical Sciences",
      credentials: "Ph.D. Astrophysics, Caltech",
      experience: "CERN visiting scholar specializing in quantum thermodynamics, orbital gravitational dynamics, and laboratory empirical modeling.",
      badge: "Physical Sciences",
      icon: Atom,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ];

  const PEDAGOGY_STEPS = [
    {
      step: "01",
      title: "Calibrated Diagnostic Placement",
      description: "Zero-cost diagnostic battery across your chosen discipline evaluates exact baseline competency in under 8 minutes."
    },
    {
      step: "02",
      title: "Targeted Micro-Curriculum",
      description: "Adaptive algorithms assemble modular lessons, removing redundant material and zeroing in on high-leverage skill gaps."
    },
    {
      step: "03",
      title: "Interactive Sandbox & Live Mentorship",
      description: "Write live code in browser sandboxes, solve mathematical proofs on collaborative canvases, and attend live faculty seminars."
    },
    {
      step: "04",
      title: "Continuous Telemetry & Mastery Verification",
      description: "Automated rubrics evaluate homework, projects, and mock examinations with granular telemetry, verified certificates, and XP tracking."
    }
  ];

  return (
    <main className="w-full min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#027FFF]/20 selection:text-[#027FFF] relative overflow-hidden pb-20">
      
      {/* 1. PREMIUM DARK HERO SECTION */}
      <section className="relative w-full pt-20 md:pt-28 pb-32 overflow-hidden bg-gradient-to-b from-[#001F3F] via-[#002B5B] to-[#001F3F] text-white border-b border-white/10">
        {/* Background glow meshes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#027FFF]/20 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-[80rem] mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-bold shadow-xs mb-6 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Institutional Pedagogy &amp; Global Mission
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mb-6 leading-[1.12]">
            Democratizing World-Class <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-amber-200 to-amber-400">
              Multi-Disciplinary Education.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Pen &amp; Page Academia unites rigorous curriculum in <strong>Computer Science</strong>, <strong>Higher Mathematics</strong>, <strong>Academic English</strong>, and <strong>Applied Sciences</strong> with live interactive sandboxes and precision AI evaluation.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-[#027FFF]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Academy Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/diagnostic"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Take Free Diagnostic Placement</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. QUANTITATIVE METRICS STRIP (Floating elevated card) */}
      <div className="max-w-[80rem] mx-auto px-4 relative z-20 -mt-16 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/90 text-center">
          {ACADEMY_METRICS.map((metric, idx) => (
            <div 
              key={metric.label} 
              className={`p-3 sm:p-4 ${idx > 0 ? "border-l border-slate-100" : ""}`}
            >
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
                {metric.value}
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#027FFF] mt-1">
                {metric.label}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                {metric.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[80rem] mx-auto px-4 space-y-24">

        {/* 3. OUR STORY & THE ACADEMIC VISION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Our Origin &amp; Philosophy
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Bridging the gap between static textbooks and true cognitive mastery.
            </h2>
            
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              <p>
                Traditional online learning suffers from two critical failure modes: either students pay prohibitive private tutoring fees with days of waiting for assignment feedback, or they are left stranded with passive video libraries with zero interactive validation.
              </p>
              <p>
                At <strong>Pen &amp; Page Academia</strong>, we engineered a unified academic ecosystem where students do not just passively watch lectures—they actively write and run Python code, prove mathematical theorems on collaborative whiteboards, analyze scientific physical simulations, and craft academic rhetoric with instant, rubric-calibrated guidance.
              </p>
              <p>
                Every module is built with direct mastery checkpoints, peer collaboration circles, and 24/7 AI tutor guidance, giving every ambitious learner worldwide access to top-tier institutional training.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-Discipline Breadth</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Rote Memorization</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live Interactive Sandboxes</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Calibrated Certification</span>
              </div>
            </div>
          </div>

          {/* Right: Architecture Visual Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#001F3F] text-white flex items-center justify-center font-bold text-xs">
                    P&amp;P
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Unified Cognitive Framework</h3>
                    <p className="text-[11px] text-slate-400">Multi-disciplinary interactive pedagogy</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              {/* Visual Comparisons */}
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Legacy Video Portals</span>
                    <span className="text-rose-600">Passive • No Sandbox Feedback</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full w-[28%]" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Isolated lectures with no code execution, proof validation, or real-time diagnostic checks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#027FFF]">
                    <span>Pen &amp; Page Academia Architecture</span>
                    <span className="text-emerald-600">Active • 98.6% Mastery Rate</span>
                  </div>
                  <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#027FFF] h-full w-[96%]" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Interactive Python 3.12 sandbox, live whiteboard canvases, multi-agent AI critique, and peer-to-peer study rooms.
                  </p>
                </div>
              </div>

              {/* Academy Quote */}
              <div className="p-4 rounded-2xl bg-[#001F3F] text-white text-xs leading-relaxed space-y-2">
                <p className="italic text-white/90">
                  &ldquo;Our vision is clear: give every scholar—regardless of geography—the rigorous tools, mentorship, and continuous feedback demanded by premier global research institutions.&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[11px] text-amber-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>The Academic Advisory Council</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. THE FOUR ACADEMIC PILLARS */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> Core Disciplines
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              The Four Academic Pillars
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Comprehensive curricula engineered for depth, practical proficiency, and academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {ACADEMY_PILLARS.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <div 
                  key={pillar.title}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:border-[#027FFF] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#027FFF] flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${pillar.accentBg}`}>
                        {pillar.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {pillar.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href="/courses"
                      className="text-xs font-bold text-[#027FFF] hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      <span>Explore Curriculum</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. PEDAGOGICAL METHODOLOGY WORKFLOW */}
        <section className="bg-[#001F3F] text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#027FFF]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-amber-300 border border-white/20 text-xs font-bold uppercase tracking-wider">
                Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                How Learning Works at Pen &amp; Page
              </h2>
              <p className="text-xs sm:text-sm text-white/70">
                A calibrated 4-step progression engineered to eliminate learning plateaus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PEDAGOGY_STEPS.map((step) => (
                <div 
                  key={step.step}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 backdrop-blur-sm space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-3xl font-black text-amber-400 block tracking-tight">
                      {step.step}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. ACADEMIC LEADERSHIP & FELLOWS */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Academic Leadership
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Distinguished Faculty &amp; Fellows
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Directed by educators and researchers from the world&apos;s leading institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACULTY_MEMBERS.map((member) => {
              const Icon = member.icon;
              return (
                <div 
                  key={member.name}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-center group"
                >
                  <div className="space-y-4">
                    {/* Faculty Avatar Icon Frame */}
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-[#027FFF] shadow-inner group-hover:scale-105 transition-transform">
                      <Icon className="w-9 h-9" />
                    </div>

                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border ${member.badgeColor}`}>
                        {member.badge}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#027FFF] mt-0.5">
                        {member.role}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {member.experience}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                    {member.credentials}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. FINAL CALL TO ACTION */}
        <section className="bg-gradient-to-r from-[#001F3F] via-[#027FFF] to-[#001F3F] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden border border-white/20">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/20 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold tracking-wide uppercase backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5" /> Start Your Academic Journey
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Master the Skills of Tomorrow, Today.
            </h2>
            
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Join thousands of scholars worldwide. Take our zero-cost diagnostic benchmark to discover your exact skill baseline and personalized study roadmap.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/diagnostic" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[#001F3F] font-black text-sm hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Take Diagnostic Placement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link 
                href="/courses" 
                className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                Browse Course Catalog
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Instant skill report
              </span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
