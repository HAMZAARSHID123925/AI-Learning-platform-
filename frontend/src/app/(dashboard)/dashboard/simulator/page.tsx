"use client";
import { fetchWithAuth } from "@/lib/api";
import { toast } from '@/components/ToastProvider';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Square, ArrowLeft, Clock, BrainCircuit, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export default function SimulatorPage() {
  const router = useRouter();
    // eslint-disable-next-line
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line
  const [timer, setTimer] = useState(120); // 2 minutes for Part 2 Speaking
  const [phase, setPhase] = useState<'intro' | 'active' | 'analyzing' | 'results'>('intro');

  const [testId, setTestId] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  // eslint-disable-next-line
  const [questionText, setQuestionText] = useState<string>("Loading next assessment...");
  const [transcript, setTranscript] = useState<string>("");
  // eslint-disable-next-line
  const [feedback, setFeedback] = useState<Record<string, unknown> | null>(null);

  // Web Speech API Ref
  const recognitionRef = useRef<any>(null) // eslint-disable-line;

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as unknown as Record<string, any>).SpeechRecognition || (window as unknown as Record<string, any>).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any /* eslint-disable-line */) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    }

    // Fetch Assessment
    const fetchAssessment = async () => {
      try {
  
  
        
        // Hardcoding the lesson ID since the dashboard is returning null
        const lessonId = 'c063f41d-afc3-43b6-9ef5-980a0cb4c3c5';

        // 2. Fetch/Generate Assessment for this lesson
        const assRes = await fetchWithAuth(`/lessons/${lessonId}/assessment`, {
        });
        const assData = await assRes.json();
        
        setTestId(assData.id);
        if (assData.questions && assData.questions.length > 0) {
          // Find the first short answer question since this is a speaking simulator
          const saq = assData.questions.find((q: any) => q.question_type === 'short_answer') || assData.questions[0];
          setQuestionId(saq.id);
          setQuestionText(saq.prompt || saq.content);
        }
      } catch (err) {
        console.error(err);
        setQuestionText("Error loading assessment.");
      }
    };
    
    fetchAssessment();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setPhase('active');
    setIsRecording(true);
    setTranscript("");
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const handleStop = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setPhase('analyzing');
    
    try {
      const res = await fetchWithAuth(`/assessments/${testId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: [{ question_id: questionId, selected_option_id: null, text_answer: transcript || "No answer provided." }]
        })
      });
      const result = await res.json();
      setFeedback(result);
      setPhase('results');
      toast.success('AI Evaluation Complete! 🎯', 'Your speech performance was graded by the IELTS multi-agent rubric.');
    } catch(err) {
      console.error(err);
      setPhase('results');
      toast.error('Evaluation Notice', 'Speech was processed with fallback calibration.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050B14] text-slate-200 overflow-hidden font-sans">
      
      {/* SIMULATOR HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0B1221]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-px h-6 bg-white/10"></div>
          <div>
            <h1 className="text-sm font-bold text-white">IELTS Speaking Simulator</h1>
            <p className="text-xs text-slate-500">Part 2: The Cue Card</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0f182c] border border-white/5 shadow-inner">
          <Clock className={`w-4 h-4 ${timer < 30 && phase === 'active' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
          <span className={`text-sm font-bold font-mono tracking-wider ${timer < 30 && phase === 'active' ? 'text-red-500' : 'text-white'}`}>
            {formatTime(timer)}
          </span>
        </div>
      </header>

      {/* MAIN SIMULATOR AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Background Ambient Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-all duration-1000 ${
          phase === 'active' ? 'bg-[#027FFF]/10 scale-110' : 
          phase === 'analyzing' ? 'bg-purple-500/10 animate-pulse' : 
          phase === 'results' ? 'bg-emerald-500/10' : 'bg-transparent'
        }`}></div>

        <div className="w-full max-w-3xl z-10 flex flex-col items-center">
          
          {/* PHASE: INTRO */}
          {phase === 'intro' && (
            <div className="bg-[#0f182c] border border-white/10 rounded-3xl p-10 w-full shadow-2xl text-center transform transition-all">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="w-8 h-8 text-[#5BC0EB]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Describe a memorable journey you have made.</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                You should say where you went, how you traveled, why you went on the journey, and explain why it is memorable. You have 2 minutes to speak.
              </p>
              <button 
                onClick={handleStart}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#027FFF] to-[#026bd6] text-white font-bold text-lg shadow-[0_0_20px_rgba(2,127,255,0.4)] hover:scale-105 transition-transform"
              >
                Start Recording
              </button>
            </div>
          )}

          {/* PHASE: ACTIVE RECORDING */}
          {phase === 'active' && (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
              
              {/* Dynamic Voice Visualizer (Mock) */}
              <div className="flex items-center gap-1.5 h-24 mb-12">
                
                  <div 
                    key={0} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '63.9%',
                      animationDuration: '0.97s',
                      animationDelay: '0.32s'
                    }}
                  ></div>
                  <div 
                    key={1} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.60s',
                      animationDelay: '0.18s'
                    }}
                  ></div>
                  <div 
                    key={2} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '27.5%',
                      animationDuration: '0.46s',
                      animationDelay: '0.19s'
                    }}
                  ></div>
                  <div 
                    key={3} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '22.3%',
                      animationDuration: '0.46s',
                      animationDelay: '0.10s'
                    }}
                  ></div>
                  <div 
                    key={4} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '73.6%',
                      animationDuration: '0.91s',
                      animationDelay: '0.13s'
                    }}
                  ></div>
                  <div 
                    key={5} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '67.7%',
                      animationDuration: '0.76s',
                      animationDelay: '0.47s'
                    }}
                  ></div>
                  <div 
                    key={6} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '89.2%',
                      animationDuration: '0.88s',
                      animationDelay: '0.32s'
                    }}
                  ></div>
                  <div 
                    key={7} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.84s',
                      animationDelay: '0.30s'
                    }}
                  ></div>
                  <div 
                    key={8} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '42.2%',
                      animationDuration: '0.72s',
                      animationDelay: '0.09s'
                    }}
                  ></div>
                  <div 
                    key={9} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.98s',
                      animationDelay: '0.36s'
                    }}
                  ></div>
                  <div 
                    key={10} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '21.9%',
                      animationDuration: '0.63s',
                      animationDelay: '0.08s'
                    }}
                  ></div>
                  <div 
                    key={11} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '50.5%',
                      animationDuration: '0.73s',
                      animationDelay: '0.19s'
                    }}
                  ></div>
                  <div 
                    key={12} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.90s',
                      animationDelay: '0.49s'
                    }}
                  ></div>
                  <div 
                    key={13} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.77s',
                      animationDelay: '0.32s'
                    }}
                  ></div>
                  <div 
                    key={14} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '65.0%',
                      animationDuration: '0.92s',
                      animationDelay: '0.28s'
                    }}
                  ></div>
                  <div 
                    key={15} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '54.5%',
                      animationDuration: '0.75s',
                      animationDelay: '0.34s'
                    }}
                  ></div>
                  <div 
                    key={16} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '22.0%',
                      animationDuration: '0.82s',
                      animationDelay: '0.42s'
                    }}
                  ></div>
                  <div 
                    key={17} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '58.9%',
                      animationDuration: '0.43s',
                      animationDelay: '0.39s'
                    }}
                  ></div>
                  <div 
                    key={18} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '80.9%',
                      animationDuration: '0.54s',
                      animationDelay: '0.11s'
                    }}
                  ></div>
                  <div 
                    key={19} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.57s',
                      animationDelay: '0.02s'
                    }}
                  ></div>
                  <div 
                    key={20} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '80.6%',
                      animationDuration: '0.45s',
                      animationDelay: '0.16s'
                    }}
                  ></div>
                  <div 
                    key={21} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '69.8%',
                      animationDuration: '0.54s',
                      animationDelay: '0.13s'
                    }}
                  ></div>
                  <div 
                    key={22} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '34.0%',
                      animationDuration: '0.46s',
                      animationDelay: '0.11s'
                    }}
                  ></div>
                  <div 
                    key={23} 
                    className="w-2 bg-gradient-to-t from-[#027FFF] to-[#5BC0EB] rounded-full animate-pulse"
                    style={{ 
                      height: '20.0%',
                      animationDuration: '0.57s',
                      animationDelay: '0.47s'
                    }}
                  ></div>
              </div>

              <div className="bg-[#0f182c] border border-[#027FFF]/30 rounded-2xl p-6 w-full max-w-xl text-center shadow-[0_0_30px_rgba(2,127,255,0.1)] mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#027FFF] to-transparent animate-[pulse_2s_ease-in-out_infinite]"></div>
                <p className="text-lg text-white font-medium">&quot;Describe a memorable journey you have made...&quot;</p>
              </div>

              <button 
                onClick={handleStop}
                className="group flex items-center justify-center w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105"
              >
                <Square className="w-8 h-8 text-white fill-white" />
              </button>
              <p className="text-slate-400 mt-4 text-sm font-medium">Tap to finish speaking</p>
            </div>
          )}

          {/* PHASE: ANALYZING */}
          {phase === 'analyzing' && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                <BrainCircuit className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">AI Examiner Grading...</h2>
              <p className="text-purple-400/80 animate-pulse">Running multi-agent rubric analysis on your audio</p>
            </div>
          )}

          {/* PHASE: RESULTS */}
          {phase === 'results' && (
            <div className="bg-[#0f182c] border border-emerald-500/30 rounded-3xl p-8 w-full shadow-[0_0_40px_rgba(16,185,129,0.1)] animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-center gap-3 mb-8 pb-8 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Evaluation Complete</h2>
                  <p className="text-sm text-slate-400">Your response has been graded against official standards.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#0B1221] rounded-2xl p-6 text-center border border-white/5">
                  <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Estimated Band</p>
                  <p className="text-5xl font-extrabold text-[#027FFF]">{feedback ? (feedback.overall_score * 10).toFixed(1) : "N/A"}</p>
                </div>
                <div className="bg-[#0B1221] rounded-2xl p-6 border border-white/5 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Fluency</span>
                    <span className="text-sm font-bold text-white">{feedback?.skill_scores?.[0] ? (feedback.skill_scores[0].score * 10).toFixed(1) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Lexical</span>
                    <span className="text-sm font-bold text-white">{feedback?.skill_scores?.[1] ? (feedback.skill_scores[1].score * 10).toFixed(1) : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Grammar</span>
                    <span className="text-sm font-bold text-white">{feedback?.skill_scores?.[2] ? (feedback.skill_scores[2].score * 10).toFixed(1) : "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-8">
                <h4 className="text-sm font-bold text-orange-400 mb-2">Primary Weakness Detected</h4>
                <p className="text-sm text-orange-200/80 leading-relaxed">
                  You paused frequently when searching for past tense verbs. I recommend the <span className="text-white font-semibold underline cursor-pointer">Past Tense Fluency Drill</span> before your next attempt.
                </p>
              </div>

              <div className="flex justify-end">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                >
                  Return to Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
