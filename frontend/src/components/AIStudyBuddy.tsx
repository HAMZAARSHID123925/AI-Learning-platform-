"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, X, Send, Minimize2, Maximize2, 
  HelpCircle, Lightbulb, BookOpen, PenTool, CheckCircle2,
  RefreshCw, MessageSquare, ArrowUpRight
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  category?: 'grammar' | 'vocab' | 'writing' | 'general';
}

const QUICK_PROMPTS = [
  { label: '✨ Band 8+ Synonyms', query: 'Can you give me 5 academic Band 8+ synonyms for the word "important" with example IELTS sentences?' },
  { label: '📝 Task 2 Structure', query: 'What is the optimal 4-paragraph structure for an IELTS "Agree or Disagree" essay?' },
  { label: '🔍 Explain Inversion', query: 'How do I use grammatical inversion (e.g. "Not only... but also") to score Band 8 in Grammatical Range?' },
  { label: '🎙️ Speaking Part 2 Tip', query: 'Give me a 1-minute strategy to structure my IELTS Speaking Part 2 cue card notes.' },
];

export default function AIStudyBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your PPAcademia AI Study Co-Pilot. Need help improving a sentence, explaining an answer, or preparing an IELTS strategy? Ask me anything!",
      time: 'Just now'
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

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate intelligent IELTS pedagogical responses
    setTimeout(() => {
      let aiResponseText = '';
      const lower = text.toLowerCase();

      if (lower.includes('synonym') || lower.includes('important') || lower.includes('vocab')) {
        aiResponseText = `Here are 4 high-register Band 8.5+ alternatives to "important":\n\n1. **Paramount** — *"Effective time management is of paramount significance in the Reading module."*\n2. **Pivotal** — *"Technology plays a pivotal role in educational transformation."*\n3. **Imperative** — *"It is imperative that authorities allocate funding to sustainable transit."*\n4. **Indispensable** — *"Critical thinking remains indispensable for academic research."*`;
      } else if (lower.includes('task 2') || lower.includes('agree') || lower.includes('essay') || lower.includes('structure')) {
        aiResponseText = `**Band 8+ Task 2 "Agree/Disagree" Architecture:**\n\n• **Introduction (45-50 words)**: Paraphrase the prompt + explicitly state your direct thesis stance.\n• **Body 1 (90 words)**: Primary argument + real-world evidence or causal reasoning + impact.\n• **Body 2 (90 words)**: Secondary supporting argument + counter-perspective resolution.\n• **Conclusion (35-40 words)**: Restate thesis with refreshed lexical terms (no new points).`;
      } else if (lower.includes('inversion') || lower.includes('grammar') || lower.includes('range')) {
        aiResponseText = `**Grammatical Inversion for Band 8+ GRA:**\n\nWhen starting with negative adverbs (*Rarely, Seldom, Not only*), invert the auxiliary verb and subject:\n\n• Standard: *"Governments should not only regulate emissions, but they must also subsidize solar power."*\n• **Inverted (Band 8+)**: *"Not only **should governments** regulate emissions, but they must also subsidize solar power."*\n• Example 2: *"Seldom **do we witness** such rapid cognitive adaptation in adult learners."*`;
      } else if (lower.includes('speaking') || lower.includes('part 2') || lower.includes('cue card')) {
        aiResponseText = `**1-Minute Speaking Part 2 Note-Taking Blueprint:**\n\nDivide your scratch paper into 4 quadrant bullets:\n1. **WHO/WHAT**: (2 key nouns)\n2. **WHEN/WHERE**: (Past narrative setting)\n3. **WHAT HAPPENED**: (3 sequential action verbs)\n4. **WHY IT MATTERS**: (Feelings + high-level reflection)\n\n*Pro-tip: Focus 60% of your talking time on point 4 (Why it was memorable) to showcase emotional and philosophical fluency!*`;
      } else {
        aiResponseText = `That's an excellent question! In academic IELTS and CEFR English, precision and coherence are key.\n\nTo optimize this concept:\n• Ensure strong **lexical variety** without forcing archaic words.\n• Use clear **cohesive linkers** (*Consequently, In contrast, To substantiate*).\n• Maintain consistent **subject-verb alignment**.\n\nWould you like me to generate a practice drill on this topic or review a sentence you've written?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      
      {/* ─── FLOATING LAUNCH BUBBLE ─── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#027FFF] via-[#0066CC] to-[#0B1221] text-white font-bold text-sm shadow-[0_8px_30px_rgba(2,127,255,0.45)] hover:shadow-[0_12px_40px_rgba(2,127,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0B1221] animate-pulse" />
          </div>
          <span className="tracking-tight">AI Study Buddy</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-black text-[#5BC0EB] tracking-wider border border-white/10">
            Co-Pilot
          </span>
        </button>
      )}

      {/* ─── CHAT WINDOW ─── */}
      {isOpen && (
        <div className={`relative w-[380px] sm:w-[420px] bg-[#0B1221] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]'
        }`}>
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#027FFF]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#5BC0EB]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#027FFF] to-[#5BC0EB] p-0.5 shadow-md shadow-[#027FFF]/30">
                <div className="w-full h-full bg-[#0B1221] rounded-[10px] flex items-center justify-center text-[#5BC0EB]">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">AI Study Buddy</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-slate-400">Examiner-Calibrated Co-Pilot</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-[#027FFF] text-white rounded-br-none shadow-md shadow-[#027FFF]/20'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-none w-24">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#5BC0EB] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Carousel */}
              <div className="relative z-10 px-4 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.query)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-[#027FFF]/20 hover:border-[#027FFF]/40 border border-slate-700/60 text-[11px] font-medium text-slate-300 hover:text-white transition-all whitespace-nowrap"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="relative z-10 p-3.5 border-t border-slate-800 bg-[#0B1221]">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask about grammar, essay rewrites, IELTS tips..."
                    className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#027FFF] focus:ring-1 focus:ring-[#027FFF] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] disabled:opacity-40 text-white shadow-md shadow-[#027FFF]/20 transition-all shrink-0"
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
