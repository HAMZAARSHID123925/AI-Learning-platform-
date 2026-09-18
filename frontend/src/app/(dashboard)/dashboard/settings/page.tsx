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
import { fetchWithAuth } from '@/lib/api';

interface UserSettings {
  fullName: string;
  email: string;
  avatar: string;
  primarySubject: string;
  targetProficiency: string;
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  streakReminders: boolean;
  audioFeedback: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  fullName: 'Hamza Arshid',
  email: 'student@penpage.academy',
  avatar: '👨‍🎓',
  primarySubject: 'Computer Science & Python',
  targetProficiency: 'Advanced Mastery (A+)',
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
    // 1. Load user profile from live backend
    async function loadUserProfile() {
      try {
        const res = await fetchWithAuth('/users/me');
        if (res.ok) {
          const user = await res.json();
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
          setSettings(prev => ({
            ...prev,
            fullName: fullName,
            email: user.email,
          }));
        }
      } catch (err) {
        console.warn("Could not load backend user profile:", err);
      }
    }
    loadUserProfile();

    // 2. Load persisted settings
    try {
      const saved = localStorage.getItem('penpage_user_settings');
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('penpage_user_settings', JSON.stringify(settings));
      localStorage.setItem('user_name', settings.fullName);

      const nameParts = settings.fullName.split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || '';

      await fetchWithAuth('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      }).catch(() => null);

      setIsSaved(true);
      toast.success('Settings Synchronized! 🎯', 'Your study preferences and profile have been saved.');
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
      toast.success('Webcam Connected! 📹', 'Camera preview is live for virtual live classes.');
    } catch {
      setCamStatus('error');
      toast.error('Camera Access Denied', 'Please allow camera permissions in your browser.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-36 bg-[#F8FAFC]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Sliders className="w-7 h-7 text-[#027FFF]" /> Account &amp; Study Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your learning track, daily study target, camera/microphone checks, and notification preferences.</p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0"
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

        {/* Tab Navigation Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-sm mb-6 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'goals' 
                  ? 'bg-[#027FFF] text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Target className={`w-4 h-4 ${activeTab === 'goals' ? 'text-white' : 'text-[#027FFF]'}`} />
              Learning Goals &amp; Track
            </button>

            <button
              onClick={() => setActiveTab('hardware')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'hardware' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Mic className={`w-4 h-4 ${activeTab === 'hardware' ? 'text-white' : 'text-purple-600'}`} />
              Hardware &amp; Live Class Diagnostics
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-emerald-600'}`} />
              Profile &amp; Avatar
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notifications' 
                  ? 'bg-amber-500 text-white shadow-sm' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-white' : 'text-amber-500'}`} />
              Notifications &amp; Reminders
            </button>
          </div>
        </div>

        {/* Tab 1: Academic Goals & Track */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Primary Track Card */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Primary Study Subject</h3>
                  <p className="text-xs text-slate-500">Pick your main area of study for personalized AI quizzes and lessons.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#027FFF] text-xs font-black">
                  {settings.primarySubject}
                </div>
              </div>

              {/* Subject Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'Computer Science & Python', label: '💻 Computer Science & Python', desc: 'Coding logic, algorithms, web development' },
                  { id: 'English & Languages', label: '📖 English & Communication', desc: 'Grammar, vocabulary, speaking & writing' },
                  { id: 'Mathematics & Calculus', label: '📐 Mathematics & Problem Solving', desc: 'Algebra, calculus, geometry, statistics' },
                  { id: 'Science & Physics', label: '🔬 Science & Physics', desc: 'Mechanics, biology, experimental thinking' },
                  { id: 'Business & Finance', label: '📊 Business & Finance', desc: 'Marketing, accounting, financial planning' },
                ].map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, primarySubject: track.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      settings.primarySubject === track.id
                        ? 'bg-blue-50/80 border-[#027FFF] text-blue-950 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-black">{track.label}</span>
                    <span className="text-[11px] text-slate-500 leading-snug mt-0.5 block">{track.desc}</span>
                  </button>
                ))}
              </div>

              {/* Daily Study Commitment */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
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

            {/* Target Proficiency & Motivation Card */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-[#0F172A] to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider">
                      Target Level
                    </span>
                    <Award className="w-5 h-5 text-cyan-400" />
                  </div>

                  <h4 className="text-base font-bold text-white mb-2">Mastery Benchmark</h4>
                  <p className="text-xs text-slate-300 mb-4">Your AI test questions will adjust dynamically to keep you challenged and progressing.</p>
                  
                  <div className="my-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-2xl font-black text-cyan-400 tracking-tight">
                      {settings.targetProficiency}
                    </span>
                    <span className="block text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider">
                      Current Target Standard
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>The platform continuously pinpoints weak topics and generates targeted quizzes.</span>
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
