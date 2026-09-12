import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B1221] mt-20 border-t border-white/5">
      <div className="max-w-[80rem] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img alt="Pen & Page Academia Logo" className="h-12 w-auto object-contain" src="/logo.png" />
              <span className="font-title-md text-[20px] text-white font-bold tracking-tight">PPAcademia AI</span>
            </div>
            <p className="font-body-sm text-[14px] text-slate-400 leading-relaxed">
              Rigorous, adaptive multi-agent AI preparation engineered to evaluate and elevate your language proficiency score with institutional precision.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-caption text-[12px] font-medium tracking-wide">
                Band 7.5+ Target Focus
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-label-md text-[13px] text-white font-bold uppercase tracking-widest mb-2">Learning</h3>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/courses">Courses Overview</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/how-it-works">Adaptive Engine</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/courses">Academic Modules</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/courses">Diagnostic Evaluation</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-label-md text-[13px] text-white font-bold uppercase tracking-widest mb-2">Company</h3>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/about">About Us</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/how-it-works">How It Works</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/contact">Contact Support</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-label-md text-[13px] text-white font-bold uppercase tracking-widest mb-2">Legal & Security</h3>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/contact">Privacy Policy</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/contact">Terms of Service</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/contact">Security & Compliance</Link>
            <Link className="font-body-sm text-[14px] text-slate-400 hover:text-amber-400 transition-colors" href="/contact">Candidate Integrity</Link>
          </div>

        </div>

        <div className="pt-8 mt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-caption text-[13px] text-slate-500">© 2026 PPAcademia AI Adaptive Assessment Technologies Inc. All rights reserved.</p>
          <p className="font-caption text-[13px] text-slate-500">Strict alignment with official language proficiency descriptor rubrics.</p>
        </div>
      </div>
    </footer>
  );
}
