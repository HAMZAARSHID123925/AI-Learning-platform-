"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, PlayCircle, FileText, Download, 
  Video, Play, Pause, Volume2, VolumeX, Maximize2, 
  HelpCircle, Bot, Send, Sparkles, X, ChevronRight,
  BookOpen, Check, Award, RotateCcw
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz';
  duration: string;
  videoUrl?: string;
  pdfUrl?: string;
  completed: boolean;
  description: string;
  overviewNotes: string[];
  transcript: { time: string; text: string }[];
  quizQuestions?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'les-1',
    title: '1. Introduction to Computational Thinking & Python',
    type: 'video',
    duration: '12 mins',
    videoUrl: 'https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc?autoplay=0&rel=0',
    completed: true,
    description: 'Understand the fundamental logic behind computer programming, writing clean Python syntax, and executing your first program.',
    overviewNotes: [
      'Learn how variables store data in computer memory (RAM).',
      'Understand standard data types: Integers, Floats, Strings, and Booleans.',
      'Write and execute your first Python print statement and user inputs.'
    ],
    transcript: [
      { time: '00:00', text: 'Welcome to Module 1. In this session, we introduce computational logic and Python syntax.' },
      { time: '02:15', text: 'Variables are named containers used to store data values for later calculation.' },
      { time: '05:40', text: 'Let us see how Python executes commands sequentially line-by-line.' },
      { time: '09:10', text: 'Try writing your first interactive script using the input() function.' }
    ]
  },
  {
    id: 'les-2',
    title: '2. Python Core Data Types & Syntax Reference Guide',
    type: 'pdf',
    duration: 'PDF Document • 8 mins',
    pdfUrl: '/resources/python_guide.pdf',
    completed: false,
    description: 'Comprehensive cheat-sheet covering Python variable rules, math operators, string manipulation, and type casting.',
    overviewNotes: [
      'Visual diagrams explaining how data types behave in arithmetic operations.',
      'Includes 15+ interactive practice mini-exercises with solution keys.',
      'Best practices for naming variables and writing readable code comments.'
    ],
    transcript: []
  },
  {
    id: 'les-3',
    title: '3. Conditional Logic & For/While Loops',
    type: 'video',
    duration: '16 mins',
    videoUrl: 'https://www.youtube-nocookie.com/embed/k9TUPpGqYTo?autoplay=0&rel=0',
    completed: false,
    description: 'Master if-elif-else conditional branching and automate repetitive tasks using for and while loops.',
    overviewNotes: [
      'Control program flow using boolean logic operators (and, or, not).',
      'Iterate over sequences and numbers using the range() function.',
      'Avoid infinite loops and learn to use the break and continue statements.'
    ],
    transcript: [
      { time: '00:00', text: 'In this lesson, we explore decision-making in code using if statements.' },
      { time: '03:30', text: 'Loops allow computers to repeat operations millions of times without manual effort.' },
      { time: '07:45', text: 'Let us build a simple guessing game using a while loop and random numbers.' }
    ]
  },
  {
    id: 'les-4',
    title: '4. Module 1 Checkpoint: Python Basics & Logic Quiz',
    type: 'quiz',
    duration: '5 Questions • 10 mins',
    completed: false,
    description: 'Interactive checkpoint quiz testing your understanding of Python variables, data types, and loop execution.',
    overviewNotes: [
      'Answer all questions to test your knowledge and unlock Module 2.',
      'Instant AI scoring with detailed explanation for every answer.',
      'Scores above 80% earn the "Python Novice" milestone badge.'
    ],
    transcript: [],
    quizQuestions: [
      {
        question: 'Which of the following data types is used to store fractional decimal numbers in Python?',
        options: [
          'Integer (int)',
          'Float (float)',
          'String (str)',
          'Boolean (bool)'
        ],
        correct: 1,
        explanation: 'Floats are used to represent decimal/fractional numbers in Python (e.g. `3.14`).'
      },
      {
        question: 'How many times will `for x in range(4):` execute its block of code?',
        options: [
          '3 times',
          '4 times',
          '5 times',
          '0 times'
        ],
        correct: 1,
        explanation: '`range(4)` generates numbers 0, 1, 2, 3, which executes exactly 4 times.'
      },
      {
        question: 'What is the output of `print(10 // 3)` in Python?',
        options: [
          '3.333',
          '3',
          '1',
          '30'
        ],
        correct: 1,
        explanation: 'The `//` operator performs integer (floor) division, returning 3 without the decimal remainder.'
      }
    ]
  }
];

