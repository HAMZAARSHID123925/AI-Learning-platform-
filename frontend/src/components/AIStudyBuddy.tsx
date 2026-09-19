"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, X, Send, Minimize2, Maximize2, 
  HelpCircle, Lightbulb, BookOpen, PenTool, CheckCircle2,
  RefreshCw, MessageSquare, ArrowUpRight, Code2, BrainCircuit,
  GraduationCap, Globe, Copy, Check, Terminal, Atom
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  subject?: string;
}

type SubjectCategory = 'computer_science' | 'mathematics' | 'academic_english' | 'applied_science';

const SUBJECT_CONFIGS: Record<SubjectCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  welcomeText: string;
  placeholder: string;
  quickPrompts: { label: string; query: string }[];
}> = {
  computer_science: {
    label: "CS & Python",
    icon: Code2,
    color: "from-blue-600 to-indigo-600",
    welcomeText: "Hello! I'm your Computer Science & Python Co-Pilot. Ask me to debug code, explain Big-O complexity, or construct data structures!",
    placeholder: "Ask about Python syntax, Big-O, algorithms, databases...",
    quickPrompts: [
      { label: "⚡ Big-O Guide", query: "Can you explain Big-O time complexity for common sorting algorithms and data structures?" },
      { label: "🌲 Binary Search Trees", query: "How does a balanced Binary Search Tree maintain O(log n) lookup time in Python?" },
      { label: "🧱 Stacks vs Queues", query: "Explain the architectural differences between LIFO stacks and FIFO queues with Python examples." },
      { label: "💾 ACID Databases", query: "What do the four ACID properties guarantee in relational database transactions?" }
    ]
  },
  mathematics: {
    label: "Mathematics",
    icon: BrainCircuit,
    color: "from-amber-600 to-orange-600",
    welcomeText: "Welcome to Math & Calculus AI. I can guide you through derivative proofs, matrix transformations, and algebra step-by-step.",
    placeholder: "Ask about derivatives, integrals, matrices, quadratic equations...",
    quickPrompts: [
      { label: "📐 Power Rule Derivative", query: "Show me the step-by-step derivative of f(x) = 3x^3 - 5x^2 + 7 with respect to x." },
      { label: "🧮 Matrix Determinants", query: "What does the determinant of a 2x2 matrix geometrically represent in linear transformations?" },
      { label: "∫ Definite Integrals", query: "How do I evaluate the definite integral from 0 to 2 of 2x dx using the Fundamental Theorem of Calculus?" },
      { label: "🎯 Quadratic Formula", query: "Explain the quadratic formula and what the discriminant reveals about real vs complex roots." }
    ]
  },
  academic_english: {
    label: "English & Writing",
    icon: GraduationCap,
    color: "from-emerald-600 to-teal-600",
    welcomeText: "Hello! I'm your Academic English & Rhetoric Tutor. Let's upgrade your essays, master syntactic inversion, and refine academic vocabulary.",
    placeholder: "Ask about academic grammar, essay structure, C2 vocabulary...",
    quickPrompts: [
      { label: "✨ C2 Collocations", query: "Give me 4 high-register academic alternatives to the word 'important' with example sentences." },
      { label: "📝 Essay Architecture", query: "What is the optimal structure for an academic argument and thesis defense?" },
      { label: "🔍 Inversion Structures", query: "How do I use grammatical inversion (e.g., 'Were citizens to recognize...') for advanced style?" },
      { label: "✍️ Upgrade Sentence", query: "Can you upgrade this sentence into formal academic register: 'Online learning makes big problems for lazy students'?" }
    ]
  },
  applied_science: {
    label: "Physics & Science",
    icon: Atom,
    color: "from-purple-600 to-pink-600",
    welcomeText: "Welcome to Applied Physics & Science AI. Ask me about Newtonian dynamics, thermodynamics, wave mechanics, or astrophysics!",
    placeholder: "Ask about Newton's laws, thermodynamics, Doppler shifts, orbits...",
    quickPrompts: [
      { label: "🌌 Newton's Laws", query: "Explain Newton's Three Laws of Motion with real-world engineering examples." },
      { label: "🪐 Inverse-Square Gravity", query: "How does the gravitational force between two planets change if their orbital distance is tripled?" },
      { label: "🔥 Thermodynamics Laws", query: "Explain the First and Second Laws of Thermodynamics and the concept of entropy." },
      { label: "🌊 Doppler Effect", query: "What wave phenomenon explains the frequency shift when a sound or light source moves relative to an observer?" }
    ]
  }
};

