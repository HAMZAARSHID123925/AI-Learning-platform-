"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, MessageSquare, Trophy, Mic, MicOff, Video, VideoOff, 
  Flame, Award, Sparkles, Send, ThumbsUp, MessageCircle, 
  ArrowLeft, Search, CheckCircle2, Clock, Globe, ShieldCheck, 
  UserCheck, Play, Radio, Filter, Plus, Share2, Shuffle,
  Star, ChevronDown, ChevronUp, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface PeerPartner {
  id: string;
  name: string;
  country: string;
  flag: string;
  targetBand: string;
  currentStreak: number;
  nativeLanguage: string;
  topicInterest: string;
  status: 'online' | 'in_call' | 'offline';
  avatarBg: string;
}

interface CueCard {
  id: number;
  topic: string;
  title: string;
  bulletPoints: string[];
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatarBg: string;
  flag: string;
  country: string;
  weeklyPoints: number;
  allTimePoints: number;
  streak: number;
  band: string;
  badge: string;
  isCurrentUser?: boolean;
}

interface PostReply {
  id: number;
  author: string;
  authorRole: string;
  avatarBg: string;
  timeAgo: string;
  content: string;
  isInstructor?: boolean;
}

interface ForumPost {
  id: number;
  author: string;
  authorRole: string;
  avatarBg: string;
  timeAgo: string;
  channel: 'Speaking' | 'Writing' | 'Reading' | 'Vocabulary';
  title: string;
  content: string;
  upvotes: number;
  hasUpvoted?: boolean;
  tags: string[];
  isInstructorVerified?: boolean;
  replies: PostReply[];
}

