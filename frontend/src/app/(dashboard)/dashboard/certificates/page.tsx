"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Award, Download, ExternalLink, CheckCircle2, ShieldCheck, 
  Calendar, BookOpen, Star, Sparkles
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Certificate {
  id: string;
  courseTitle: string;
  category: string;
  issueDate: string;
  grade: string;
  credentialId: string;
  instructor: string;
}

const SAMPLE_CERTIFICATES: Certificate[] = [
  {
    id: "CERT-PY-8821",
    courseTitle: "Python Programming & Computational Thinking",
    category: "Computer Science",
    issueDate: "September 15, 2026",
    grade: "Grade A (92%)",
    credentialId: "PPA-CS-882109",
    instructor: "Dr. Alex Vance"
  },
  {
    id: "CERT-ENG-4412",
    courseTitle: "Essential Grammar & Conversational Fluency",
    category: "English & Languages",
    issueDate: "August 28, 2026",
    grade: "Grade A+ (96%)",
    credentialId: "PPA-ENG-441234",
    instructor: "Sarah Jenkins"
  }
];

export default function CertificatesPage() {
  const [certificates] = useState<Certificate[]>(SAMPLE_CERTIFICATES);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(SAMPLE_CERTIFICATES[0]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">My Official Certificates</h1>
              <p className="text-xs text-slate-500 font-medium">View and download your verified course completion credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Back to Overview
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
          {/* Top Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Earned Certificates</span>
                <p className="text-2xl font-black text-slate-900">{certificates.length}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Average Grade</span>
                <p className="text-2xl font-black text-slate-900">94% (A+)</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#027FFF] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Verification Status</span>
                <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" /> 100% Authenticated
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Completed Credentials
              </h3>
              {certificates.map((cert) => {
                const isSelected = selectedCert?.id === cert.id;
                return (
                  <button
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-50/50 border-emerald-500 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-emerald-700 uppercase tracking-wide">
                      {cert.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {cert.courseTitle}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>{cert.issueDate}</span>
                      <span className="font-bold text-emerald-600">{cert.grade}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Certificate Preview Card */}
            {selectedCert && (
              <div className="lg:col-span-2 p-8 md:p-10 rounded-3xl bg-white border-2 border-emerald-400/60 shadow-lg space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

                {/* Certificate Decorative Header */}
                <div className="text-center space-y-2 border-b border-slate-200 pb-6 relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-slate-200">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 pt-2">
                    Pen &amp; Page Academia • Official Certificate of Completion
                  </h3>
                  <p className="text-xs text-slate-500">This is to certify that the candidate has successfully satisfied all academic requirements for</p>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {selectedCert.courseTitle}
                  </h2>
                </div>

                {/* Details Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative z-10">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Grade</span>
                    <span className="text-sm font-black text-emerald-600">{selectedCert.grade}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Issue Date</span>
                    <span className="text-sm font-bold text-slate-800">{selectedCert.issueDate}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Instructor</span>
                    <span className="text-sm font-bold text-slate-800">{selectedCert.instructor}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Credential ID</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{selectedCert.credentialId}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Cryptographically Verified Credential
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" /> Download / Print PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