export default function AIStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeSubject, setActiveSubject] = useState<SubjectCategory>("computer_science");
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentConfig = SUBJECT_CONFIGS[activeSubject];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: currentConfig.welcomeText,
      time: 'Just now',
      subject: activeSubject
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubjectChange = (newSub: SubjectCategory) => {
    setActiveSubject(newSub);
    const subCfg = SUBJECT_CONFIGS[newSub];
    setMessages(prev => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        sender: 'ai',
        text: `Switched focus to **${subCfg.label}**. ${subCfg.welcomeText}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: newSub
      }
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard! 📋", "Content copied successfully.");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: activeSubject
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          subject: activeSubject,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      let reply = '';
      if (response.ok) {
        const data = await response.json();
        reply = data.reply;
      } else {
        reply = `I'm your **${currentConfig.label}** AI Study Co-Pilot. How can I assist with your coursework today?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: activeSubject
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to connect to AI study chat:", err);
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I'm here to help with your **${currentConfig.label}** studies. Ask any question!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: activeSubject
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      
      {/* ─── FLOATING LAUNCH BUBBLE ─── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#001F3F] via-[#027FFF] to-[#001F3F] text-white font-bold text-sm shadow-[0_8px_30px_rgba(2,127,255,0.4)] hover:shadow-[0_12px_40px_rgba(2,127,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#001F3F] animate-pulse" />
          </div>
          <span className="tracking-tight">Academy AI Tutor</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-black text-amber-300 tracking-wider border border-white/10">
            24/7 Co-Pilot
          </span>
        </button>
      )}

      {/* ─── CHAT WINDOW ─── */}
      {isOpen && (
        <div className={`relative w-[390px] sm:w-[440px] bg-[#0B1221] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[620px] max-h-[85vh]'
        }`}>
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#027FFF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5BC0EB]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#027FFF] to-[#5BC0EB] p-0.5 shadow-md shadow-[#027FFF]/30">
                <div className="w-full h-full bg-[#0B1221] rounded-[10px] flex items-center justify-center text-[#5BC0EB]">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Academy AI Tutor</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-slate-400">Multi-Discipline Academic Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject Switcher Strip */}
          {!isMinimized && (
            <div className="relative z-10 px-3 py-2 border-b border-slate-800/60 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(Object.keys(SUBJECT_CONFIGS) as SubjectCategory[]).map((subKey) => {
                const cfg = SUBJECT_CONFIGS[subKey];
                const IconComp = cfg.icon;
                const isSelected = activeSubject === subKey;
                return (
                  <button
                    key={subKey}
                    onClick={() => handleSubjectChange(subKey)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#027FFF] text-white shadow-sm shadow-[#027FFF]/40 border border-blue-400/40"
                        : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Area */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col group ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#027FFF] text-white rounded-br-none shadow-md shadow-[#027FFF]/20'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}>
                      {msg.text}

                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none w-24">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Quick Prompts Carousel */}
              <div className="relative z-10 px-3 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {currentConfig.quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-[#027FFF]/20 hover:border-[#027FFF]/40 border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white transition-all whitespace-nowrap cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="relative z-10 p-3 border-t border-slate-800 bg-[#0B1221]">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={currentConfig.placeholder}
                    className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#027FFF] focus:ring-1 focus:ring-[#027FFF] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] disabled:opacity-40 text-white shadow-md shadow-[#027FFF]/20 transition-all shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}
