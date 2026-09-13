import Link from 'next/link';
import { 
  ArrowRight, BrainCircuit, Target, Zap, 
  BarChart3, Video, CheckCircle2, Mic 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 font-sans selection:bg-[#027FFF] selection:text-white overflow-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-[#050B14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#027FFF] to-[#5BC0EB] p-0.5">
              <div className="w-full h-full bg-[#0B1221] rounded-[6px] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-[#5BC0EB]" />
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PPAcademia</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#methodology" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hidden sm:flex items-center justify-center px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#027FFF] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse" style={{ animationDuration: "8s" }}></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#027FFF]/10 border border-[#027FFF]/20 text-[#5BC0EB] text-xs font-bold mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#5BC0EB] animate-pulse"></span>
            The Future of IELTS Prep
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
            Master your English with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5BC0EB] to-[#027FFF]">
              Multi-Agent AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop wasting months on static courses. Our adaptive AI assesses your exact weaknesses, generates custom lessons, and grades your speaking in real-time to get you a Band 8.0 faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#027FFF] to-[#026bd6] hover:from-[#026bd6] hover:to-[#0259b3] text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(2,127,255,0.3)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(2,127,255,0.5)]">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#methodology" className="w-full sm:w-auto px-8 py-4 bg-[#0f182c] hover:bg-white/5 border border-white/10 text-white font-bold rounded-2xl transition-all">
              See How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-[#0B1221] px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Why choose PPAcademia?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to succeed, powered by the world&apos;s most advanced LLMs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f182c] border border-white/5 p-8 rounded-3xl hover:border-[#027FFF]/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#027FFF]/10 flex items-center justify-center border border-[#027FFF]/20 mb-6">
                <Mic className="w-6 h-6 text-[#027FFF]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Speaking Simulator</h3>
              <p className="text-slate-400 leading-relaxed">Practice IELTS speaking parts 1-3 with an AI examiner that listens to your voice and grades you instantly.</p>
            </div>

            <div className="bg-[#0f182c] border border-white/5 p-8 rounded-3xl hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Adaptive Study Plans</h3>
              <p className="text-slate-400 leading-relaxed">Our AI identifies your specific weaknesses (e.g. Lexical Resource) and dynamically alters your syllabus to fix them.</p>
            </div>

            <div className="bg-[#0f182c] border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Human Expert Classes</h3>
              <p className="text-slate-400 leading-relaxed">AI isn&apos;t everything. Join scheduled live Zoom sessions with certified IELTS instructors to perfect your strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-[#027FFF]/20 to-emerald-500/20 blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0f182c] to-[#050B14] border border-white/10 rounded-[3rem] p-10 md:p-16 text-center relative z-10 shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to achieve your target score?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">Join thousands of students who have cracked the IELTS and mastered General English in record time.</p>
          
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] text-lg">
            Create your account <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2026 PPAcademia. All rights reserved.</p>
      </footer>
    </div>
  );
}
