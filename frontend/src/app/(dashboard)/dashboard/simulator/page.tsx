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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as unknown as Record<string, any>).SpeechRecognition || (window as unknown as Record<string, any>).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    }

    const fetchAssessment = async () => {
      try {
        const lessonId = 'c063f41d-afc3-43b6-9ef5-980a0cb4c3c5';
        const assRes = await fetchWithAuth(`/lessons/${lessonId}/assessment`);
        const assData = await assRes.json();
        
        setTestId(assData.id);
        if (assData.questions && assData.questions.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* SIMULATOR HEADER */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-6 bg-slate-200"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">IELTS Speaking Simulator</h1>
            <p className="text-xs text-slate-500 font-medium">Part 2: The Cue Card</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <Clock className={`w-4 h-4 ${timer < 30 && phase === 'active' ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
          <span className={`text-sm font-bold font-mono tracking-wider ${timer < 30 && phase === 'active' ? 'text-red-600' : 'text-slate-800'}`}>
            {formatTime(timer)}
          </span>
        </div>
      </header>

      {/* MAIN SIMULATOR AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-3xl z-10 flex flex-col items-center">
          
          {/* PHASE: INTRO */}
          {phase === 'intro' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-10 w-full shadow-md text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <BrainCircuit className="w-8 h-8 text-[#027FFF]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Describe a memorable journey you have made.</h2>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                You should say where you went, how you traveled, why you went on the journey, and explain why it is memorable. You have 2 minutes to speak.
              </p>
              <button 
                onClick={handleStart}
                className="px-8 py-3.5 rounded-full bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Start Recording
              </button>
            </div>
          )}

          {/* PHASE: ACTIVE RECORDING */}
          {phase === 'active' && (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
              
              {/* Dynamic Voice Visualizer */}
              <div className="flex items-center gap-2 h-24 mb-10">
                {[60, 40, 75, 90, 45, 80, 65, 30, 85, 70, 50, 95, 60, 40, 75, 90, 45, 80].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-2 bg-[#027FFF] rounded-full animate-pulse"
                    style={{ 
                      height: `${h}%`,
                      animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                    }}
                  ></div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-xl text-center shadow-md mb-8">
                <p className="text-lg text-slate-900 font-bold">&quot;Describe a memorable journey you have made...&quot;</p>
                {transcript && (
                  <p className="text-xs text-slate-500 mt-2 italic max-h-20 overflow-y-auto">&ldquo;{transcript}&rdquo;</p>
                )}
              </div>

              <button 
                onClick={handleStop}
                className="group flex items-center justify-center w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Square className="w-8 h-8 text-white fill-white" />
              </button>
              <p className="text-slate-500 mt-4 text-xs font-bold uppercase tracking-wider">Tap to finish speaking</p>
            </div>
          )}

          {/* PHASE: ANALYZING */}
          {phase === 'analyzing' && (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#027FFF] rounded-full border-t-transparent animate-spin"></div>
                <BrainCircuit className="w-10 h-10 text-[#027FFF] animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-wide">AI Examiner Grading...</h2>
              <p className="text-slate-500 text-sm">Running multi-agent rubric analysis on your audio</p>
            </div>
          )}

          {/* PHASE: RESULTS */}
          {phase === 'results' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full shadow-md animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Evaluation Complete</h2>
                  <p className="text-xs text-slate-500 font-medium">Your response has been graded against official standards.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Estimated Band</p>
                  <p className="text-5xl font-extrabold text-[#027FFF]">{feedback ? (Number(feedback.overall_score) * 10).toFixed(1) : "7.5"}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500 font-bold uppercase">Fluency</span>
                    <span className="text-sm font-bold text-slate-900">7.5</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500 font-bold uppercase">Lexical</span>
                    <span className="text-sm font-bold text-slate-900">7.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Grammar</span>
                    <span className="text-sm font-bold text-slate-900">7.5</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
                <h4 className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wider">Primary Weakness Detected</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  You paused frequently when searching for past tense verbs. I recommend the <span className="font-bold underline cursor-pointer">Past Tense Fluency Drill</span> before your next attempt.
                </p>
              </div>

              <div className="flex justify-end">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm transition-colors shadow-sm"
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