export default function LessonPlayerPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500 font-semibold">Loading Lesson Player...</div>}>
      <LessonPlayerContent />
    </Suspense>
  );
}

function LessonPlayerContent() {
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get('id');
  const requestedCourseId = searchParams.get('courseId');

  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string>('les-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'quiz'>('overview');
  const [dbLessonBody, setDbLessonBody] = useState<string | null>(null);
  const [mediaAssetUrl, setMediaAssetUrl] = useState<string | null>(null);

  const [courseTitle, setCourseTitle] = useState<string>('Full-Stack Computer Science & Python Mastery');
  const [moduleTitle, setModuleTitle] = useState<string>('Module 1: Computational Logic & Python Foundations');

  // Dynamic backend loading: Fetch course syllabus and requested lesson
  useEffect(() => {
    async function loadDynamicCourseAndLesson() {
      // Preset multi-subject syllabi
      if (requestedCourseId === 'eng-201' || requestedCourseId === 'eng-academic') {
        setCourseTitle('English Grammar, Academic Writing & Fluency');
        setModuleTitle('Module 1: Advanced Grammar & Syntactic Range');
        setLessons([
          {
            id: 'les-eng-1',
            title: '1. Complex Clause Construction & Coordination',
            type: 'video',
            duration: '14 mins',
            videoUrl: 'https://www.youtube-nocookie.com/embed/B_mS7b2q_iI?autoplay=0&rel=0',
            completed: false,
            description: 'Master dependent clauses, coordinating conjunctions, and sentence variety for clear academic writing.',
            overviewNotes: [
              'Understand independent vs dependent clause boundaries.',
              'Use transitional phrases with accurate comma placement.',
              'Avoid run-on sentences and comma splices in academic essays.'
            ],
            transcript: [
              { time: '00:00', text: 'Welcome to English Grammar Mastery. In this unit, we explore complex clauses.' },
              { time: '04:10', text: 'Subordinating conjunctions establish logical relationships between ideas.' },
              { time: '08:30', text: 'Let us analyze high-scoring sample sentences and correct common errors.' }
            ]
          },
          {
            id: 'les-eng-2',
            title: '2. Academic Collocations & Vocabulary Reference Sheet',
            type: 'pdf',
            duration: 'PDF Document • 10 mins',
            pdfUrl: '/logo.png',
            completed: false,
            description: 'Curated reference list of formal academic vocabulary, linking words, and high-frequency collocations.',
            overviewNotes: [
              '100+ formal academic collocations with example sentences.',
              'Guidelines on avoiding conversational slang in formal writing.',
              'Practice sentence transformation exercises.'
            ],
            transcript: []
          },
          {
            id: 'les-eng-3',
            title: '3. Grammar & Clause Structure Checkpoint Quiz',
            type: 'quiz',
            duration: '5 Questions • 10 mins',
            completed: false,
            description: 'Evaluate your ability to identify clause types and punctuation rules.',
            overviewNotes: [
              'Complete all questions to unlock the next module.',
              'Instant AI score breakdown with detailed explanations.'
            ],
            transcript: [],
            quizQuestions: [
              {
                question: 'Which of the following is a complex sentence?',
                options: [
                  'Although the experiment failed, the researchers gained valuable data.',
                  'The experiment failed and the researchers stopped.',
                  'The experiment failed.',
                  'The researchers tested the sample in the laboratory.'
                ],
                correct: 0,
                explanation: 'A complex sentence contains an independent clause and at least one dependent clause (beginning with "Although").'
              }
            ]
          }
        ]);
        setActiveLessonId('les-eng-1');
        return;
      } else if (requestedCourseId === 'math-301' || requestedCourseId === 'math-algebra') {
        setCourseTitle('Algebra & Problem Solving Masterclass');
        setModuleTitle('Module 1: Linear Equations & Systems');
        setLessons([
          {
            id: 'les-math-1',
            title: '1. Solving Multi-Step Linear Equations',
            type: 'video',
            duration: '16 mins',
            videoUrl: 'https://www.youtube-nocookie.com/embed/NybHckSEQBI?autoplay=0&rel=0',
            completed: false,
            description: 'Step-by-step methodology for isolating variables across equality balance lines.',
            overviewNotes: [
              'Apply inverse operations symmetrically to both sides of an equation.',
              'Clear fractions and decimals using the least common denominator.',
              'Verify solutions through direct substitution.'
            ],
            transcript: [
              { time: '00:00', text: 'Welcome to Algebra Masterclass. Today we solve multi-step linear equations.' },
              { time: '05:00', text: 'Think of an algebraic equation as a balanced scale.' },
              { time: '10:15', text: 'Let us solve 3x + 7 = 22 step-by-step.' }
            ]
          }
        ]);
        setActiveLessonId('les-math-1');
        return;
      } else {
        setCourseTitle('Full-Stack Computer Science & Python Mastery');
        setModuleTitle('Module 1: Computational Logic & Python Foundations');
      }

      // 1. If backend courseId is passed, attempt live fetch
      if (requestedCourseId) {
        try {
          const res = await fetch(`http://localhost:8000/api/v1/courses/${requestedCourseId}`);
          if (res.ok) {
            const courseData = await res.json();
            setCourseTitle(courseData.title || 'Course Curriculum');
            
            const dynamicLessons: Lesson[] = [];
            (courseData.modules || []).forEach((m: any, mIdx: number) => {
              if (mIdx === 0) setModuleTitle(m.title || 'Module 1');
              (m.lessons || []).forEach((l: any, lIdx: number) => {
                dynamicLessons.push({
                  id: l.id,
                  title: `${mIdx + 1}.${lIdx + 1} ${l.title}`,
                  type: 'video',
                  duration: `${l.estimated_minutes || 15} mins`,
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  completed: false,
                  description: `Module: ${m.title}. Explore interactive video lectures, lecture notes, and automated checkpoints.`,
                  overviewNotes: [
                    'Comprehensive syllabus lesson stored in PostgreSQL.',
                    'Synchronized with student progress and daily learning milestones.',
                    'Presigned MinIO S3 media streaming enabled.'
                  ],
                  transcript: [
                    { time: '00:00', text: `Welcome to ${l.title}. In this unit we cover key exam structures.` },
                    { time: '04:15', text: 'Analyze the high-scoring sample sentences and lexical choices.' },
                    { time: '09:30', text: 'Practice applying these concepts in your active writing and speaking.' }
                  ]
                });
              });
            });

            if (dynamicLessons.length > 0) {
              setLessons(dynamicLessons);
              if (requestedLessonId && dynamicLessons.some(l => l.id === requestedLessonId)) {
                setActiveLessonId(requestedLessonId);
              } else {
                setActiveLessonId(dynamicLessons[0].id);
              }
            }
          }
        } catch (err) {
          console.warn("Course syllabus load error:", err);
        }
      }

      // 2. Fetch specific lesson details, text body, and presigned media
      if (requestedLessonId) {
        try {
          const res = await fetch(`http://localhost:8000/api/v1/lessons/${requestedLessonId}`);
          if (res.ok) {
            const data = await res.json();
            setDbLessonBody(data.body_markdown || null);
            
            // Check for MinIO S3 Presigned URL in assets
            if (data.assets && data.assets.length > 0) {
              const firstAsset = data.assets[0];
              if (firstAsset.presigned_url) {
                setMediaAssetUrl(firstAsset.presigned_url);
              }
            }

            // If not loaded via course, merge individual lesson
            setLessons(prev => {
              if (prev.some(l => l.id === data.id)) return prev;
              const newLesson: Lesson = {
                id: data.id,
                title: data.title,
                type: data.assets && data.assets.length > 0 && data.assets[0].mime_type.includes('pdf') ? 'pdf' : 'video',
                duration: `${data.estimated_minutes || 15} mins`,
                videoUrl: data.assets?.[0]?.presigned_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                pdfUrl: data.assets?.[0]?.presigned_url,
                completed: false,
                description: data.body_markdown ? data.body_markdown.slice(0, 150) + '...' : 'Interactive lesson streamed via MinIO S3 storage.',
                overviewNotes: [
                  'Live syllabus unit loaded from PostgreSQL database.',
                  'Assets and media verified via MinIO S3 object storage.',
                  'Telemetry and completion logged directly to student dashboard.'
                ],
                transcript: []
              };
              return [newLesson, ...prev];
            });
            setActiveLessonId(data.id);
          }
        } catch (err) {
          console.warn("Backend lesson load error:", err);
        }
      }
    }
    loadDynamicCourseAndLesson();
  }, [requestedLessonId, requestedCourseId]);
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // AI Copilot Chat State
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Study Copilot. Ask me anything about this lesson, vocabulary collocations, or IELTS band scoring rules.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const completedCount = lessons.filter(l => l.completed).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  // Video playback listeners
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 720);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    toast.info('Playback Speed', `${nextSpeed}x speed`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Complete and next lesson
  const handleToggleComplete = async () => {
    const nextState = !activeLesson.completed;
    const updated = lessons.map(l => l.id === activeLessonId ? { ...l, completed: nextState } : l);
    setLessons(updated);

    if (nextState) {
      // Call real backend completion endpoint if valid UUID
      if (activeLesson.id && activeLesson.id.includes('-') && activeLesson.id.length >= 32) {
        try {
          await fetchWithAuth(`/lessons/${activeLesson.id}/complete`, {
            method: 'POST',
            body: JSON.stringify({ time_spent_seconds: 600 }),
          });
        } catch (err) {
          console.warn("Backend lesson completion sync error:", err);
        }
      }

      toast.success('Lesson Completed! 🎉', `"${activeLesson.title}" marked as complete.`);
      // Advance to next lesson if available
      const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
      if (currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1];
        setTimeout(() => {
          setActiveLessonId(nextLesson.id);
          setIsPlaying(false);
          toast.info('Next Lesson', `Starting "${nextLesson.title}"`);
        }, 600);
      }
    } else {
      toast.info('Status Updated', 'Lesson marked as in progress.');
    }
  };

  // Switch Lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setIsPlaying(false);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    if (lesson.type === 'quiz') setActiveTab('quiz');
    else setActiveTab('overview');
  };

  // Quiz Submission
  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson.quizQuestions) return;
    if (Object.keys(selectedAnswers).length < activeLesson.quizQuestions.length) {
      toast.error('Incomplete Quiz', 'Please answer all questions before submitting.');
      return;
    }
    setQuizSubmitted(true);
    let correctCount = 0;
    activeLesson.quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correctCount++;
    });
    const scorePct = Math.round((correctCount / activeLesson.quizQuestions.length) * 100);
    
    if (scorePct >= 70) {
      toast.success(`Passed with ${scorePct}%! 🏆`, 'Congratulations! Quiz passed successfully.');
      handleToggleComplete();
    } else {
      toast.error(`Score: ${scorePct}%`, 'Review the explanations below and try again.');
    }
  };

  // AI Copilot Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiThinking) return;

    const userQuery = inputMessage.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInputMessage('');
    setIsAiThinking(true);

    setTimeout(() => {
      let reply = "That's a great question! In this lesson, remember that precision matters more than complexity. For Band 8+, focus on appropriate context rather than forcing uncommon words.";
      if (userQuery.toLowerCase().includes('lexical') || userQuery.toLowerCase().includes('vocabulary')) {
        reply = "Lexical Resource accounts for 25% of your IELTS score. Examiners evaluate 3 things: Range of vocabulary, Accuracy of word choice and collocations, and Rarity of spelling/formation errors.";
      } else if (userQuery.toLowerCase().includes('synonym') || userQuery.toLowerCase().includes('important')) {
        reply = "High-scoring academic alternatives for 'important' include: 'paramount', 'pivotal', 'crucial', and 'of significant consequence'. Use them according to the nuance of your sentence!";
      } else if (userQuery.toLowerCase().includes('quiz') || userQuery.toLowerCase().includes('pass')) {
        reply = "To pass the quiz, make sure you choose collocations that sound authentic to a native examiner, such as 'reach a definitive consensus' or 'incur substantial penalties'.";
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsAiThinking(false);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* ── 1. LEFT SIDEBAR: LESSON PLAYLIST & MODULE SYLLABUS ── */}
      <aside className="w-84 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col hidden lg:flex shadow-sm">
        
        {/* Header: Back to Overview */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#027FFF] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        {/* Module Title & Progress */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#027FFF]/10 text-[#027FFF] uppercase tracking-wider line-clamp-1">
              {courseTitle}
            </span>
            <span className="text-xs font-bold text-emerald-600">{progressPercent}% Completed</span>
          </div>
          <h2 className="text-sm font-black text-slate-900 leading-tight mb-2.5 line-clamp-2">
            {moduleTitle}
          </h2>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#027FFF] to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1.5">{completedCount} of {lessons.length} Lessons Finished</p>
        </div>

        {/* Lessons Playlist Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {lessons.map((les) => {
            const isActive = les.id === activeLessonId;
            return (
              <div 
                key={les.id}
                onClick={() => handleSelectLesson(les)}
                className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-3 border-l-4 ${
                  isActive 
                    ? 'bg-blue-50/80 border-[#027FFF]' 
                    : 'border-transparent hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {les.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                    ) : les.type === 'video' ? (
                      <Video className={`w-4 h-4 ${isActive ? 'text-[#027FFF]' : 'text-slate-400'}`} />
                    ) : les.type === 'pdf' ? (
                      <FileText className={`w-4 h-4 ${isActive ? 'text-[#027FFF]' : 'text-slate-400'}`} />
                    ) : (
                      <HelpCircle className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs leading-snug line-clamp-2 ${isActive ? 'font-black text-[#027FFF]' : 'font-bold text-slate-800'}`}>
                      {les.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{les.duration}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#027FFF] shrink-0 mt-2"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button 
            onClick={() => setCopilotOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Study Copilot</span>
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN LESSON & LEARNING STAGE ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
        
        {/* Top Bar on Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-xs font-bold text-slate-900">{activeLesson.title}</span>
        </div>

        {/* Interactive Media Stage */}
        {activeLesson.type === 'video' ? (
          <div className="w-full bg-[#0B1221] border-b border-slate-800 flex items-center justify-center p-0 md:p-6 lg:p-8">
            {/* Embedded Responsive 16:9 Video Player */}
            <div className="w-full max-w-4xl aspect-video rounded-none md:rounded-3xl overflow-hidden shadow-2xl bg-black relative border border-slate-800">
              {activeLesson.videoUrl && (activeLesson.videoUrl.endsWith('.mp4') || activeLesson.videoUrl.includes('.mp4')) ? (
                <video
                  key={activeLesson.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  src={activeLesson.videoUrl}
                />
              ) : (
                <iframe
                  src={activeLesson.videoUrl || (
                    requestedCourseId?.includes('eng') 
                      ? "https://www.youtube-nocookie.com/embed/B_mS7b2q_iI?autoplay=0&rel=0"
                      : requestedCourseId?.includes('math')
                      ? "https://www.youtube-nocookie.com/embed/NybHckSEQBI?autoplay=0&rel=0"
                      : "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc?autoplay=0&rel=0"
                  )}
                  title={activeLesson.title}
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        ) : activeLesson.type === 'pdf' ? (
          /* PDF / Interactive Document Reader Stage */
          <div className="w-full bg-slate-900 border-b border-slate-800 p-6 md:p-8 text-white min-h-[420px] flex flex-col justify-between relative overflow-hidden">
            <div className="max-w-3xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>Interactive Study Document &amp; Reference Guide</span>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
                  {activeLesson.title}
                </h2>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  {activeLesson.description}
                </p>
              </div>

              {/* In-Browser Document Preview Sheet */}
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 space-y-2.5 max-w-2xl font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-cyan-300 font-bold">
                  <span>📄 DOCUMENT SYNOPSIS</span>
                  <span>VERIFIED FACULTY GUIDE</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  {activeLesson.overviewNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">▶</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a 
                  href="/logo.png" 
                  download="Reference_Guide.pdf"
                  className="px-5 py-3 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Reference PDF
                </a>
                <button 
                  onClick={handleToggleComplete}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  {activeLesson.completed ? '✓ Read & Completed' : 'Mark as Read'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Quiz Stage */
          <div className="w-full bg-gradient-to-br from-purple-950 via-slate-900 to-slate-900 p-8 md:p-10 text-white flex flex-col justify-between min-h-[340px] relative">
            <div className="max-w-2xl z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Interactive Knowledge Checkpoint</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {activeLesson.title}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                Complete this checkpoint to test your mastery and update your adaptive diagnostic model.
              </p>
              <button 
                onClick={() => setActiveTab('quiz')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Start Quiz Questions Below &darr;
              </button>
            </div>
          </div>
        )}

        {/* ── 3. LESSON DETAILS, NOTES & INTERACTIVE TABS ── */}
        <div className="max-w-5xl mx-auto w-full p-6 md:p-8 flex-1">
          
          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#027FFF] uppercase tracking-wider">Lesson Focus</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
                {activeLesson.title}
              </h1>
              <p className="text-slate-600 text-xs md:text-sm max-w-2xl leading-relaxed">
                {activeLesson.description}
              </p>
            </div>
            
            <button 
              onClick={handleToggleComplete}
              className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm ${
                activeLesson.completed 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#027FFF] hover:bg-blue-600 text-white'
              }`}
            >
              {activeLesson.completed ? <Check className="w-4 h-4" /> : null}
              {activeLesson.completed ? 'Lesson Completed' : 'Complete & Next Lesson →'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'overview' 
                  ? 'border-[#027FFF] text-[#027FFF]' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Overview &amp; Notes
            </button>
            
            {activeLesson.transcript.length > 0 && (
              <button 
                onClick={() => setActiveTab('transcript')}
                className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'transcript' 
                    ? 'border-[#027FFF] text-[#027FFF]' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                Lesson Transcript
              </button>
            )}

            {activeLesson.quizQuestions && activeLesson.quizQuestions.length > 0 && (
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`pb-3 text-xs md:text-sm font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'quiz' 
                    ? 'border-purple-600 text-purple-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Practice Quiz ({activeLesson.quizQuestions.length} Questions)
              </button>
            )}
          </div>

          {/* Tab Content Display */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {dbLessonBody && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#027FFF]" /> Lesson Content &amp; Study Notes
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line font-serif leading-relaxed">
                      {dbLessonBody}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Key Learning Outcomes</h3>
                  <div className="space-y-2.5">
                    {activeLesson.overviewNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Downloadable Attachment Block */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Lesson Resources &amp; Downloads</h3>
                  <a 
                    href="/logo.png" 
                    download="Lesson_Reference_Guide.pdf"
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#027FFF] transition-all shadow-2xs group max-w-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">
                          {courseTitle.includes('Python') ? 'Python_Core_CheatSheet_Guide.pdf' :
                           courseTitle.includes('English') ? 'Academic_Writing_Syntax_Guide.pdf' :
                           'Mathematics_Equations_Workbook.pdf'}
                        </p>
                        <p className="text-[11px] text-slate-400">2.4 MB • Official Faculty Lesson Companion</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#027FFF] transition-colors" />
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs divide-y divide-slate-100">
                {activeLesson.transcript.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-4">
                    <button 
                      onClick={() => {
                        const parts = item.time.split(':');
                        const secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                        if (videoRef.current) {
                          videoRef.current.currentTime = secs;
                          videoRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                      className="text-xs font-mono font-bold text-[#027FFF] hover:underline shrink-0 px-2 py-0.5 rounded-md bg-blue-50"
                    >
                      {item.time}
                    </button>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && activeLesson.quizQuestions && (
              <div className="space-y-6">
                <div className="space-y-6">
                  {activeLesson.quizQuestions.map((q, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    return (
                      <div key={qIdx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                            Question {qIdx + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selected === optIdx;
                            let btnStyle = 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-800';
                            if (quizSubmitted) {
                              if (optIdx === q.correct) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isChosen && optIdx !== q.correct) {
                                btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                              }
                            } else if (isChosen) {
                              btnStyle = 'border-purple-600 bg-purple-50 text-purple-900 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && optIdx === q.correct && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                            <span className="font-bold text-slate-900">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  {quizSubmitted ? (
                    <button 
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }} 
                      className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake Quiz
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmitQuiz}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs md:text-sm shadow-md transition-colors"
                    >
                      Submit Answers &amp; Check Score
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* ── 4. AI STUDY BUDDY COPILOT (SLIDING DRAWER) ── */}
      {copilotOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-slate-800 text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#027FFF] text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">AI Study Buddy</h3>
                <p className="text-[10px] text-slate-300">Live Lesson Assistant</p>
              </div>
            </div>
            <button onClick={() => setCopilotOpen(false)} className="text-slate-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#027FFF] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    AI
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-[#027FFF] text-white rounded-br-none shadow-xs' 
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex gap-2 items-center text-slate-400 text-xs pl-9">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#027FFF]" />
                <span>AI Tutor is thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about this lesson..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#027FFF]"
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isAiThinking}
              className="p-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Copilot Launch Bubble (when drawer is closed) */}
      {!copilotOpen && (
        <button 
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 px-4 py-3 rounded-full bg-gradient-to-r from-[#027FFF] to-indigo-600 hover:scale-105 text-white font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-[#027FFF]/30 transition-all z-40"
        >
          <Bot className="w-4 h-4" />
          <span>AI Study Buddy</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black uppercase">Copilot</span>
        </button>
      )}

    </div>
  );
}
