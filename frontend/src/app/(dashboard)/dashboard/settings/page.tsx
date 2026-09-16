'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, User, Target, Calendar, Mic, 
  Video, Bell, Shield, Save, CheckCircle2, 
  Sliders, Award, Sparkles, Volume2, 
  RefreshCw, Check, AlertCircle, Camera
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { toast } from '@/components/ToastProvider';

interface UserSettings {
  fullName: string;
  email: string;
  avatar: string;
  targetBand: number;
  targetCefr: string;
  examType: 'IELTS Academic' | 'IELTS General Training' | 'Cambridge C2 Proficiency' | 'PTE Academic';
  examDate: string;
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  streakReminders: boolean;
  audioFeedback: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  fullName: 'Hamza Arshid',
  email: 'student@penpage.academy',
  avatar: '👨‍🎓',
  targetBand: 8.5,
  targetCefr: 'C2',
  examType: 'IELTS Academic',
  examDate: '2026-11-20',
  dailyGoalMinutes: 45,
  emailNotifications: true,
  streakReminders: true,
  audioFeedback: true,
};

const AVATARS = ['👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍🔬', '👩‍🏫', '👨‍💻', '🌟', '🚀', '🎯'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'hardware' | 'notifications' | 'profile'>('goals');

  // Mic & Camera test state
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingCam, setIsTestingCam] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [camStatus, setCamStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load persisted settings if available
    try {
      const saved = localStorage.getItem('penpage_user_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('penpage_user_settings', JSON.stringify(settings));
      setIsSaved(true);
      toast.success('Settings Saved! 🎯', 'Your study goals, targets, and device preferences have been updated.');
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      toast.error('Save Notice', 'Could not persist settings.');
    }
  };

  // Mic test
  const handleToggleMicTest = async () => {
    if (isTestingMic) {
      setIsTestingMic(false);
      setMicLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsTestingMic(true);
      toast.success('Microphone Connected! 🎙️', 'Speak to test input audio levels.');

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkLevel = () => {
        if (!isTestingMic) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch {
      toast.error('Mic Access Denied', 'Please allow microphone permissions in your browser.');
    }
  };

  // Cam test
  const handleToggleCamTest = async () => {
    if (isTestingCam) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      setIsTestingCam(false);
      setCamStatus('idle');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsTestingCam(true);
      setCamStatus('success');
      toast.success('Webcam Connected! 📹', 'Camera preview is live for Speaking Simulator.');
    } catch {
      setCamStatus('error');
      toast.error('Camera Access Denied', 'Please allow camera permissions in your browser.');
    }
  };

  // Calculate days remaining to exam
  const calculateDaysRemaining = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Sliders className="w-8 h-8 text-[#027FFF]" /> Candidate Target &amp; System Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">Calibrate your IELTS target band, exam countdown, daily study goals, and hardware diagnostics.</p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Preferences Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'goals' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4 text-[#027FFF]" />
            Academic Goals &amp; Exam Countdown
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hardware' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mic className="w-4 h-4 text-purple-600" />
            Hardware &amp; Simulator Diagnostics
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            Profile &amp; Avatar
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            Notifications &amp; Reminders
          </button>
        </div>

        {/* Tab 1: Academic Goals & Exam Countdown */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Target Band & CEFR Card */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Target Score &amp; Track Calibration</h3>
                  <p className="text-xs text-slate-500">Align your AI difficulty, mock scoring, and diagnostic rubrics.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#027FFF] text-xs font-black">
                  Band {settings.targetBand} • {settings.targetCefr}
                </div>
              </div>

              {/* Target Band Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Target IELTS Band:</span>
                  <span className="text-2xl font-black text-[#027FFF]">Band {settings.targetBand}</span>
                </div>
                <input
                  type="range"
                  min="5.5"
                  max="9.0"
                  step="0.5"
                  value={settings.targetBand}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSettings({
                      ...settings,
                      targetBand: val,
                      targetCefr: val >= 8.5 ? 'C2' : val >= 7.0 ? 'C1' : 'B2'
                    });
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#027FFF]"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Band 5.5 (B2)</span>
                  <span>Band 7.0 (C1 Proficient)</span>
                  <span>Band 8.5 (C2 Mastery)</span>
                  <span>Band 9.0 (Expert)</span>
                </div>
              </div>

              {/* Exam Track Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Active Examination Track:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'IELTS Academic', label: 'IELTS Academic', desc: 'University admissions & professional registration' },
                    { id: 'IELTS General Training', label: 'IELTS General Training', desc: 'Immigration (Express Entry, Canada, Australia)' },
                    { id: 'Cambridge C2 Proficiency', label: 'Cambridge C2 (CPE)', desc: 'Highest CEFR executive mastery certification' },
                    { id: 'PTE Academic', label: 'PTE Academic', desc: 'Pearson English computer-delivered test' }
                  ].map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, examType: track.id as UserSettings['examType'] })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        settings.examType === track.id
                          ? 'bg-blue-50/80 border-[#027FFF] text-blue-950 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black">{track.label}</span>
                      <span className="text-[11px] text-slate-500 leading-snug mt-0.5 block">{track.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Study Commitment */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Daily Study Target Goal:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSettings({ ...settings, dailyGoalMinutes: mins })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        settings.dailyGoalMinutes === mins
                          ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mins} mins/day
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Exam Countdown & Readiness Card */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Countdown Tile */}
              <div className="bg-gradient-to-br from-[#0F172A] to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Target Exam Date
                    </span>
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">Official Test Day Countdown</h4>
                  
                  <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-5xl font-black text-cyan-400 tracking-tight font-mono">
                      {calculateDaysRemaining(settings.examDate)}
                    </span>
                    <span className="block text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                      Days Remaining
                    </span>
                  </div>

                  <div className="space-y-1.5 mt-4">
                    <label className="text-xs font-semibold text-slate-300">Change Exam Date:</label>
                    <input
                      type="date"
                      value={settings.examDate}
                      onChange={(e) => setSettings({ ...settings, examDate: e.target.value })}
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Adaptive drills recalibrate daily based on your remaining countdown velocity.</span>
                </div>
              </div>

              {/* CEFR Readiness Badge */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-200">
                  {settings.targetCefr}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">CEFR Target Standard</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {settings.targetCefr === 'C2' 
                      ? 'Mastery Level: Can understand virtually everything heard or read with effortless precision.'
                      : 'Effective Operational Proficiency: Expresses ideas fluently without obvious searching for expressions.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Hardware & Simulator Diagnostics */}
        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
            
            {/* Microphone Test */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#027FFF] flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Microphone Input Check</h3>
                    <p className="text-xs text-slate-500">Test clarity &amp; input gain for Speaking Simulator</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMicTest}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isTestingMic 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-[#027FFF] text-white shadow-sm hover:bg-blue-600'
                  }`}
                >
                  {isTestingMic ? 'Stop Test' : 'Test Microphone'}
                </button>
              </div>

              {/* Volume Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Input Volume Level:</span>
                  <span className="font-mono">{isTestingMic ? `${micLevel}%` : 'Inactive'}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-100 ${
                      micLevel > 70 ? 'bg-amber-500' : micLevel > 20 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${isTestingMic ? micLevel : 0}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Speak into your microphone. If the bar moves into the green zone, your audio is ready for AI fluency scoring.
                </p>
              </div>
            </div>

            {/* Webcam Test */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Webcam Viewfinder</h3>
                    <p className="text-xs text-slate-500">Preview camera positioning for Speaking Part 2 &amp; 3</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleCamTest}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isTestingCam 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-purple-600 text-white shadow-sm hover:bg-purple-700'
                  }`}
                >
                  {isTestingCam ? 'Stop Camera' : 'Test Webcam'}
                </button>
              </div>

              {/* Viewfinder Display */}
              <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isTestingCam ? 'hidden' : ''}`}
                />
                {!isTestingCam && (
                  <div className="text-center p-4">
                    <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-400">Camera preview is offline</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Profile & Avatar */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm max-w-2xl animate-in fade-in duration-200 space-y-6">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Personal Candidate Profile</h3>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Avatar Icon:</label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSettings({ ...settings, avatar: av })}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border transition-all ${
                      settings.avatar === av
                        ? 'bg-blue-50 border-[#027FFF] shadow-md scale-105'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  value={settings.fullName}
                  onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-[#027FFF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address:</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications & Reminders */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm max-w-2xl animate-in fade-in duration-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">Notification Preferences</h3>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Daily Study Streak Reminders</span>
                <span className="text-[11px] text-slate-500">Receive gentle nudges to keep your daily practice streak active.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.streakReminders}
                onChange={(e) => setSettings({ ...settings, streakReminders: e.target.checked })}
                className="w-4 h-4 accent-[#027FFF]"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Audio &amp; Sound Feedback</span>
                <span className="text-[11px] text-slate-500">Play subtle audio chime when completing mock tests and flashcard drills.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.audioFeedback}
                onChange={(e) => setSettings({ ...settings, audioFeedback: e.target.checked })}
                className="w-4 h-4 accent-[#027FFF]"
              />
            </label>
          </div>
        )}

      </main>
    </div>
  );
}