export default function CommunityHubPage() {
  const [activeTab, setActiveTab] = useState<'peer-matcher' | 'leaderboard' | 'discussions'>('peer-matcher');
  const [userName, setUserName] = useState('Hamza');
  
  // Dynamic Cue Cards
  const cueCards: CueCard[] = [
    {
      id: 1,
      topic: "Urban & Environmental Policy",
      title: "Describe an environmental law or policy in your country that had a significant impact.",
      bulletPoints: [
        "What the policy is and when it was introduced",
        "Which problem it intended to resolve",
        "How the public responded to the policy",
        "And explain whether you believe it was ultimately successful"
      ]
    },
    {
      id: 2,
      topic: "Technology & Society",
      title: "Describe a piece of technology you find difficult to imagine living without.",
      bulletPoints: [
        "What the device or system is",
        "How frequently you rely on it daily",
        "How your life would differ without its functionality",
        "And explain why it is irreplaceable to modern society"
      ]
    },
    {
      id: 3,
      topic: "Education & Mentorship",
      title: "Describe an inspiring teacher or mentor who influenced your academic journey.",
      bulletPoints: [
        "Who this person is and what subject they taught",
        "What specific teaching methodology or attitude they used",
        "How their advice altered your perspective or goals",
        "And explain why their guidance was so memorable"
      ]
    },
    {
      id: 4,
      topic: "Travel & Globalization",
      title: "Describe a foreign culture or custom that fascinated you.",
      bulletPoints: [
        "Where this culture originated and when you discovered it",
        "What makes this custom unique or unconventional",
        "How local citizens preserve and practice this tradition",
        "And explain what other societies can learn from it"
      ]
    }
  ];

  const [selectedCueIndex, setSelectedCueIndex] = useState(0);

  // Peer Matcher State
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'searching' | 'matched' | 'rating'>('idle');
  const [matchedPartner, setMatchedPartner] = useState<PeerPartner | null>(null);
  const [prepTimer, setPrepTimer] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [speakingTimer, setSpeakingTimer] = useState(120);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Rubric Scores
  const [fluencyScore, setFluencyScore] = useState(8.0);
  const [lexicalScore, setLexicalScore] = useState(8.5);
  const [grammarScore, setGrammarScore] = useState(8.0);
  const [pronunciationScore, setPronunciationScore] = useState(8.5);
  const [peerFeedbackNote, setPeerFeedbackNote] = useState('');

  // Leaderboard State & Filter
  const [leaderboardFilter, setLeaderboardFilter] = useState<'weekly' | 'all-time' | 'streaks'>('weekly');
  const [userBonusPoints, setUserBonusPoints] = useState(0);

  // Online Peers Roster
  const [onlinePeers, setOnlinePeers] = useState<PeerPartner[]>([
    {
      id: '1',
      name: "Elena Rostova",
      country: "Germany",
      flag: "🇩🇪",
      targetBand: "Band 8.0",
      currentStreak: 12,
      nativeLanguage: "German",
      topicInterest: "Speaking Part 3 (Technology & Society)",
      status: 'online',
      avatarBg: 'bg-emerald-600'
    },
    {
      id: '2',
      name: "Kenji Sato",
      country: "Japan",
      flag: "🇯🇵",
      targetBand: "Band 7.5",
      currentStreak: 8,
      nativeLanguage: "Japanese",
      topicInterest: "Writing Task 2 Academic Structure",
      status: 'online',
      avatarBg: 'bg-blue-600'
    },
    {
      id: '3',
      name: "Priya Sharma",
      country: "India",
      flag: "🇮🇳",
      targetBand: "Band 8.5",
      currentStreak: 21,
      nativeLanguage: "Hindi",
      topicInterest: "Cue Card Drill: Memorable Journeys",
      status: 'online',
      avatarBg: 'bg-purple-600'
    },
    {
      id: '4',
      name: "Lucas Silva",
      country: "Brazil",
      flag: "🇧🇷",
      targetBand: "Band 7.5",
      currentStreak: 5,
      nativeLanguage: "Portuguese",
      topicInterest: "Speaking Part 2 Preparation",
      status: 'online',
      avatarBg: 'bg-amber-600'
    }
  ]);

  // Forum Discussions State
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [replyInputMap, setReplyInputMap] = useState<Record<number, string>>({});
  
  // New Post Modal State
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostChannel, setNewPostChannel] = useState<'Speaking' | 'Writing' | 'Reading' | 'Vocabulary'>('Speaking');

  // Default Seed Posts
  const defaultPosts: ForumPost[] = [
    {
      id: 1,
      author: "Sarah Jenkins (IELTS Lead)",
      authorRole: "Instructor Verified",
      avatarBg: "bg-indigo-600",
      timeAgo: "2 hours ago",
      channel: "Speaking",
      title: "Top 5 Idiomatic Collocations to securely hit Band 8.5 in Part 3",
      content: "When examiners ask abstract speculative questions, avoid basic transitionals. Instead of 'I think that in the future...', utilize 'It is widely anticipated that...' or 'Skeptics might argue conversely...'. These signal high-level syntactic agility.",
      upvotes: 42,
      hasUpvoted: false,
      isInstructorVerified: true,
      tags: ["Part 3", "Band 8.5", "Collocations"],
      replies: [
        {
          id: 101,
          author: "Priya Sharma",
          authorRole: "Student • Band 8.5 Target",
          avatarBg: "bg-purple-600",
          timeAgo: "1 hour ago",
          content: "Thank you Sarah! Would you also recommend 'From a pragmatic standpoint' for economy-related prompts?"
        },
        {
          id: 102,
          author: "Sarah Jenkins (IELTS Lead)",
          authorRole: "Instructor Verified",
          avatarBg: "bg-indigo-600",
          timeAgo: "45 mins ago",
          content: "Absolutely Priya! 'From a pragmatic standpoint' is a top-tier C2 opening phrase.",
          isInstructor: true
        }
      ]
    },
    {
      id: 2,
      author: "Priya Sharma",
      authorRole: "Student • Band 8.5 Target",
      avatarBg: "bg-purple-600",
      timeAgo: "4 hours ago",
      channel: "Writing",
      title: "How I outline Task 2 Agree/Disagree essays in under 3 minutes",
      content: "I always use the 2-claim counter-balance framework. Body 1 acknowledges the prevailing argument with empirical justification, while Body 2 introduces the nuanced refutation with real-world examples.",
      upvotes: 28,
      hasUpvoted: false,
      tags: ["Task 2", "Time Management", "Essay Structure"],
      replies: [
        {
          id: 201,
          author: "Lucas Silva",
          authorRole: "Student • Band 7.5 Target",
          avatarBg: "bg-amber-600",
          timeAgo: "2 hours ago",
          content: "How many words do you typically allocate for the refutation paragraph?"
        }
      ]
    },
    {
      id: 3,
      author: "Alexander Wright",
      authorRole: "Student • Band 8.0 Target",
      avatarBg: "bg-blue-600",
      timeAgo: "Yesterday",
      channel: "Reading",
      title: "True / False / Not Given: The definitive heuristic against traps",
      content: "If the passage discusses a condition that might happen, but the question statement claims it definitely happens, the answer is FALSE, not NOT GIVEN. Watch out for absolute determiners like 'always', 'invariably', and 'proven'!",
      upvotes: 35,
      hasUpvoted: true,
      tags: ["Reading", "T/F/NG", "Tactics"],
      replies: []
    }
  ];

  const [posts, setPosts] = useState<ForumPost[]>(defaultPosts);

  // Load Persisted Data from localStorage on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('user_name');
      if (storedName) setUserName(storedName);

      const storedBonus = localStorage.getItem('community_user_bonus_xp');
      if (storedBonus) {
        setUserBonusPoints(parseInt(storedBonus, 10) || 0);
      }

      const storedPosts = localStorage.getItem('community_forum_posts');
      if (storedPosts) {
        try {
          const parsed = JSON.parse(storedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        } catch (e) {
          console.error("Failed to parse stored forum posts", e);
        }
      }
    }
  }, []);

  // Helper to persist posts
  const savePosts = (newPosts: ForumPost[]) => {
    setPosts(newPosts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_forum_posts', JSON.stringify(newPosts));
    }
  };

  // Master Leaderboard Users (Dynamic)
  const masterLeaderboard: LeaderboardUser[] = [
    { id: '1', name: "Elena Rostova", avatarBg: "bg-emerald-600", flag: "🇩🇪", country: "Germany", weeklyPoints: 3420, allTimePoints: 18900, streak: 32, band: "8.5", badge: "🏆 Master Scholar" },
    { id: '2', name: "Priya Sharma", avatarBg: "bg-purple-600", flag: "🇮🇳", country: "India", weeklyPoints: 3290, allTimePoints: 17450, streak: 45, band: "8.5", badge: "⚡ 45-Day Titan" },
    { id: '3', name: "Alexander Wright", avatarBg: "bg-blue-600", flag: "🇬🇧", country: "UK", weeklyPoints: 3100, allTimePoints: 15800, streak: 28, band: "8.0", badge: "🎯 Lexicon Ace" },
    { id: 'cur', name: `${userName} (You)`, avatarBg: "bg-[#027FFF]", flag: "🇵🇰", country: "Pakistan", weeklyPoints: 2950 + userBonusPoints, allTimePoints: 14200 + userBonusPoints, streak: 15, band: "8.0", badge: "🚀 Fast Riser", isCurrentUser: true },
    { id: '4', name: "Kenji Sato", avatarBg: "bg-indigo-600", flag: "🇯🇵", country: "Japan", weeklyPoints: 2840, allTimePoints: 13900, streak: 19, band: "7.5", badge: "📚 Grammar Specialist" },
    { id: '5', name: "Fatima Al-Mansoor", avatarBg: "bg-teal-600", flag: "🇦🇪", country: "UAE", weeklyPoints: 2710, allTimePoints: 12600, streak: 22, band: "8.0", badge: "🌟 Speaking Star" }
  ];

  // Dynamically sorted leaderboard
  const sortedLeaderboard = [...masterLeaderboard].sort((a, b) => {
    if (leaderboardFilter === 'weekly') return b.weeklyPoints - a.weeklyPoints;
    if (leaderboardFilter === 'all-time') return b.allTimePoints - a.allTimePoints;
    return b.streak - a.streak;
  });

  // Matching Logic
  const handleStartMatching = (targetPartner?: PeerPartner) => {
    setMatchingStatus('searching');
    toast.info("Searching Peer Queue 🎙️", "Looking for an active IELTS Band 7.5+ speaking candidate...");

    setTimeout(() => {
      const partner = targetPartner || onlinePeers[0];
      setMatchedPartner(partner);
      setMatchingStatus('matched');
      setPrepTimer(60);
      setIsPrepActive(true);
      setIsSpeakingActive(false);
      toast.success("Partner Found! 🤝", `Matched with ${partner.name} (${partner.country}). 1-minute cue card prep started!`);
    }, 2000);
  };

  const handleEndCall = () => {
    setMatchingStatus('rating');
    setIsPrepActive(false);
    setIsSpeakingActive(false);
    toast.info("Call Concluded", "Please evaluate your peer's speaking response using the 4-criteria rubric.");
  };

  const handleSubmitPeerReview = () => {
    const updatedBonus = userBonusPoints + 150;
    setUserBonusPoints(updatedBonus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_user_bonus_xp', String(updatedBonus));
    }
    setMatchingStatus('idle');
    setMatchedPartner(null);
    toast.success("+150 XP Earned! 🌟", "Peer calibration recorded. Your leaderboard score has increased!");
  };

  // Timer intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPrepActive && prepTimer > 0) {
      interval = setInterval(() => setPrepTimer(t => t - 1), 1000);
    } else if (isPrepActive && prepTimer === 0) {
      setIsPrepActive(false);
      setIsSpeakingActive(true);
      setSpeakingTimer(120);
      toast.info("Prep Time Complete! 🎙️", "2-minute live response phase is now running. Deliver your response!");
    }
    return () => clearInterval(interval);
  }, [isPrepActive, prepTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeakingActive && speakingTimer > 0) {
      interval = setInterval(() => setSpeakingTimer(t => t - 1), 1000);
    } else if (isSpeakingActive && speakingTimer === 0) {
      setIsSpeakingActive(false);
      handleEndCall();
    }
    return () => clearInterval(interval);
  }, [isSpeakingActive, speakingTimer]);

  // Forum Handlers
  const handleUpvote = (postId: number) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const hasUpvoted = p.hasUpvoted;
        return {
          ...p,
          hasUpvoted: !hasUpvoted,
          upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleAddReply = (postId: number) => {
    const text = replyInputMap[postId];
    if (!text || !text.trim()) {
      toast.error("Empty Reply", "Please write a comment before sending.");
      return;
    }

    const newReply: PostReply = {
      id: Date.now(),
      author: `${userName} (You)`,
      authorRole: "Student • Band 8.0 Target",
      avatarBg: "bg-[#027FFF]",
      timeAgo: "Just now",
      content: text.trim()
    };

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [...p.replies, newReply]
        };
      }
      return p;
    });

    savePosts(updated);
    setReplyInputMap(prev => ({ ...prev, [postId]: '' }));
    toast.success("Reply Saved & Persisted! 💾", "Your feedback was saved and will remain after refreshing.");
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Missing Information", "Please enter a topic title and message.");
      return;
    }

    const newPost: ForumPost = {
      id: Date.now(),
      author: `${userName} (You)`,
      authorRole: "Student • Band 8.0 Target",
      avatarBg: "bg-[#027FFF]",
      timeAgo: "Just now",
      channel: newPostChannel,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      upvotes: 1,
      hasUpvoted: true,
      tags: [newPostChannel, "Discussion"],
      replies: []
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
    toast.success("Discussion Saved & Live! 🚀", "Your thread is saved in local storage and will persist.");
  };

  const filteredPosts = posts.filter(p => {
    const matchChannel = selectedChannel === 'All' || p.channel === selectedChannel;
    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchChannel && matchQuery;
  });

  const currentCue = cueCards[selectedCueIndex];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-[#027FFF]" /> Community Study Hub &amp; Peer Matcher
            </h1>
            <p className="text-sm text-slate-500 mt-1">Live peer speaking drills, interactive discussions, and global score rankings.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1 flex shadow-sm">
              <button
                onClick={() => setActiveTab('peer-matcher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'peer-matcher' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎙️ Peer Speaking Matcher
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'leaderboard' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'discussions' ? 'bg-[#027FFF] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💬 Study Forum ({posts.length})
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>48 Live Candidates</span>
            </div>
          </div>
        </div>

        {/* TAB 1: PEER SPEAKING MATCHER */}
        {activeTab === 'peer-matcher' && (
          <div className="space-y-6">
            {matchingStatus === 'idle' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Action Stage */}
                <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] text-xs font-bold mb-4 border border-blue-200">
                      <Sparkles className="w-3.5 h-3.5" /> Cambridge IELTS Part 2 &amp; Part 3 Stage
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                      1-on-1 Peer Speaking Room
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Practice official Part 2 Cue Cards with another student aiming for Band 7.5+. Enjoy synchronized 1-minute prep &amp; 2-minute live response timers, followed by instant 4-criteria rubric grading.
                    </p>

                    {/* Active Prompt Preview */}
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Current Cue Card Prompt:</span>
                        <button
                          onClick={() => setSelectedCueIndex((prev) => (prev + 1) % cueCards.length)}
                          className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200"
                        >
                          <Shuffle className="w-3 h-3" /> Shuffle Topic ({selectedCueIndex + 1}/{cueCards.length})
                        </button>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">&ldquo;{currentCue.title}&rdquo;</h4>
                      <p className="text-xs text-slate-500 font-medium">Topic Channel: {currentCue.topic}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phase 1</span>
                        <span className="text-sm font-bold text-slate-800">1-Min Note Prep</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phase 2</span>
                        <span className="text-sm font-bold text-slate-800">2-Min Response</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Phase 3</span>
                        <span className="text-sm font-bold text-slate-800">Peer Rubric (+150 XP)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartMatching()}
                    className="w-full py-4 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-[#027FFF]/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-white" /> Find Speaking Partner Now
                  </button>
                </div>

                {/* Available Online Peers */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-black text-slate-900">Active Candidates</h3>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Online</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Click invite to start an instant 1-on-1 session.</p>

                    <div className="space-y-3">
                      {onlinePeers.map(peer => (
                        <div key={peer.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${peer.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                              {peer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">{peer.name}</span>
                                <span>{peer.flag}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">{peer.targetBand} • {peer.currentStreak}d Streak</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStartMatching(peer)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#027FFF] hover:bg-blue-50 transition-colors"
                          >
                            Invite
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Audio Verified</span>
                    <span>AI Monitored</span>
                  </div>
                </div>

              </div>
            )}

            {/* SEARCHING RADAR */}
            {matchingStatus === 'searching' && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-16 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-200 animate-ping absolute" />
                  <div className="w-20 h-20 rounded-full bg-[#027FFF] text-white flex items-center justify-center shadow-lg relative z-10">
                    <Mic className="w-10 h-10 animate-bounce" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900">Matching with Speaking Candidate...</h3>
                  <p className="text-xs text-slate-500 mt-2">Filtering for IELTS Band 7.5+ partners with active audio channels.</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4 animate-spin text-[#027FFF]" /> Connecting audio session...
                </div>
              </div>
            )}

            {/* LIVE MATCHED ROOM */}
            {matchingStatus === 'matched' && matchedPartner && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-lg space-y-6">
                
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>1-on-1 IELTS Cue Card Room</span>
                        <span className="text-xs font-normal text-slate-400">({matchedPartner.name} {matchedPartner.flag})</span>
                      </h2>
                      <p className="text-xs text-slate-500">Official Cambridge Academic Speaking Simulation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isPrepActive && (
                      <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" /> Prep: 00:{prepTimer < 10 ? `0${prepTimer}` : prepTimer}
                      </div>
                    )}
                    {isSpeakingActive && (
                      <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-bold text-sm flex items-center gap-2">
                        <Mic className="w-4 h-4 text-emerald-600 animate-pulse" /> Speaking: {Math.floor(speakingTimer / 60)}:{speakingTimer % 60 < 10 ? `0${speakingTimer % 60}` : speakingTimer % 60}
                      </div>
                    )}

                    <button
                      onClick={handleEndCall}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs transition-colors"
                    >
                      End &amp; Rate Response
                    </button>
                  </div>
                </div>

                {/* Video / Audio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* You */}
                  <div className="relative rounded-3xl bg-slate-900 h-60 flex flex-col justify-between p-4 overflow-hidden border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 text-white text-xs font-bold backdrop-blur">You ({userName})</span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Mic Live</span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#027FFF] text-white flex items-center justify-center text-xl font-black shadow-lg mb-2">
                        {userName[0]}
                      </div>
                      <span className="text-xs text-slate-300 font-semibold">{userName} (Target Band 8.0)</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 z-10">
                      <button 
                        onClick={() => {
                          setIsMicOn(!isMicOn);
                          toast.info(isMicOn ? "Microphone Muted" : "Microphone Enabled");
                        }}
                        className={`p-2.5 rounded-xl text-white transition-colors ${isMicOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => {
                          setIsVideoOn(!isVideoOn);
                          toast.info(isVideoOn ? "Camera Turned Off" : "Camera Enabled");
                        }}
                        className={`p-2.5 rounded-xl text-white transition-colors ${isVideoOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Partner */}
                  <div className="relative rounded-3xl bg-slate-900 h-60 flex flex-col justify-between p-4 overflow-hidden border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full bg-slate-800/80 text-white text-xs font-bold backdrop-blur">
                        Partner: {matchedPartner.name} {matchedPartner.flag}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Radio className="w-3.5 h-3.5 animate-pulse" /> 1080p HD</span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 rounded-full ${matchedPartner.avatarBg} text-white flex items-center justify-center text-xl font-black shadow-lg mb-2`}>
                        {matchedPartner.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-slate-300 font-semibold">{matchedPartner.name} • {matchedPartner.targetBand}</span>
                    </div>

                    <div className="flex items-center justify-center text-xs text-slate-400 font-mono z-10">
                      Connected (21ms latency)
                    </div>
                  </div>
                </div>

                {/* Cue Card Prompt Box */}
                <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">IELTS Part 2 Cue Card Task</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">Topic: {currentCue.topic}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">
                    {currentCue.title}
                  </h3>

                  <div className="text-xs text-slate-700 space-y-1 pl-4 border-l-2 border-amber-400">
                    {currentCue.bulletPoints.map((pt, i) => (
                      <p key={i}>• {pt}</p>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PEER RATING RUBRIC MODAL */}
            {matchingStatus === 'rating' && matchedPartner && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-[#027FFF] mb-2">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Rate {matchedPartner.name}&apos;s Speaking Response</h3>
                  <p className="text-xs text-slate-500">Provide official IELTS 4-criteria feedback to award peer XP points.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Fluency &amp; Coherence</span>
                      <span className="text-[#027FFF] font-mono">Band {fluencyScore.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5.0" 
                      max="9.0" 
                      step="0.5" 
                      value={fluencyScore} 
                      onChange={(e) => setFluencyScore(parseFloat(e.target.value))}
                      className="w-full accent-[#027FFF]"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Lexical Resource</span>
                      <span className="text-purple-600 font-mono">Band {lexicalScore.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5.0" 
                      max="9.0" 
                      step="0.5" 
                      value={lexicalScore} 
                      onChange={(e) => setLexicalScore(parseFloat(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Grammatical Range</span>
                      <span className="text-emerald-600 font-mono">Band {grammarScore.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5.0" 
                      max="9.0" 
                      step="0.5" 
                      value={grammarScore} 
                      onChange={(e) => setGrammarScore(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Pronunciation</span>
                      <span className="text-amber-600 font-mono">Band {pronunciationScore.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="5.0" 
                      max="9.0" 
                      step="0.5" 
                      value={pronunciationScore} 
                      onChange={(e) => setPronunciationScore(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Constructive Peer Feedback</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Great collocations! Work on reducing hesitation in abstract Part 3 questions."
                    value={peerFeedbackNote}
                    onChange={(e) => setPeerFeedbackNote(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  />
                </div>

                <button
                  onClick={handleSubmitPeerReview}
                  className="w-full py-3.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Submit Review &amp; Claim +150 XP
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DYNAMIC LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            
            {/* Filter Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Sort Ranking By:</span>
                {(['weekly', 'all-time', 'streaks'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLeaderboardFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      leaderboardFilter === f ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f === 'weekly' ? 'Weekly Active XP' : f === 'all-time' ? 'All-Time Points' : 'Consecutive Streaks 🔥'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Next Season Reset: 2d 14h</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-5">Candidate</div>
                <div className="col-span-2 text-center">IELTS Target</div>
                <div className="col-span-2 text-center">Study Streak</div>
                <div className="col-span-2 text-right pr-4">
                  {leaderboardFilter === 'weekly' ? 'Weekly XP' : leaderboardFilter === 'all-time' ? 'Total Score' : 'Streak Days'}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {sortedLeaderboard.map((user, idx) => (
                  <div 
                    key={user.id}
                    className={`grid grid-cols-12 p-4 items-center transition-colors ${
                      user.isCurrentUser ? 'bg-blue-50/80 font-bold border-l-4 border-[#027FFF]' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      {idx === 0 && <span className="text-xl">🥇</span>}
                      {idx === 1 && <span className="text-xl">🥈</span>}
                      {idx === 2 && <span className="text-xl">🥉</span>}
                      {idx > 2 && <span className="text-sm font-bold text-slate-500">#{idx + 1}</span>}
                    </div>

                    {/* User Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${user.avatarBg} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">{user.name}</span>
                          <span>{user.flag}</span>
                          {user.isCurrentUser && <span className="px-2 py-0.5 rounded-full bg-[#027FFF] text-white text-[10px] font-bold">You</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{user.badge}</span>
                      </div>
                    </div>

                    {/* Band */}
                    <div className="col-span-2 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                        Band {user.band}
                      </span>
                    </div>

                    {/* Streak */}
                    <div className="col-span-2 flex items-center justify-center gap-1 text-xs font-bold text-amber-700">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{user.streak} Days</span>
                    </div>

                    {/* Metric */}
                    <div className="col-span-2 text-right pr-4 font-mono font-bold text-sm text-slate-900">
                      {leaderboardFilter === 'weekly' 
                        ? `${user.weeklyPoints.toLocaleString()} XP`
                        : leaderboardFilter === 'all-time'
                        ? `${user.allTimePoints.toLocaleString()} PTS`
                        : `${user.streak} Days`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: STUDY FORUM & EXPANDABLE DISCUSSIONS */}
        {activeTab === 'discussions' && (
          <div className="space-y-6">
            
            {/* Forum Control Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Channel Filters */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 flex items-center gap-1 shadow-sm overflow-x-auto">
                {['All', 'Speaking', 'Writing', 'Reading', 'Vocabulary'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => setSelectedChannel(channel)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedChannel === channel
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>

              {/* Search & New Post */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search questions, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#027FFF]"
                  />
                </div>

                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#027FFF]/20 transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Start Discussion
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const isExpanded = expandedPostId === post.id;

                return (
                  <div key={post.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
                    
                    {/* Meta */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${post.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          {post.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{post.author}</span>
                            {post.isInstructorVerified && (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Instructor Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{post.authorRole} • {post.timeAgo}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        #{post.channel}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleUpvote(post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                            post.hasUpvoted ? 'bg-blue-50 border-[#027FFF] text-[#027FFF]' : 'hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{post.upvotes} Helpful</span>
                        </button>

                        <button 
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                            isExpanded ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.replies.length} Replies</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          if (typeof navigator !== 'undefined') {
                            navigator.clipboard?.writeText(window.location.href);
                            toast.success("Link Copied! 📋", "Share this discussion thread with study peers.");
                          }
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Share link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* EXPANDABLE REPLIES SECTION */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                        {post.replies.length > 0 ? (
                          <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200">
                            {post.replies.map(reply => (
                              <div key={reply.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg ${reply.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}>
                                      {reply.author[0]}
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">{reply.author}</span>
                                    {reply.isInstructor && (
                                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                                        Instructor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{reply.timeAgo}</span>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed pl-8">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic pl-4">No replies yet. Be the first to share your perspective!</p>
                        )}

                        {/* Reply Input Box */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a helpful reply..."
                            value={replyInputMap[post.id] || ''}
                            onChange={(e) => setReplyInputMap({ ...replyInputMap, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddReply(post.id);
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#027FFF]"
                          />
                          <button
                            onClick={() => handleAddReply(post.id)}
                            className="px-4 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Reply
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* NEW DISCUSSION MODAL */}
            {showNewPostModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-900">Start a Study Discussion</h3>
                    <button 
                      onClick={() => setShowNewPostModal(false)}
                      className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Skill Channel</label>
                      <select
                        value={newPostChannel}
                        onChange={(e) => setNewPostChannel(e.target.value as any)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-[#027FFF]"
                      >
                        <option value="Speaking">Speaking (Part 1, 2, 3)</option>
                        <option value="Writing">Writing (Task 1 &amp; Task 2)</option>
                        <option value="Reading">Reading Tactics</option>
                        <option value="Vocabulary">Academic Lexicon &amp; Idioms</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question / Topic Title</label>
                      <input
                        type="text"
                        placeholder="e.g. How to manage time in Task 2 writing?"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#027FFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Detailed Context / Question</label>
                      <textarea
                        rows={4}
                        placeholder="Provide details, specific examples, or parts where you need peer guidance..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#027FFF]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowNewPostModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-[#027FFF]/20 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish Discussion
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
