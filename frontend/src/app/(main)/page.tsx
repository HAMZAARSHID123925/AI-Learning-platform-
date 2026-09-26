"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  // Hero interactive track tabs (English, Coding, Math, Physics)
  const [heroTrack, setHeroTrack] = useState<'english' | 'cs' | 'math' | 'physics'>('english');

  // Math displacement simulation state
  const [marbleCount, setMarbleCount] = useState<number>(4);

  // English clause drill state
  const [selectedClause, setSelectedClause] = useState<number | null>(null);

  // CS code runner state
  const [codeAnswer, setCodeAnswer] = useState<string | null>(null);

  // Tutor tab in "Meet your AI Study Buddy"
  const [activeTutorTab, setActiveTutorTab] = useState<'english' | 'cs' | 'math' | 'physics'>('english');

  // Curriculum category filter in "From Foundation to University"
  const [selectedSubject, setSelectedSubject] = useState<'english' | 'cs' | 'math' | 'physics'>('english');

  return (
    <div className="w-full bg-[#FAF9F5] text-[#111827] antialiased selection:bg-[#027FFF]/20 selection:text-[#111827]">
      
      {/* 1. HERO SECTION (Exact 1:1 Match to Brilliant.org Screenshot media_1790336218074.png) */}
      <section className="max-w-[1240px] mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Heading, Subtitle, CTAs & Awards */}
          <div className="lg:col-span-6 space-y-7">
            <h1 className="font-serif-heading text-[54px] sm:text-[68px] lg:text-[80px] leading-[1.04] tracking-[-0.035em] font-semibold text-[#111827]">
              Your personal<br />
              tutor for math<br />
              and coding
            </h1>

            <p className="text-[#6b7280] text-lg sm:text-[20px] leading-[1.4] max-w-[480px] font-normal">
              Tutoring for schoolwork, test prep, or learning on your own. Excel with Pen &amp; Page&apos;s fully accredited curriculum.
            </p>

            <div className="text-[15px] font-bold text-[#111827] tracking-tight">
              Get started for free.
            </div>

            {/* CTAs: Exact Brilliant Green Filled + Outlined Pill */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#18b84d] hover:bg-[#15a344] text-white font-bold text-base text-center transition-all shadow-sm hover:shadow active:scale-[0.99]"
              >
                I&apos;m a learner
              </Link>
              <Link
                href="/signup?role=instructor"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#d1d5db] hover:border-[#9ca3af] bg-white text-[#4b5563] hover:text-[#111827] font-semibold text-base text-center transition-all shadow-2xs active:scale-[0.99]"
              >
                I&apos;m a parent or teacher
              </Link>
            </div>
          </div>

          {/* Right Column: Brilliant-Style Interactive Drill Card with Multi-Track Switching */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] bg-white rounded-[38px] p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] border border-[#e5e7eb] relative select-none">
              
              {/* Mini Track Selector Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interactive Concept Drill</span>
                <div className="flex items-center gap-1 bg-[#F4F4F5] p-1 rounded-full border border-slate-200/80">
                  {[
                    { id: 'math', label: 'Math' },
                    { id: 'cs', label: 'Code' },
                    { id: 'english', label: 'English' },
                    { id: 'physics', label: 'Physics' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHeroTrack(item.id as any)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                        heroTrack === item.id
                          ? 'bg-white text-[#111827] shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TRACK 1: MATH (Volume Displacement Simulation) */}
              {heroTrack === 'math' && (
                <div className="animate-in fade-in duration-200">
                  <div className="w-full relative">
                    <svg viewBox="0 0 360 250" className="w-full h-auto">
                      {/* Y-Axis Label: Volume */}
                      <text x="35" y="24" fontSize="11" fontWeight="700" fill="#111827" fontFamily="sans-serif">Volume (mL)</text>
                      
                      {/* Y-Axis Line */}
                      <line x1="45" y1="36" x2="45" y2="185" stroke="#111827" strokeWidth="2" />
                      <polygon points="45,30 42,38 48,38" fill="#111827" />
                      
                      {/* X-Axis Line */}
                      <line x1="40" y1="185" x2="200" y2="185" stroke="#111827" strokeWidth="2" />
                      <polygon points="206,185 198,182 198,188" fill="#111827" />

                      {/* Faint Graph Grid Lines */}
                      {[55, 77, 99, 121, 143, 165].map((y) => (
                        <line key={y} x1="45" y1={y} x2="195" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                      ))}
                      {[70, 95, 120, 145, 170].map((x) => (
                        <line key={x} x1={x} y1="38" x2={x} y2="185" stroke="#f3f4f6" strokeWidth="1" />
                      ))}

                      {/* Y-Axis Ticks (10 to 60) */}
                      {[
                        { val: 60, y: 55 },
                        { val: 50, y: 77 },
                        { val: 40, y: 99 },
                        { val: 30, y: 121 },
                        { val: 20, y: 143 },
                        { val: 10, y: 165 },
                      ].map((tick) => (
                        <g key={tick.val}>
                          <line x1="42" y1={tick.y} x2="48" y2={tick.y} stroke="#111827" strokeWidth="1.5" />
                          <text x="36" y={tick.y + 3.5} fontSize="10" fontWeight="500" fill="#4b5563" textAnchor="end" fontFamily="sans-serif">
                            {tick.val}
                          </text>
                        </g>
                      ))}

                      {/* X-Axis Ticks (1 to 6) */}
                      {[
                        { val: 1, x: 70 },
                        { val: 2, x: 95 },
                        { val: 3, x: 120 },
                        { val: 4, x: 145 },
                        { val: 5, x: 170 },
                        { val: 6, x: 195 },
                      ].map((tick) => (
                        <g key={tick.val}>
                          <line x1={tick.x} y1="182" x2={tick.x} y2="188" stroke="#111827" strokeWidth="1.5" />
                          <text x={tick.x} y={200} fontSize="10" fontWeight="500" fill="#4b5563" textAnchor="middle" fontFamily="sans-serif">
                            {tick.val}
                          </text>
                        </g>
                      ))}

                      {/* X-Axis Label: Marbles */}
                      <text x="190" y="214" fontSize="10.5" fontWeight="700" fill="#111827" textAnchor="middle" fontFamily="sans-serif">
                        Marbles
                      </text>

                      {/* Plotted Linear Points */}
                      <circle cx="45" cy="165" r="3.5" fill="#3b82f6" />
                      <circle cx="70" cy="154" r="3.5" fill="#3b82f6" />
                      <circle cx="95" cy="143" r="3.5" fill="#3b82f6" />
                      <circle cx="120" cy="132" r="3.5" fill="#3b82f6" />
                      <circle cx="145" cy="121" r="3.5" fill="#3b82f6" />
                      <circle cx="170" cy="110" r="3.5" fill="#3b82f6" />

                      {/* Dynamic Dashed projection line */}
                      {(() => {
                        const curX = 45 + marbleCount * 25;
                        const curY = 165 - marbleCount * 11;
                        return (
                          <>
                            <line x1={curX} y1={curY} x2={curX} y2="230" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1="45" y1={curY} x2="228" y2={curY} stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
                          </>
                        );
                      })()}

                      {/* Cylinder on Right */}
                      <rect x="228" y="36" width="46" height="150" fill="none" stroke="#111827" strokeWidth="2" />
                      
                      {/* Water in cylinder with volume displacement */}
                      <rect
                        x="229"
                        y={121 - (marbleCount - 4) * 11}
                        width="44"
                        height={64 + (marbleCount - 4) * 11}
                        fill="#c7d2fe"
                        className="transition-all duration-300"
                      />

                      {/* Pink marbles inside beaker */}
                      {Array.from({ length: marbleCount }).map((_, i) => {
                        const marblePositions = [
                          { cx: 248, cy: 172 },
                          { cx: 262, cy: 152 },
                          { cx: 244, cy: 132 },
                          { cx: 258, cy: 112 },
                          { cx: 244, cy: 92 },
                          { cx: 258, cy: 72 },
                        ];
                        const pos = marblePositions[i] || { cx: 250, cy: 170 };
                        return (
                          <circle
                            key={i}
                            cx={pos.cx}
                            cy={pos.cy}
                            r="8"
                            fill="#f472b6"
                            stroke="#db2777"
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />
                        );
                      })}

                      {/* Slider point indicator */}
                      {(() => {
                        const sliderX = 45 + marbleCount * 25;
                        return (
                          <g className="transition-all duration-300" style={{ transform: `translateX(${sliderX - 145}px)` }}>
                            <circle cx="145" cy="230" r="9" fill="#3b82f6" />
                            <circle cx="145" cy="230" r="15" fill="#3b82f6" opacity="0.25" />
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Interactive Marble Stepper */}
                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    <span className="font-semibold text-slate-700">Add or remove marbles:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMarbleCount(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                        aria-label="Decrease marbles"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 font-mono w-5 text-center text-sm">{marbleCount}</span>
                      <button
                        type="button"
                        onClick={() => setMarbleCount(prev => Math.min(6, prev + 1))}
                        className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition-colors cursor-pointer"
                        aria-label="Increase marbles"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TRACK 2: CS / PYTHON (Interactive Code Logic Runner) */}
              {heroTrack === 'cs' && (
                <div className="space-y-4 animate-in fade-in duration-200 py-1">
                  <div className="bg-[#111827] text-slate-200 rounded-2xl p-4 font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                      <span>🐍 main.py</span>
                      <span className="text-emerald-400 font-bold">Python 3.12</span>
                    </div>
                    <pre className="pt-3 text-[12px] space-y-1">
                      <span className="text-purple-400">def</span> <span className="text-blue-300">count_evens</span>(numbers):<br/>
                      &nbsp;&nbsp;count = <span className="text-amber-300">0</span><br/>
                      &nbsp;&nbsp;<span className="text-purple-400">for</span> n <span className="text-purple-400">in</span> numbers:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> n % <span className="text-amber-300">2</span> == <span className="text-amber-300">0</span>:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;count += <span className="text-amber-300">1</span><br/>
                      &nbsp;&nbsp;<span className="text-purple-400">return</span> count<br/>
                      <br/>
                      <span className="text-slate-400"># What does this return?</span><br/>
                      print(count_evens([<span className="text-amber-300">2, 5, 8, 10, 13</span>]))
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Predict the output:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {['2', '3', '5'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCodeAnswer(opt)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            codeAnswer === opt
                              ? opt === '3'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                : 'bg-red-500 text-white border-red-600 shadow-sm'
                              : 'border-slate-200 hover:border-slate-400 text-slate-800'
                          }`}
                        >
                          {opt} {codeAnswer === opt && (opt === '3' ? '✓ Correct' : '✗ Try again')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TRACK 3: ACADEMIC ENGLISH (Clause Breakdown Drill) */}
              {heroTrack === 'english' && (
                <div className="space-y-4 animate-in fade-in duration-200 py-1">
                  <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>IELTS Task 2 Cohesion Drill</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Band 8.5</span>
                    </div>
                    <p className="leading-relaxed text-[13px] text-slate-800">
                      &ldquo;Although renewable energy subsidies demand high initial investment, they substantially reduce long-term emissions.&rdquo;
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Identify the grammatical function of the underlined clause:</div>
                    <div className="space-y-2">
                      {[
                        { id: 0, text: 'Dependent Subordinate Clause (Concession)', correct: true },
                        { id: 1, text: 'Independent Coordinate Clause', correct: false },
                        { id: 2, text: 'Restrictive Relative Clause', correct: false },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedClause(item.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                            selectedClause === item.id
                              ? item.correct
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                                : 'bg-rose-50 border-rose-400 text-rose-800'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span>{item.text}</span>
                          {selectedClause === item.id && (
                            <span className="font-bold">{item.correct ? '✓ Exact' : '✗'}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TRACK 4: APPLIED PHYSICS (Newtonian Momentum Vector) */}
              {heroTrack === 'physics' && (
                <div className="space-y-4 animate-in fade-in duration-200 py-1">
                  <div className="w-full bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                      <span>Elastic Collision Dynamics</span>
                      <span className="text-cyan-400 font-mono">p = m × v</span>
                    </div>
                    <svg viewBox="0 0 300 100" className="w-full h-auto mt-2">
                      {/* Floor line */}
                      <line x1="20" y1="80" x2="280" y2="80" stroke="#334155" strokeWidth="2" />
                      {/* Ball A */}
                      <circle cx="80" cy="65" r="15" fill="#38bdf8" />
                      <text x="80" y="69" fontSize="10" fontWeight="bold" fill="#0f172a" textAnchor="middle">2kg</text>
                      <line x1="95" y1="65" x2="135" y2="65" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
                      {/* Ball B */}
                      <circle cx="210" cy="65" r="15" fill="#f43f5e" />
                      <text x="210" y="69" fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">2kg</text>
                      <line x1="195" y1="65" x2="165" y2="65" stroke="#f43f5e" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    💡 <strong>Intuition Check:</strong> In a head-on collision between two equal masses with velocities \(+v\) and \(-v\), total system momentum before and after collision remains <strong>0 kg·m/s</strong>.
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 2. TRUST STRIP (3 bordered cards) */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 text-center border border-[#e5e7eb] shadow-xs flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl">🏆</span>
            <div className="font-bold text-[#111827] text-lg">Fully Calibrated Pedagogy</div>
            <p className="text-[#6b7280] text-sm">Cambridge, IDP &amp; Collegiate STEM Standards</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center border border-[#e5e7eb] shadow-xs flex flex-col items-center justify-center space-y-2">
            <div className="text-amber-400 text-sm tracking-widest">★★★★★</div>
            <div className="font-bold text-[#111827] text-2xl font-mono">98.4%</div>
            <p className="text-[#6b7280] text-sm">Learner Concept Retention Rate</p>
          </div>

          <div className="bg-white rounded-3xl p-8 text-center border border-[#e5e7eb] shadow-xs flex flex-col items-center justify-center space-y-2">
            <span className="text-3xl">🌍</span>
            <div className="font-bold text-[#111827] text-2xl font-mono">10,000+</div>
            <p className="text-[#6b7280] text-sm">Active Students &amp; Test Candidates</p>
          </div>
        </div>
      </section>

      {/* 3. MEET YOUR AI STUDY BUDDY SECTION */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-8 pt-24 pb-16 text-center">
        {/* Diamond Mascot Icon */}
        <div className="w-16 h-16 bg-[#027FFF] rounded-2xl mx-auto flex items-center justify-center shadow-md rotate-45 mb-6">
          <div className="w-6 h-6 bg-white rounded-sm -rotate-45 flex items-center justify-center text-[#027FFF] text-xs font-bold">
            P
          </div>
        </div>

        <h2 className="font-serif-heading text-4xl sm:text-5xl font-semibold text-[#111827] tracking-tight mb-8">
          Meet your 24/7 AI Study Buddy
        </h2>

        {/* 4 Track Toggles: English | Coding | Math | Physics */}
        <div className="inline-flex flex-wrap justify-center p-1.5 bg-[#f3f4f6] rounded-full border border-[#e5e7eb] mb-20 gap-1">
          {[
            { id: 'english', label: '📖 Academic English' },
            { id: 'cs', label: '💻 Computer Science' },
            { id: 'math', label: '🧮 Higher Math' },
            { id: 'physics', label: '🔬 Applied Physics' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTutorTab(t.id as any)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                activeTutorTab === t.id ? 'bg-[#111827] text-white shadow-xs' : 'text-[#4b5563] hover:text-[#111827]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feature Row 1: Interactive Instructor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left max-w-[1100px] mx-auto pb-24">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif-heading text-3xl sm:text-[34px] font-semibold text-[#111827] leading-snug">
              A visual, Socratic instructor that guides you
            </h3>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Like an expert human tutor, your AI Study Buddy never just blurts out the answer. It asks guiding questions, analyzes where your logic went off track, and helps you arrive at the solution yourself.
            </p>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Whether you are optimizing a Python loop, crafting a cohesive IELTS Task 2 thesis statement, or differentiating a multi-variable function, it adapts to your exact learning velocity.
            </p>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[500px] bg-[#fbf5eb] rounded-[36px] p-6 sm:p-10 border border-[#ecd9c3] shadow-xs relative">
              <div className="bg-[#111827] rounded-2xl p-5 text-xs font-mono text-[#a7f3d0] space-y-3 shadow-md">
                <div className="text-[#f59e0b] font-bold"># AI TUTOR DIAGNOSTIC STREAM</div>
                <div className="space-y-1 text-slate-300">
                  {activeTutorTab === 'english' && (
                    <>
                      <div>target_rubric = &quot;IELTS Academic Writing Task 2&quot;</div>
                      <div>detected_weakness = &quot;Comma splice between independent clauses&quot;</div>
                      <div className="text-[#027FFF]">&gt;&gt; hint(&quot;Separate with a semicolon or add subordinating &apos;whereas&apos;&quot;)</div>
                    </>
                  )}
                  {activeTutorTab === 'cs' && (
                    <>
                      <div>algorithm = &quot;Binary Search Tree Traversal&quot;</div>
                      <div>time_complexity = &quot;O(log n) average&quot;</div>
                      <div className="text-[#027FFF]">&gt;&gt; hint(&quot;Check your left pointer check before recursive descent&quot;)</div>
                    </>
                  )}
                  {activeTutorTab === 'math' && (
                    <>
                      <div>derivative_rule = &quot;Chain Rule&quot;</div>
                      <div>inner_function = &quot;u = 3x^2 + 4&quot;</div>
                      <div className="text-[#027FFF]">&gt;&gt; hint(&quot;Multiply derivative of outer function by du/dx&quot;)</div>
                    </>
                  )}
                  {activeTutorTab === 'physics' && (
                    <>
                      <div>law = &quot;Conservation of Momentum&quot;</div>
                      <div>elastic_collision = True</div>
                      <div className="text-[#027FFF]">&gt;&gt; hint(&quot;Total initial momentum equals total final momentum&quot;)</div>
                    </>
                  )}
                </div>
                <div className="p-3 bg-[#1e293b] rounded-xl text-white relative">
                  <div>def socratic_prompt():</div>
                  <div className="text-emerald-400 pl-4">&gt;&gt; return &quot;You found the answer yourself! 🎉&quot;</div>
                  
                  {/* Mascot mini badge */}
                  <div className="absolute right-4 bottom-2 w-9 h-9 bg-[#027FFF] rounded-xl rotate-12 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    P
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Row 2: Skills that actually matter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left max-w-[1100px] mx-auto pb-24">
          <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
            <div className="w-full max-w-[500px] bg-[#eef7ee] rounded-[36px] p-6 sm:p-10 border border-[#d2ecd2] shadow-xs relative">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb] space-y-4">
                <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">Consider all the components</div>
                <div className="grid grid-cols-4 gap-2 py-2">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-lg border flex items-center justify-center text-xs font-mono ${i === 5 ? 'bg-[#bbf7d0] border-[#22c55e] font-bold' : 'border-[#e5e7eb]'}`}>
                      {i === 5 ? '✓' : ''}
                    </div>
                  ))}
                </div>
                <div className="w-10 h-10 bg-[#027FFF] rounded-xl rotate-45 mx-auto flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            <h3 className="font-serif-heading text-3xl sm:text-[34px] font-semibold text-[#111827] leading-snug">
              Build foundational intuition that lasts
            </h3>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Anyone can copy-paste code from ChatGPT or translate an essay with Google Translate. True mastery is knowing <em>why</em> a program is memory-efficient or <em>why</em> an argument is logically airtight.
            </p>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Our interactive lessons ensure you master core principles from first-principles reasoning so you perform with complete confidence on real exams and in professional technical roles.
            </p>
          </div>
        </div>

        {/* Feature Row 3: Real-time progress tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left max-w-[1100px] mx-auto pb-16">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif-heading text-3xl sm:text-[34px] font-semibold text-[#111827] leading-snug">
              Real-time progress tracking &amp; diagnostics
            </h3>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Your student dashboard pinpoints your exact mastery percentage across every chapter, displays your daily streak count, and stores streak charge shields so you never lose momentum.
            </p>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
              Receive smart recommendations for your daily 3-problem practice sets based directly on your recent problem attempt history.
            </p>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[500px] bg-[#f9fafb] rounded-[36px] p-6 sm:p-10 border border-[#e5e7eb] shadow-xs relative">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e7eb] space-y-4">
                <div className="flex justify-between items-center text-xs text-[#6b7280]">
                  <span>Diagnostic Mastery Curve</span>
                  <span className="font-bold text-[#15a84b] text-sm font-mono">94.8% ↑</span>
                </div>
                <div className="h-28 flex items-end justify-between gap-2 pt-4">
                  {[45, 60, 35, 80, 95, 75, 92].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#027FFF]/60 hover:bg-[#027FFF] rounded-t-md transition-colors" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="w-10 h-10 bg-[#027FFF] rounded-xl rotate-45 ml-auto flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FROM FOUNDATION TO UNIVERSITY AND BEYOND */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-8 py-16">
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[40px] p-8 sm:p-14 text-center">
          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#111827] tracking-tight mb-8">
            From foundation level to university and beyond
          </h2>

          {/* 4 Core Disciplines Filter */}
          <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-white rounded-full border border-[#e5e7eb] mb-12 shadow-2xs">
            {[
              { id: 'english', label: '📖 Academic English' },
              { id: 'cs', label: '💻 Computer Science' },
              { id: 'math', label: '🧮 Higher Math' },
              { id: 'physics', label: '🔬 Applied Physics' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubject(sub.id as any)}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                  selectedSubject === sub.id
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Inner Card (Covered subjects + Concept topology) */}
          <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 sm:p-10 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">Covered curriculum modules</div>
              <ul className="space-y-2.5 text-sm text-[#4b5563] font-medium">
                {selectedSubject === 'english' && (
                  <>
                    <li className="flex items-center gap-2 font-bold text-[#111827]">• Complex Clause Construction &amp; Conjunctions</li>
                    <li className="flex items-center gap-2">• IELTS Band 8.5 Academic Writing (Task 1 &amp; 2)</li>
                    <li className="flex items-center gap-2">• Academic Rhetoric, Cohesion &amp; Discourse</li>
                    <li className="flex items-center gap-2">• Error Detection &amp; Punctuation Auditing</li>
                    <li className="flex items-center gap-2">• Advanced Lexical Resource in Academic Context</li>
                  </>
                )}
                {selectedSubject === 'cs' && (
                  <>
                    <li className="flex items-center gap-2 font-bold text-[#111827]">• Python Fundamentals &amp; Object Orientation</li>
                    <li className="flex items-center gap-2">• Algorithmic Thinking &amp; Big-O Complexity</li>
                    <li className="flex items-center gap-2">• Data Structures: Trees, Hash Maps &amp; Graphs</li>
                    <li className="flex items-center gap-2">• Machine Learning &amp; AI Mathematical Intuition</li>
                    <li className="flex items-center gap-2">• Practical Software Design Patterns</li>
                  </>
                )}
                {selectedSubject === 'math' && (
                  <>
                    <li className="flex items-center gap-2 font-bold text-[#111827]">• Visual Algebra &amp; Polynomial Intuition</li>
                    <li className="flex items-center gap-2">• Trigonometry &amp; Coordinate Geometry</li>
                    <li className="flex items-center gap-2">• Differential &amp; Integral Calculus</li>
                    <li className="flex items-center gap-2">• Linear Algebra &amp; Vector Transformations</li>
                    <li className="flex items-center gap-2">• Probability Distributions &amp; Statistical Inference</li>
                  </>
                )}
                {selectedSubject === 'physics' && (
                  <>
                    <li className="flex items-center gap-2 font-bold text-[#111827]">• Newtonian Classical Mechanics &amp; Gravity</li>
                    <li className="flex items-center gap-2">• Electrical Circuits &amp; Network Analysis</li>
                    <li className="flex items-center gap-2">• Harmonic Motion &amp; Wave Interference</li>
                    <li className="flex items-center gap-2">• Thermodynamic Laws &amp; Entropy</li>
                    <li className="flex items-center gap-2">• Quantum Intuition &amp; Energy States</li>
                  </>
                )}
              </ul>
            </div>

            <div className="lg:col-span-7 bg-[#f3f4f6] rounded-2xl p-6 flex flex-col items-center justify-center border border-[#e5e7eb]">
              <div className="text-xs text-[#9ca3af] font-mono mb-2">Interactive Structured Learning Path</div>
              <div className="w-full h-48 bg-white rounded-xl border border-[#e5e7eb] flex items-center justify-center relative overflow-hidden p-4">
                <div className="flex items-center justify-between w-full max-w-md">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</div>
                    <div className="text-[11px] font-bold text-slate-700">Foundations</div>
                  </div>
                  <div className="h-0.5 flex-1 bg-emerald-400 mx-2" />
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-[#027FFF] text-[#027FFF] flex items-center justify-center font-bold text-xs animate-pulse">●</div>
                    <div className="text-[11px] font-bold text-[#027FFF]">Intermediate</div>
                  </div>
                  <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold text-xs">🔒</div>
                    <div className="text-[11px] font-bold text-slate-400">Advanced</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALWAYS ON YOUR SCHEDULE & CALIBRATED EXPERTS */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-8 py-16 space-y-24">
        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6] aspect-[4/3] relative shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"
              alt="Student learning on laptop anytime"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-serif-heading text-3xl sm:text-4xl font-semibold text-[#111827]">
              Always on your schedule
            </h3>
            <p className="text-[#4b5563] text-base leading-relaxed">
              Your AI Study Buddy gives real-time, on-demand guidance anytime and anywhere. Whether you have 15 minutes during a commute or want an intensive 2-hour deep dive on weekend evenings, your progress automatically syncs across all devices.
            </p>
          </div>
        </div>

        {/* Built by certified standards + credits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="font-serif-heading text-3xl sm:text-4xl font-semibold text-[#111827]">
              Calibrated to international benchmarks
            </h3>
            <p className="text-[#4b5563] text-base leading-relaxed">
              Our curriculum is designed by certified language specialists, collegiate STEM instructors, and Cambridge-calibrated examiners to ensure what you learn directly translates to real exam success.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-[#9ca3af] font-bold text-sm tracking-wider">
              <span>CAMBRIDGE</span>
              <span>IELTS / IDP</span>
              <span>COMMON CORE</span>
              <span>A-LEVELS</span>
              <span>STEM AP</span>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border border-[#e5e7eb] bg-[#f3f4f6] aspect-[4/3] relative shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop"
              alt="Collegiate University Campus"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS (Loved by learners of all ages) */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-8 py-16 text-center">
        <h2 className="font-serif-heading text-3xl sm:text-4xl font-semibold text-[#111827] mb-12">
          Loved by learners across 4 continents
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {[
            {
              quote: "My academic writing score jumped from Band 6.0 to 8.0 because of the instant clause analysis. I finally understood where my comma splices came from.",
              name: "Daniel M.",
              role: "Postgraduate Candidate",
              track: "Academic English",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            },
            {
              quote: "If you want Python code that actually runs instead of crashing, Pen & Page is unmatched. I went from zero coding knowledge to building scripts in 3 weeks.",
              name: "Caleb S.",
              role: "Data Analyst Trainee",
              track: "Computer Science",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
            {
              quote: "Visualizing derivatives as tangent slopes in 10-minute daily puzzles solved university calculus for me after failing my first midterm.",
              name: "Amy L.",
              role: "Engineering Freshman",
              track: "Higher Mathematics",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            },
            {
              quote: "The interactive circuit and mechanics simulators make high school physics feel like an interactive puzzle game rather than dry formulas.",
              name: "Christoph W.",
              role: "Senior High Schooler",
              track: "Applied Physics",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            },
          ].map((card, idx) => (
            <div key={idx} className="bg-[#f9fafb] border border-[#e5e7eb] rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <p className="text-xs sm:text-[13px] text-[#4b5563] leading-relaxed">
                &ldquo;{card.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={card.avatar}
                  alt={card.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-xs text-[#111827]">{card.name}</div>
                  <div className="text-[11px] text-[#027FFF] font-semibold">{card.track}</div>
                  <div className="text-[10px] text-[#9ca3af]">{card.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DARK CLOSING SECTION (The best tutor you'll ever have) */}
      <section className="relative w-full bg-[#111827] text-white py-24 sm:py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop"
            alt="Students collaborating"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-2xl mx-auto space-y-6 z-10">
          <h2 className="font-serif-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
            The best learning companion you&apos;ll ever have.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
            Join thousands building genuine intuition in Academic English, Python, Calculus, and Physics every day.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#027FFF] hover:bg-[#0066d6] text-white font-bold text-base transition-all shadow-md"
            >
              I&apos;m a learner →
            </Link>
            <Link
              href="/signup?role=instructor"
              className="w-full sm:w-auto px-9 py-4 rounded-full border border-slate-600 hover:border-slate-400 text-white font-semibold text-base transition-all"
            >
              I&apos;m a teacher or parent
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
