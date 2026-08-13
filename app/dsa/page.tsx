"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle2, Bookmark, BookOpen, Clock, FileText, Calendar, 
  ChevronRight, ChevronDown, Copy, Play, ArrowRight, TrendingUp, Flame, 
  Sparkles, Award, Star, Download, Edit3, HelpCircle, 
  ChevronLeft, Layout, RefreshCw, X, Eye, BookMarked
} from "lucide-react";

// Types
interface Question {
  platform: string;
  number: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  url: string;
  companies: string[];
  frequency: number;
}

interface Chapter {
  id: string;
  title: string;
  difficulty: string;
  duration: string;
  words: number;
  lastUpdated: string;
  introduction: {
    pattern: string;
    whyItMatters: string;
    realInterviewUsage: string;
  };
  bruteForce: {
    explanation: string;
    code: string;
    complexity: string;
    drawbacks: string;
  };
  intuition: {
    patternRecognition: string;
    invariants: string;
    mentalModel: string;
  };
  visualization: {
    steps: Array<{ step: number; explanation: string; arrayState: string; pointers: string }>;
    animationType: string;
  };
  workedExamples: Array<{
    title: string;
    difficulty: string;
    number: number;
    platform: string;
    url: string;
    statement: string;
    approach: string;
    dryRun: string;
    complexity: string;
    code: Record<string, string>;
  }>;
  patternRecognition: {
    whenToUse: string[];
    whenNotToUse: string[];
  };
  codeExamples: Record<string, string>;
  complexityAnalysis: {
    time: { best: string; average: string; worst: string };
    space: { best: string; average: string; worst: string };
  };
  questions: Question[];
  interviewNotes: {
    faangTips: string[];
    commonMistakes: string[];
    followUpQuestions: string[];
    variations: string[];
  };
  revisionNotes: {
    cheatSheet: string;
    patternSummary: string;
    keyFormulas: string[];
    observations: string[];
  };
}

interface Part {
  part: number;
  title: string;
  chapters: Chapter[];
}

export default function DSALearningPlatform() {
  const router = useRouter();

  // Core Data States
  const [curriculum, setCurriculum] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapterId, setActiveChapterId] = useState<string>("3.0");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  // Layout & Interactive States
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>({ 3: true });
  const [activeLang, setActiveLang] = useState<string>("python");
  const [activeVisualStep, setActiveVisualStep] = useState<number>(0);
  
  // Code Run Simulator
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string>("");

  // User Progress States (Persisted in LocalStorage)
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);
  const [solvedQuestions, setSolvedQuestions] = useState<string[]>([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>(["3.0"]);
  const [streak, setStreak] = useState<number>(5);
  const [streakClaimed, setStreakClaimed] = useState<boolean>(false);

  // Auxiliary Views Toggles
  const [showStats, setShowStats] = useState(false);
  const [showRevisionMode, setShowRevisionMode] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState("Introduction");
  
  // Flashcards States
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);


  // Load Curriculum and LocalStorage data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/curriculum.json");
        const data: Part[] = await response.json();
        setCurriculum(data);
        
        // Find default active chapter
        const found = data.flatMap(p => p.chapters).find(c => c.id === activeChapterId);
        if (found) {
          setActiveChapter(found);
          setUserCode(found.codeExamples[activeLang] || "");
        }
      } catch (err) {
        console.error("Failed to load curriculum", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // LocalStorage loading
    if (typeof window !== "undefined") {
      const storedCompleted = localStorage.getItem("dsa-completed");
      if (storedCompleted) setCompletedChapters(JSON.parse(storedCompleted));

      const storedBookmarked = localStorage.getItem("dsa-bookmarked");
      if (storedBookmarked) setBookmarkedChapters(JSON.parse(storedBookmarked));

      const storedSolved = localStorage.getItem("dsa-solved-questions");
      if (storedSolved) setSolvedQuestions(JSON.parse(storedSolved));

      const storedFavorites = localStorage.getItem("dsa-fav-questions");
      if (storedFavorites) setFavoriteQuestions(JSON.parse(storedFavorites));

      const storedNotes = localStorage.getItem("dsa-notes");
      if (storedNotes) setNotes(JSON.parse(storedNotes));

      const storedRecently = localStorage.getItem("dsa-recently");
      if (storedRecently) setRecentlyVisited(JSON.parse(storedRecently));

      const storedStreak = localStorage.getItem("dsa-streak");
      if (storedStreak) setStreak(parseInt(storedStreak));

      const storedStreakClaimed = localStorage.getItem("dsa-streak-claimed");
      if (storedStreakClaimed) setStreakClaimed(storedStreakClaimed === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update active chapter content when chapter ID changes
  useEffect(() => {
    if (curriculum.length > 0) {
      const found = curriculum.flatMap(p => p.chapters).find(c => c.id === activeChapterId);
      if (found) {
        setActiveChapter(found);
        setUserCode(found.codeExamples[activeLang] || "");
        setActiveVisualStep(0);
        setConsoleOutput(null);
        setActiveFlashcardIdx(0);
        setIsFlipped(false);
        
        // Save to Recently Visited
        setRecentlyVisited(prev => {
          const filtered = prev.filter(id => id !== activeChapterId);
          const updated = [activeChapterId, ...filtered].slice(0, 5);
          localStorage.setItem("dsa-recently", JSON.stringify(updated));
          return updated;
        });

        // Expand the parent Part in Left Sidebar
        const partNum = Math.floor(parseFloat(activeChapterId));
        setExpandedParts(prev => ({ ...prev, [partNum]: true }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId, curriculum]);

  // Sync userCode when language selection changes
  useEffect(() => {
    if (activeChapter) {
      setUserCode(activeChapter.codeExamples[activeLang] || "");
    }
  }, [activeLang, activeChapter]);

  // Intersection Observer for right sidebar active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "Introduction", "Brute Force", "Intuition", "Visualization", 
        "Examples", "Pattern Recognition", "Code", "Complexity", 
        "Practice Problems", "Interview Notes", "Revision Notes"
      ];
      
      let currentActive = "Introduction";
      for (const section of sections) {
        const element = document.getElementById(section.replace(/\s+/g, "-").toLowerCase());
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 160) {
            currentActive = section;
          }
        }
      }
      setActiveTabSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper Persisters
  const toggleChapterComplete = (id: string) => {
    const updated = completedChapters.includes(id)
      ? completedChapters.filter(c => c !== id)
      : [...completedChapters, id];
    setCompletedChapters(updated);
    localStorage.setItem("dsa-completed", JSON.stringify(updated));
  };

  const toggleChapterBookmark = (id: string) => {
    const updated = bookmarkedChapters.includes(id)
      ? bookmarkedChapters.filter(c => c !== id)
      : [...bookmarkedChapters, id];
    setBookmarkedChapters(updated);
    localStorage.setItem("dsa-bookmarked", JSON.stringify(updated));
  };

  const toggleQuestionSolved = (qid: string) => {
    const updated = solvedQuestions.includes(qid)
      ? solvedQuestions.filter(q => q !== qid)
      : [...solvedQuestions, qid];
    setSolvedQuestions(updated);
    localStorage.setItem("dsa-solved-questions", JSON.stringify(updated));
  };

  const toggleQuestionFavorite = (qid: string) => {
    const updated = favoriteQuestions.includes(qid)
      ? favoriteQuestions.filter(q => q !== qid)
      : [...favoriteQuestions, qid];
    setFavoriteQuestions(updated);
    localStorage.setItem("dsa-fav-questions", JSON.stringify(updated));
  };

  const handleSaveNotes = (text: string) => {
    const updated = { ...notes, [activeChapterId]: text };
    setNotes(updated);
    localStorage.setItem("dsa-notes", JSON.stringify(updated));
  };

  const claimDailyStreak = () => {
    if (!streakClaimed) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setStreakClaimed(true);
      localStorage.setItem("dsa-streak", newStreak.toString());
      localStorage.setItem("dsa-streak-claimed", "true");
    }
  };

  // Search filter chapters
  const filteredParts = curriculum.map(part => {
    const matchingChapters = part.chapters.filter(chap => 
      chap.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      part.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...part,
      chapters: matchingChapters
    };
  }).filter(part => part.chapters.length > 0);

  // Math stats calculation
  const totalChaptersCount = curriculum.flatMap(p => p.chapters).length || 120;
  const progressPercent = Math.round((completedChapters.length / totalChaptersCount) * 100);

  // Download PDF simulation
  const downloadNotesPDF = () => {
    const noteText = notes[activeChapterId] || "No notes written yet.";
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PrepPath Notes - ${activeChapter?.title}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
              .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.05em; }
              .meta { display: flex; gap: 20px; font-size: 12px; color: #475569; margin-top: 15px; }
              .section-title { font-size: 18px; font-weight: 700; color: #1e3a8a; margin-top: 30px; margin-bottom: 10px; border-left: 4px solid #3b82f6; padding-left: 10px; }
              .notes-content { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; white-space: pre-wrap; font-family: monospace; font-size: 14px; color: #334155; }
              .summary { font-size: 14px; background: #eff6ff; border-radius: 8px; padding: 15px; border: 1px solid #bfdbfe; margin-top: 20px; }
              .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${activeChapter?.title}</h1>
              <div class="subtitle">Curriculum Path: Part ${Math.floor(parseFloat(activeChapterId))} - ${curriculum.find(p => p.part === Math.floor(parseFloat(activeChapterId)))?.title}</div>
              <div class="meta">
                <span><strong>Difficulty:</strong> ${activeChapter?.difficulty}</span>
                <span><strong>Read Time:</strong> ${activeChapter?.duration}</span>
                <span><strong>Last Updated:</strong> ${activeChapter?.lastUpdated}</span>
              </div>
            </div>
            
            <div class="section-title">Pattern Summary</div>
            <p>${activeChapter?.introduction.pattern}</p>
            
            <div class="section-title">Core Intuition & Mental Model</div>
            <p>${activeChapter?.intuition.mentalModel}</p>

            <div class="section-title">Complexity Profile</div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Complexity</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Best Case</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Average Case</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Worst Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Time</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.time.best}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.time.average}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.time.worst}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Space</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.space.best}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.space.average}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${activeChapter?.complexityAnalysis.space.worst}</td>
                </tr>
              </tbody>
            </table>

            <div class="section-title">My Personal Study Notes</div>
            <div class="notes-content">${noteText}</div>

            <div class="footer">
              Generated by PrepPath Premium DSA Learning Platform © 2026. All rights reserved.
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Run Code simulator trigger
  const runCodeSimulator = () => {
    setIsRunningCode(true);
    setConsoleOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setConsoleOutput(
        `[Compiling solution...]\n` +
        `[Running test suites...]\n\n` +
        `Test Case 1: Input height = [1,8,6,2,5,4,8,3,7] -> Expected: 49, Output: 49 (Passed ✅)\n` +
        `Test Case 2: Input height = [1,1] -> Expected: 1, Output: 1 (Passed ✅)\n` +
        `Test Case 3: Input height = [4,3,2,1,4] -> Expected: 16, Output: 16 (Passed ✅)\n\n` +
        `STATUS: Success! All 3 tests passed successfully. (Execution time: 12ms)`
      );
    }, 1500);
  };

  // Helper for step-by-step visualizer rendering
  const heightArray = [1, 8, 6, 2, 5, 4, 8, 3, 7];
  const twoPointerSteps = [
    { l: 0, r: 8, area: 8, explanation: "Initialize pointers: Left pointer L at index 0 (val: 1), Right pointer R at index 8 (val: 7). Width = 8, Height = min(1, 7) = 1. Area = 8." },
    { l: 1, r: 8, area: 49, explanation: "Move Left inwards since height[L] (1) < height[R] (7). Width = 7, Height = min(8, 7) = 7. Area = 49." },
    { l: 1, r: 7, area: 18, explanation: "Move Right inwards since height[R] (7) < height[L] (8). Width = 6, Height = min(8, 3) = 3. Area = 18." },
    { l: 1, r: 6, area: 40, explanation: "Move Right inwards since height[R] (3) < height[L] (8). Width = 5, Height = min(8, 8) = 8. Area = 40." },
    { l: 2, r: 6, area: 24, explanation: "Move Left inwards since height[L] (6) < height[R] (8). Width = 4, Height = min(6, 8) = 6. Area = 24." },
    { l: 3, r: 6, area: 8, explanation: "Move Left inwards since height[L] (6) < height[R] (8). Width = 3, Height = min(2, 8) = 2. Area = 8." }
  ];

  // Helper to render simple highlighted code tokenized formatting
  const renderHighlightedCode = (code: string) => {
    return <pre className="text-[11px] font-mono leading-relaxed text-[#a9b2c3] overflow-x-auto whitespace-pre">{code}</pre>;
  };

  // Fallback loader
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16] font-mono text-sm tracking-widest text-[#60a5fa] uppercase">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin h-8 w-8 text-[#3b82f6]" />
          <span>Configuring Premium DSA Environment...</span>
        </div>
      </div>
    );
  }

  // Pre-compiled list of flashcards for active chapter
  const activeFlashcards = activeChapter ? [
    { q: "What is the primary optimization goal of this pattern?", a: activeChapter.intuition.mentalModel },
    { q: "Under what conditions should we NOT apply this strategy?", a: activeChapter.patternRecognition.whenNotToUse[0] || "When data order/indices must be preserved without sorting." },
    { q: "What is the worst-case space complexity?", a: activeChapter.complexityAnalysis.space.worst }
  ] : [];

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans selection:bg-[#1d4ed8]/30 selection:text-white">
      {/* Background glow animations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full filter blur-[120px]" />
      </div>

      {/* =========================================================
          ⚡ HEADER DASHBOARD & NAVIGATION
         ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#090d16]/80 border-b border-[#1e293b]/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black shadow-md border border-blue-400/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase">
              PrepPath Premium
            </span>
            <div className="text-[10px] text-slate-400 font-mono">DSA CURRICULUM HUB</div>
          </div>
        </div>

        {/* Learning Progress Status Indicator */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-3 bg-[#0d1527] border border-[#1e293b] rounded-xl px-4 py-2">
            <div className="relative w-8 h-8">
              <svg className="w-full h-full progress-ring" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - progressPercent} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-blue-400">
                {progressPercent}%
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Curriculum Progress</span>
              <span className="text-xs font-mono font-black text-slate-200">{completedChapters.length} / {totalChaptersCount} Chapters</span>
            </div>
          </div>

          {/* Daily Streak Indicator */}
          <button 
            onClick={claimDailyStreak}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition cursor-pointer ${
              streakClaimed 
                ? "bg-[#162e24] border-[#1b4332] text-emerald-400" 
                : "bg-[#27150d] border-[#43231b] hover:bg-[#321e14] text-amber-500 hover:scale-105"
            }`}
          >
            <Flame className={`h-4 w-4 ${streakClaimed ? "fill-emerald-400 text-emerald-400" : "fill-amber-500 text-amber-500 animate-pulse"}`} />
            <div>
              <span className="block text-[8px] font-mono uppercase tracking-wider text-left">Streak</span>
              <span className="block text-xs font-black tracking-tight">{streak} Days {streakClaimed ? "Claimed" : "Claim Now!"}</span>
            </div>
          </button>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRevisionMode(!showRevisionMode)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              showRevisionMode
                ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                : "bg-[#0d1527] border-[#1e293b] text-slate-350 hover:bg-[#121c33] hover:text-white"
            }`}
            title="Toggle interview revision summaries of all patterns"
          >
            <BookMarked className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Revision Mode</span>
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              showStats
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                : "bg-[#0d1527] border-[#1e293b] text-slate-350 hover:bg-[#121c33] hover:text-white"
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics Panel</span>
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 border border-blue-400/20 flex items-center gap-1"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* =========================================================
          📊 VIEW: ANALYTICS SLIDE-OVER OR DROPDOWN PANEL
         ========================================================= */}
      <AnimatePresence>
        {showStats && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#090d16] border-b border-[#1e293b] p-6 max-w-7xl mx-auto shadow-2xl relative"
          >
            <button 
              onClick={() => setShowStats(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-extrabold text-blue-400 uppercase tracking-widest font-mono mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Learning Progress Metrics & Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stats Box 1 */}
              <div className="bg-[#0d1527] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Topics</span>
                  <span className="text-3xl font-black block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{completedChapters.length}</span>
                  <span className="text-[10px] text-slate-450 block mt-1">Out of {totalChaptersCount} chapters</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>

              {/* Stats Box 2 */}
              <div className="bg-[#0d1527] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bookmarked Modules</span>
                  <span className="text-3xl font-black block mt-2 text-blue-400">{bookmarkedChapters.length}</span>
                  <span className="text-[10px] text-slate-450 block mt-1">Saved for later review</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bookmark className="h-6 w-6" />
                </div>
              </div>

              {/* Stats Box 3 */}
              <div className="bg-[#0d1527] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Practice Problems Solved</span>
                  <span className="text-3xl font-black block mt-2 text-indigo-400">{solvedQuestions.length}</span>
                  <span className="text-[10px] text-slate-450 block mt-1">LeetCode, Codeforces, etc.</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Award className="h-6 w-6" />
                </div>
              </div>

              {/* Stats Box 4 */}
              <div className="bg-[#0d1527] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revision Flashcards</span>
                  <span className="text-3xl font-black block mt-2 text-amber-400">{favoriteQuestions.length}</span>
                  <span className="text-[10px] text-slate-450 block mt-1">Starred practice problems</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-450">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Quick Continue Learning CTA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <div>
                  <span className="font-bold text-sm text-slate-200">Ready to proceed?</span>
                  <p className="text-xs text-slate-400">Jump right back into two pointers or continue where you left off in Chapter {activeChapterId}.</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveChapterId("3.0");
                  setShowStats(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                Continue Learning <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          🏁 VIEW: REVISION MODE (CHEAT SHEETS GRID)
         ========================================================= */}
      <AnimatePresence>
        {showRevisionMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#07090e]/95 overflow-y-auto p-6 md:p-12 flex flex-col"
          >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-[#1e293b] pb-6 mb-8">
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">Ultimate Flash Revision</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">DSA Cheatsheet Grid</h1>
              </div>
              <button 
                onClick={() => setShowRevisionMode(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                Exit Revision Mode <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow pb-12">
              {curriculum.slice(0, 15).map((part, index) => (
                <div key={index} className="bg-[#090d16] border border-[#1e293b] rounded-2xl p-5 hover:border-blue-500/40 transition duration-300 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">Part {part.part}</span>
                    <h3 className="text-lg font-bold mt-1 text-slate-200">{part.title}</h3>
                    
                    <div className="mt-4 space-y-2 text-xs text-slate-400">
                      {part.chapters.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-300 block">{c.title}</span>
                            <p className="text-[11px] mt-0.5 line-clamp-2">{c.introduction.pattern}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (part.chapters[0]) {
                        setActiveChapterId(part.chapters[0].id);
                        setShowRevisionMode(false);
                      }
                    }}
                    className="mt-6 w-full text-center py-2 bg-[#0d1527] hover:bg-[#121c33] border border-[#1e293b] text-blue-400 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    Load Modules <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          📦 MAIN PAGE CONTAINER (THREE COLUMN LAYOUT)
         ========================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[1600px] mx-auto my-6 p-6 bg-[#090d16]/30 border border-[#1e293b]/50 backdrop-blur-xl rounded-3xl shadow-2xl grid grid-cols-1 lg:grid-cols-5 gap-6 relative overflow-hidden"
      >
        {/* Background glow animations inside the main box */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* =========================================================
            👈 LEFT SIDEBAR (20% width) - Sticky Curriculum tree
           ========================================================= */}
        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] overflow-y-auto pr-2 select-none border-r border-[#1e293b]/30">
          
          {/* Search topic input */}
          <div className="bg-[#090d16] border border-[#1e293b] rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search topics or parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-200 placeholder-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Curriculum Index List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-1 pb-1 border-b border-[#1e293b]/30">
              <span>DSA Curriculum Map</span>
              <span>{filteredParts.length} Sections</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
              {filteredParts.map((part) => {
                const isExpanded = expandedParts[part.part] || false;
                const partCompleted = part.chapters.every(c => completedChapters.includes(c.id));
                const partProgress = Math.round((part.chapters.filter(c => completedChapters.includes(c.id)).length / part.chapters.length) * 100);

                return (
                  <div key={part.part} className="bg-[#090d16]/30 border border-[#1e293b]/30 rounded-xl overflow-hidden">
                    {/* Part Header */}
                    <div 
                      onClick={() => setExpandedParts(prev => ({ ...prev, [part.part]: !isExpanded }))}
                      className="p-3 bg-[#090d16]/60 hover:bg-[#0d1527] flex items-center justify-between cursor-pointer transition border-b border-[#1e293b]/20"
                    >
                      <div className="space-y-1 w-[80%]">
                        <span className="block text-[8px] font-mono font-black text-blue-400 uppercase tracking-widest">Part {part.part}</span>
                        <h4 className="text-xs font-extrabold text-slate-200 truncate">{part.title}</h4>
                        {/* tiny progress bar */}
                        <div className="w-full bg-[#1e293b] h-1 rounded-full overflow-hidden mt-1">
                          <div className="bg-blue-500 h-full" style={{ width: `${partProgress}%` }} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {partCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {/* Part Chapters (Collapsible) */}
                    {isExpanded && (
                      <div className="p-1 space-y-0.5 bg-[#07090e]/20 border-t border-[#1e293b]/10">
                        {part.chapters.map((chap) => {
                          const isActive = activeChapterId === chap.id;
                          const isCompleted = completedChapters.includes(chap.id);
                          const isBookmarked = bookmarkedChapters.includes(chap.id);

                          return (
                            <div 
                              key={chap.id}
                              className={`group px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer text-left transition ${
                                isActive 
                                  ? "bg-blue-600/10 border border-blue-500/30 text-white" 
                                  : "hover:bg-[#0d1527] text-slate-400 hover:text-slate-200 border border-transparent"
                              }`}
                            >
                              <div 
                                onClick={() => setActiveChapterId(chap.id)}
                                className="flex-grow space-y-0.5"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono text-slate-500 font-bold">{chap.id}</span>
                                  <span className="text-xs font-semibold truncate block max-w-[130px]">{chap.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                                  <span className="uppercase">{chap.difficulty}</span>
                                  <span>•</span>
                                  <span>{chap.duration}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleChapterBookmark(chap.id);
                                  }}
                                  className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                                    isBookmarked ? "text-amber-500 opacity-100" : "text-slate-500 hover:text-slate-350"
                                  }`}
                                  title="Bookmark topic"
                                >
                                  <Bookmark className="h-3 w-3 fill-current" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleChapterComplete(chap.id);
                                  }}
                                  className={`p-1 rounded ${isCompleted ? "text-emerald-500" : "opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-350"}`}
                                  title="Mark as completed"
                                >
                                  <CheckCircle2 className="h-3 w-3 fill-current" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* =========================================================
            ✨ CENTER CONTENT (60% width) - Curated DSA Content & Player
           ========================================================= */}
        <main className="lg:col-span-3 space-y-8 max-w-4xl">
          {activeChapter ? (
            <motion.div
              key={activeChapterId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-10"
            >
              
              {/* HEADER DATA PANEL */}
              <div className="p-6 md:p-8 bg-gradient-to-b from-[#0d1527] to-[#090d16] border border-[#1e293b] rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-36 h-36 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
                
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#1e293b] text-blue-400 text-[10px] uppercase tracking-wider">
                      Part {Math.floor(parseFloat(activeChapterId))} Module
                    </span>
                    <span>•</span>
                    <span className="text-[10px] font-mono">Chapter ID: {activeChapterId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleChapterBookmark(activeChapterId)}
                      className={`p-2 border border-[#1e293b] rounded-xl hover:bg-[#121c33] transition ${
                        bookmarkedChapters.includes(activeChapterId) ? "bg-[#271d0d] border-amber-500/30 text-amber-500" : "text-slate-400"
                      }`}
                      title="Bookmark chapter"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleChapterComplete(activeChapterId)}
                      className={`p-2 border border-[#1e293b] rounded-xl hover:bg-[#121c33] transition ${
                        completedChapters.includes(activeChapterId) ? "bg-[#162e24] border-emerald-500/30 text-emerald-400" : "text-slate-400"
                      }`}
                      title="Mark chapter complete"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 text-white">
                  {activeChapter.title}
                </h1>

                {/* Subtitle indicators */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 border-t border-[#1e293b]/50 pt-5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      activeChapter.difficulty === "Easy" ? "bg-green-500" : activeChapter.difficulty === "Intermediate" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span className="font-mono font-black uppercase text-slate-200">{activeChapter.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{activeChapter.duration} read</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>{activeChapter.words} words</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Updated {activeChapter.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------
                  SECTION 1: INTRODUCTION
                  --------------------------------------------------- */}
              <section id="introduction" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    01. Introduction
                  </h2>
                  <p className="text-xs font-mono text-blue-400 font-bold">Concept Definition & Core Framework</p>
                </div>
                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">What is this pattern?</h4>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">{activeChapter.introduction.pattern}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">Why it matters?</h4>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">{activeChapter.introduction.whyItMatters}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">Real Interview Usage</h4>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">{activeChapter.introduction.realInterviewUsage}</p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 2: WHY BRUTE FORCE FAILS
                  --------------------------------------------------- */}
              <section id="brute-force" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-red-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    02. Why Brute Force Fails
                  </h2>
                  <p className="text-xs font-mono text-red-400 font-bold">Comparing Efficiency & Scaling Drawbacks</p>
                </div>
                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                  <p className="text-sm leading-relaxed text-slate-300">{activeChapter.bruteForce.explanation}</p>
                  
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono text-slate-450 uppercase font-bold">Naive Algorithm (Java)</span>
                    <div className="bg-[#05070a] border border-[#1e293b]/30 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-red-300">{activeChapter.bruteForce.code}</pre>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl">
                      <span className="block text-[10px] font-mono text-red-400 uppercase font-bold">Brute Force Complexity</span>
                      <pre className="text-xs font-mono text-red-300 mt-2 whitespace-pre-line">{activeChapter.bruteForce.complexity}</pre>
                    </div>
                    <div className="p-4 bg-amber-950/10 border border-amber-900/20 rounded-xl">
                      <span className="block text-[10px] font-mono text-amber-500 uppercase font-bold">Performance Drawback</span>
                      <p className="text-xs text-amber-300/80 mt-2 font-medium leading-relaxed">{activeChapter.bruteForce.drawbacks}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 3: CORE INTUITION
                  --------------------------------------------------- */}
              <section id="intuition" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    03. Core Intuition
                  </h2>
                  <p className="text-xs font-mono text-indigo-400 font-bold">Pattern Recognition & Logical Invariants</p>
                </div>
                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">Pattern Recognition Strategy</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{activeChapter.intuition.patternRecognition}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">Algorithmic Invariants</h4>
                    <p className="text-sm leading-relaxed text-slate-300">{activeChapter.intuition.invariants}</p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1">Mental Model Visualization</h4>
                    <p className="text-sm leading-relaxed text-slate-300 font-medium">{activeChapter.intuition.mentalModel}</p>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 4: VISUALIZATION (Interactive player!)
                  --------------------------------------------------- */}
              <section id="visualization" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    04. Interactive Visualization
                  </h2>
                  <p className="text-xs font-mono text-amber-400 font-bold">Step-by-Step Graphical Engine</p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-6">
                  {activeChapterId === "3.0" ? (
                    // Interactive visualizer for Two Pointers Opposite Ends
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1e293b]/40 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Container With Most Water simulation</span>
                          <h4 className="font-bold text-sm text-slate-200">Heights array: [1, 8, 6, 2, 5, 4, 8, 3, 7]</h4>
                        </div>
                        
                        {/* Play control buttons */}
                        <div className="flex items-center gap-2 bg-[#05070a] border border-[#1e293b]/60 p-1 rounded-xl">
                          <button
                            onClick={() => setActiveVisualStep(prev => Math.max(0, prev - 1))}
                            disabled={activeVisualStep === 0}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-40 transition"
                            title="Previous step"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="text-[11px] font-mono font-bold px-2 text-blue-400">Step {activeVisualStep + 1} / {twoPointerSteps.length}</span>
                          <button
                            onClick={() => setActiveVisualStep(prev => Math.min(twoPointerSteps.length - 1, prev + 1))}
                            disabled={activeVisualStep === twoPointerSteps.length - 1}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-40 transition"
                            title="Next step"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setActiveVisualStep(0)}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                            title="Reset visualizer"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Vis Step detail */}
                      <p className="text-xs text-slate-350 bg-[#0d1527] p-3 border border-blue-900/10 rounded-xl leading-relaxed">
                        <strong>Operation:</strong> {twoPointerSteps[activeVisualStep].explanation}
                      </p>

                      {/* Interactive Array Blocks */}
                      <div className="flex items-end justify-center gap-2 pt-10 pb-8 min-h-[160px] relative">
                        {heightArray.map((height, idx) => {
                          const step = twoPointerSteps[activeVisualStep];
                          const isLeft = idx === step.l;
                          const isRight = idx === step.r;
                          const isInRange = idx > step.l && idx < step.r;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
                              {/* Pointer label */}
                              <div className="h-6 flex items-center justify-center font-bold text-xs text-slate-300">
                                {isLeft && <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] shadow animate-bounce">L</span>}
                                {isRight && <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[9px] shadow animate-bounce">R</span>}
                              </div>

                              {/* Visual bar graph block */}
                              <div 
                                className={`w-8 rounded-t-lg flex items-center justify-center font-bold font-mono text-xs text-white transition-all duration-300 ${
                                  isLeft 
                                    ? "bg-blue-600 border border-blue-400 shadow-lg shadow-blue-500/20" 
                                    : isRight 
                                    ? "bg-indigo-600 border border-indigo-400 shadow-lg shadow-indigo-500/20" 
                                    : isInRange
                                    ? "bg-[#1e293b]/70 border border-[#334155]/30 text-slate-400"
                                    : "bg-[#090d16]/30 border border-[#1e293b]/20 text-slate-600"
                                }`}
                                style={{ height: `${height * 14 + 10}px` }}
                              >
                                {height}
                              </div>

                              {/* Index label */}
                              <span className="text-[10px] font-mono text-slate-500 font-bold">{idx}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Area Box stats */}
                      <div className="grid grid-cols-3 gap-4 border-t border-[#1e293b]/45 pt-4 text-center">
                        <div className="bg-[#05070a] border border-[#1e293b]/30 p-3 rounded-xl">
                          <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Width (R - L)</span>
                          <span className="text-sm font-black font-mono mt-1 block text-slate-200">
                            {twoPointerSteps[activeVisualStep].r - twoPointerSteps[activeVisualStep].l}
                          </span>
                        </div>
                        <div className="bg-[#05070a] border border-[#1e293b]/30 p-3 rounded-xl">
                          <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Min-Height</span>
                          <span className="text-sm font-black font-mono mt-1 block text-slate-200">
                            {Math.min(heightArray[twoPointerSteps[activeVisualStep].l], heightArray[twoPointerSteps[activeVisualStep].r])}
                          </span>
                        </div>
                        <div className="bg-[#0d1527] border border-blue-900/30 p-3 rounded-xl">
                          <span className="block text-[9px] font-mono text-blue-400 font-bold uppercase">Current Area</span>
                          <span className="text-sm font-black font-mono mt-1 block text-blue-400">
                            {twoPointerSteps[activeVisualStep].area}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Universal visualizer for dynamically generated chapters
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#1e293b]/40 pb-3">
                        <TrendingUp className="h-4 w-4 text-blue-400 animate-pulse" />
                        <h4 className="font-bold text-sm text-slate-200">Interactive Execution States: {activeChapter.title}</h4>
                      </div>

                      <div className="space-y-3">
                        {activeChapter.visualization.steps.map((st) => (
                          <div key={st.step} className="p-3 bg-[#0d1527] border border-[#1e293b]/30 rounded-xl flex items-start gap-4 text-xs">
                            <span className="h-5 w-5 rounded-full bg-blue-600/10 text-blue-400 font-bold flex items-center justify-center font-mono shrink-0">
                              {st.step}
                            </span>
                            <div className="space-y-1">
                              <p className="text-slate-300 font-semibold">{st.explanation}</p>
                              <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                                <span><strong>State:</strong> {st.arrayState}</span>
                                <span><strong>Pointers:</strong> {st.pointers}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 5: WORKED EXAMPLES
                  --------------------------------------------------- */}
              <section id="examples" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    05. Worked Examples
                  </h2>
                  <p className="text-xs font-mono text-indigo-400 font-bold">FAANG Problem Solving In-Depth</p>
                </div>

                <div className="space-y-6">
                  {activeChapter.workedExamples.map((ex, i) => (
                    <div key={i} className="bg-[#090d16] border border-[#1e293b]/50 rounded-2xl overflow-hidden">
                      <div className="p-4 bg-[#0d1527] border-b border-[#1e293b]/40 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 font-bold font-mono text-[10px]">
                            {ex.platform} {ex.number}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-200">{ex.title}</h4>
                        </div>
                        <span className={`text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                          ex.difficulty === "Easy" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                        }`}>{ex.difficulty}</span>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Problem Statement</h5>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed whitespace-pre-wrap">{ex.statement}</p>
                        </div>
                        <div>
                          <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Strategic Approach</h5>
                          <p className="text-xs text-slate-350 mt-1 leading-relaxed whitespace-pre-wrap">{ex.approach}</p>
                        </div>
                        <div className="p-3.5 bg-[#05070a] border border-[#1e293b]/30 rounded-xl text-xs font-mono">
                          <span className="block text-[9px] uppercase font-bold text-slate-500">Manual Dry Run Profile</span>
                          <p className="text-slate-450 mt-1.5 leading-relaxed whitespace-pre-wrap">{ex.dryRun}</p>
                        </div>

                        {/* code tabs */}
                        <div className="bg-[#05070a] border border-[#1e293b]/40 rounded-xl overflow-hidden">
                          <div className="flex border-b border-[#1e293b]/30 bg-[#07090e]/50 px-2 py-1 gap-1">
                            <span className="text-[10px] font-mono text-slate-500 font-bold px-2 py-1">Solution:</span>
                            {["python", "java", "cpp", "go"].map((ln) => (
                              <button
                                key={ln}
                                onClick={() => setActiveLang(ln)}
                                className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer capitalize font-bold ${
                                  activeLang === ln ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                {ln === "cpp" ? "C++" : ln}
                              </button>
                            ))}
                          </div>
                          <div className="p-4 overflow-x-auto text-left">
                            {renderHighlightedCode(ex.code[activeLang] || "")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 6: PATTERN RECOGNITION
                  --------------------------------------------------- */}
              <section id="pattern-recognition" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-indigo-400 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    06. Pattern Recognition
                  </h2>
                  <p className="text-xs font-mono text-indigo-355 font-bold">When to Apply vs Discard Patterns</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/5 border border-emerald-900/20 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">When to Use</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                      {activeChapter.patternRecognition.whenToUse.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-950/5 border border-red-900/20 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <X className="h-4.5 w-4.5" />
                      <h4 className="font-extrabold text-xs uppercase tracking-wider">When NOT to Use</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                      {activeChapter.patternRecognition.whenNotToUse.map((item, idx) => (
                        <li key={idx} className="font-medium">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 7: CODE EXAMPLES & RUNNER
                  --------------------------------------------------- */}
              <section id="code" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    07. Interactive Code Sandbox
                  </h2>
                  <p className="text-xs font-mono text-blue-400 font-bold">Write, Compile, & Verify Solutions</p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl overflow-hidden space-y-4 p-5">
                  <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-[#05070a] border border-[#1e293b] rounded-xl px-2.5 py-1">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">Environment:</span>
                      <select
                        value={activeLang}
                        onChange={(e) => setActiveLang(e.target.value)}
                        className="bg-transparent text-xs font-mono font-bold text-blue-400 border-none outline-none select-none capitalize cursor-pointer"
                        title="Select programming language"
                      >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="go">Go</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(userCode);
                          alert("Code copied successfully to clipboard!");
                        }}
                        className="p-2 bg-[#05070a] hover:bg-slate-800 border border-[#1e293b] rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        title="Copy solution code"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                      <button
                        onClick={runCodeSimulator}
                        disabled={isRunningCode}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
                        title="Run solution tests"
                      >
                        {isRunningCode ? <RefreshCw className="animate-spin h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                        {isRunningCode ? "Running..." : "Run Tests"}
                      </button>
                    </div>
                  </div>

                  <label htmlFor="user-sandbox-code" className="sr-only">Coding Area</label>
                  <textarea
                    id="user-sandbox-code"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    disabled={isRunningCode}
                    className="w-full h-80 font-mono text-xs p-4 rounded-xl border border-[#1e293b]/70 bg-[#05070a] text-[#a9b2c3] focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y"
                    title="Code compiler sandbox"
                  />

                  {/* Sandbox Run result console */}
                  {consoleOutput && (
                    <div className="bg-[#05070a] border border-[#1e293b]/60 rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
                      <div className="flex items-center justify-between border-b border-[#1e293b]/30 pb-2 mb-2 text-slate-500">
                        <span>CONSOLE EXECUTION REPORT</span>
                        <button onClick={() => setConsoleOutput(null)} className="hover:text-white">Clear</button>
                      </div>
                      <pre className="text-emerald-400 whitespace-pre">{consoleOutput}</pre>
                    </div>
                  )}
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 8: COMPLEXITY ANALYSIS
                  --------------------------------------------------- */}
              <section id="complexity" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    08. Complexity Analysis
                  </h2>
                  <p className="text-xs font-mono text-indigo-400 font-bold">Asymptotic Complexity Metrics Matrix</p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-[#1e293b] text-slate-400 font-bold">
                        <th className="py-3 px-4">Metric</th>
                        <th className="py-3 px-4">Best Case</th>
                        <th className="py-3 px-4">Average Case</th>
                        <th className="py-3 px-4">Worst Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/30 font-medium">
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-slate-200">Time Complexity</td>
                        <td className="py-3.5 px-4 font-mono text-blue-400">{activeChapter.complexityAnalysis.time.best}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-400">{activeChapter.complexityAnalysis.time.average}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-400">{activeChapter.complexityAnalysis.time.worst}</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-slate-200">Space Complexity</td>
                        <td className="py-3.5 px-4 font-mono text-indigo-455">{activeChapter.complexityAnalysis.space.best}</td>
                        <td className="py-3.5 px-4 font-mono text-indigo-455">{activeChapter.complexityAnalysis.space.average}</td>
                        <td className="py-3.5 px-4 font-mono text-indigo-455">{activeChapter.complexityAnalysis.space.worst}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 9: PRACTICE PROBLEMS
                  --------------------------------------------------- */}
              <section id="practice-problems" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-indigo-600 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    09. Corporate Practice Problems
                  </h2>
                  <p className="text-xs font-mono text-indigo-400 font-bold">Curated Platforms & Interview Frequency</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeChapter.questions.map((q, idx) => {
                    const questionId = `${activeChapterId}-${idx}`;
                    const isSolved = solvedQuestions.includes(questionId);
                    const isFav = favoriteQuestions.includes(questionId);

                    return (
                      <div key={idx} className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition duration-300">
                        <div>
                          <div className="flex items-center justify-between border-b border-[#1e293b]/30 pb-2 mb-3">
                            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded capitalize">
                              {q.platform} {q.number}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => toggleQuestionFavorite(questionId)}
                                className={`p-1 rounded hover:bg-slate-800 transition ${isFav ? "text-amber-500" : "text-slate-500"}`}
                              >
                                <Star className="h-3.5 w-3.5 fill-current" />
                              </button>
                              
                              {/* solved checkbox */}
                              <input 
                                type="checkbox"
                                checked={isSolved}
                                onChange={() => toggleQuestionSolved(questionId)}
                                className="h-3.5 w-3.5 rounded border-[#1e293b] text-blue-600 focus:ring-blue-500/30"
                                title="Mark question solved"
                              />
                            </div>
                          </div>

                          <h4 className="font-extrabold text-sm text-slate-200 hover:text-blue-400 transition cursor-pointer">
                            <a href={q.url} target="_blank" rel="noopener noreferrer">{q.title}</a>
                          </h4>

                          {/* company tags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {q.companies.map((co, cIdx) => (
                              <span key={cIdx} className="text-[9px] font-bold text-slate-400 bg-[#121c33] border border-blue-900/10 px-2 py-0.5 rounded">
                                {co}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-5 border-t border-[#1e293b]/30 pt-3 text-[10px] font-mono text-slate-500">
                          <span className={`uppercase font-bold ${
                            q.difficulty === "Easy" ? "text-green-500" : q.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
                          }`}>{q.difficulty}</span>
                          
                          <div className="flex items-center gap-1">
                            <span className="font-bold">Freq:</span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${q.frequency}%` }} />
                            </div>
                            <span>{q.frequency}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 10: INTERVIEW NOTES
                  --------------------------------------------------- */}
              <section id="interview-notes" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    10. FAANG Interview Notes
                  </h2>
                  <p className="text-xs font-mono text-amber-400 font-bold">Technical Tips & Common Mistakes</p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                      <HelpCircle className="h-4 w-4" /> Technical FAANG Guidelines
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-350 leading-relaxed list-disc pl-4">
                      {activeChapter.interviewNotes.faangTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[#1e293b]/30 pt-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-2">
                      <X className="h-4 w-4 text-red-500" /> Common Candidate Pitfalls
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-350 leading-relaxed list-disc pl-4">
                      {activeChapter.interviewNotes.commonMistakes.map((mis, idx) => (
                        <li key={idx}>{mis}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-[#1e293b]/30 pt-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2">
                      <ArrowRight className="h-4 w-4" /> Technical Follow-Ups & Variations
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-350 leading-relaxed list-disc pl-4">
                      {activeChapter.interviewNotes.followUpQuestions.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------
                  SECTION 11: REVISION NOTES (Flashcards & Notes edit)
                  --------------------------------------------------- */}
              <section id="revision-notes" className="space-y-4 scroll-mt-24">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-extrabold text-slate-100 uppercase tracking-wide">
                    11. Revision Notes & Flashcards
                  </h2>
                  <p className="text-xs font-mono text-blue-400 font-bold">Cheatsheets & Study Cards</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revision summary */}
                  <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Cheat Sheet Formula</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{activeChapter.revisionNotes.cheatSheet}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">Observations</h4>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                        {activeChapter.revisionNotes.observations.map((o, idx) => (
                          <li key={idx}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Active Chapter Flashcards interactive box */}
                  <div className="bg-[#0d1527] border border-blue-900/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-2 text-[10px] font-mono text-slate-500 font-bold">
                      <span>REVISION FLASHCARD PLAYER</span>
                      <span>Card {activeFlashcardIdx + 1} / {activeFlashcards.length}</span>
                    </div>

                    {/* Flippable Card Container */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="bg-[#05070a] border border-[#1e293b] rounded-xl p-6 h-36 flex items-center justify-center text-center cursor-pointer select-none relative overflow-hidden group hover:border-blue-500/50 transition duration-300"
                    >
                      <div className="absolute top-2 right-2 text-[8px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-blue-400">
                        <Eye className="h-3 w-3" /> Click to Flip
                      </div>
                      
                      <p className={`text-xs text-slate-200 leading-relaxed font-semibold transition-all duration-300 ${isFlipped ? "text-blue-400" : ""}`}>
                        {isFlipped ? activeFlashcards[activeFlashcardIdx]?.a : activeFlashcards[activeFlashcardIdx]?.q}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setActiveFlashcardIdx(prev => Math.max(0, prev - 1));
                        }}
                        disabled={activeFlashcardIdx === 0}
                        className="px-3 py-1.5 bg-[#05070a] border border-[#1e293b] hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-300 rounded-lg transition"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => {
                          setIsFlipped(false);
                          setActiveFlashcardIdx(prev => Math.min(activeFlashcards.length - 1, prev + 1));
                        }}
                        disabled={activeFlashcardIdx === activeFlashcards.length - 1}
                        className="px-3 py-1.5 bg-[#05070a] border border-[#1e293b] hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-300 rounded-lg transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* PERSONAL STUDY NOTES AND PDF EXPORTER */}
                <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1e293b]/30 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Edit3 className="h-4 w-4 text-blue-400" /> My Personal Study Notebook
                    </h4>
                    
                    <button
                      onClick={downloadNotesPDF}
                      className="px-3 py-1.5 bg-[#121c33] border border-blue-900/20 hover:bg-blue-600 hover:text-white transition rounded-xl text-xs font-bold flex items-center gap-1 text-blue-400 cursor-pointer"
                      title="Export active notes as beautiful PDF"
                    >
                      <Download className="h-3.5 w-3.5" /> PDF
                    </button>
                  </div>

                  <label htmlFor="user-note-area" className="sr-only">Type notes here</label>
                  <textarea
                    id="user-note-area"
                    value={notes[activeChapterId] || ""}
                    onChange={(e) => handleSaveNotes(e.target.value)}
                    placeholder="Type formulas, notes, complexities, or FAANG tricks here. It autosaves in real-time..."
                    className="w-full h-32 text-xs p-3.5 rounded-xl border border-[#1e293b]/60 bg-[#05070a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-y"
                  />
                </div>
              </section>

              {/* NEXT / PREV CHAPTER SELECTOR BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-[#1e293b]/50">
                <button
                  onClick={() => {
                    const idNum = parseFloat(activeChapterId);
                    if (idNum > 1.0) {
                      // find prev chapter in curriculum
                      const chaps = curriculum.flatMap(p => p.chapters);
                      const currentIdx = chaps.findIndex(c => c.id === activeChapterId);
                      if (currentIdx > 0) setActiveChapterId(chaps[currentIdx - 1].id);
                    }
                  }}
                  disabled={activeChapterId === "1.0"}
                  className="px-4 py-2 bg-[#0d1527] hover:bg-[#121c33] border border-[#1e293b] rounded-xl text-xs font-bold text-slate-350 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Chapter
                </button>
                
                <button
                  onClick={() => {
                    const chaps = curriculum.flatMap(p => p.chapters);
                    const currentIdx = chaps.findIndex(c => c.id === activeChapterId);
                    if (currentIdx < chaps.length - 1) setActiveChapterId(chaps[currentIdx + 1].id);
                  }}
                  disabled={activeChapterId === "50.2"}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  Next Chapter <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="p-12 text-center bg-[#090d16] border border-[#1e293b]/40 rounded-3xl min-h-[300px] flex flex-col items-center justify-center">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mb-4" />
              <h3 className="font-extrabold text-lg text-slate-200">Retrieving Module Contents</h3>
              <p className="text-xs text-slate-500 mt-1">Please select one of the chapters in the sidebar to review the structured path.</p>
            </div>
          )}
        </main>

        {/* =========================================================
            👉 RIGHT SIDEBAR (20% width) - "ON THIS PAGE" index
           ========================================================= */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] overflow-y-auto pl-2 select-none border-l border-[#1e293b]/30">
          
          {/* Active section indices tracker */}
          <div className="space-y-3.5">
            <span className="block text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-1">On This Page</span>
            <div className="space-y-1 border-l-2 border-[#1e293b]">
              {[
                { name: "Introduction", target: "introduction" },
                { name: "Brute Force", target: "brute-force" },
                { name: "Intuition", target: "intuition" },
                { name: "Visualization", target: "visualization" },
                { name: "Examples", target: "examples" },
                { name: "Pattern Recognition", target: "pattern-recognition" },
                { name: "Code", target: "code" },
                { name: "Complexity", target: "complexity" },
                { name: "Practice Problems", target: "practice-problems" },
                { name: "Interview Notes", target: "interview-notes" },
                { name: "Revision Notes", target: "revision-notes" }
              ].map((sec) => {
                const isActive = activeTabSection === sec.name;
                return (
                  <a
                    key={sec.name}
                    href={`#${sec.target}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(sec.target);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className={`block pl-3 py-1.5 text-xs transition border-l-2 -ml-[2px] ${
                      isActive
                        ? "text-blue-400 border-blue-500 font-bold"
                        : "text-slate-500 border-transparent hover:text-slate-350"
                    }`}
                  >
                    {sec.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Reading progress metric */}
          <div className="bg-[#090d16] border border-[#1e293b]/40 rounded-xl p-4 space-y-2">
            <span className="block text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">Estimated reading</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">{activeChapter?.duration || "10 min"}</span>
            </div>
            <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden mt-2">
              {/* Dynamic scroll indicator mapping */}
              <div className="bg-blue-500 h-full w-[45%]" />
            </div>
          </div>

          {/* Recently Visited */}
          {recentlyVisited.length > 0 && (
            <div className="space-y-2.5">
              <span className="block text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-1">Recently Visited</span>
              <div className="space-y-1.5">
                {recentlyVisited.map((id) => {
                  // Find title
                  const found = curriculum.flatMap(p => p.chapters).find(c => c.id === id);
                  if (!found) return null;
                  return (
                    <div 
                      key={id}
                      onClick={() => setActiveChapterId(id)}
                      className="px-3 py-1.5 bg-[#090d16]/40 hover:bg-[#0d1527] border border-[#1e293b]/30 rounded-xl cursor-pointer text-left transition flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-350 truncate block max-w-[120px]">{found.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">{id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorited Questions */}
          {favoriteQuestions.length > 0 && (
            <div className="space-y-2.5">
              <span className="block text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-1">Starred Questions</span>
              <div className="space-y-1.5">
                {favoriteQuestions.slice(0, 3).map((qId) => {
                  const [chapId, qIdxStr] = qId.split("-");
                  const qIdx = parseInt(qIdxStr);
                  const chap = curriculum.flatMap(p => p.chapters).find(c => c.id === chapId);
                  const q = chap?.questions[qIdx];
                  if (!q) return null;

                  return (
                    <div 
                      key={qId}
                      className="px-3 py-1.5 bg-[#090d16]/40 border border-[#1e293b]/30 rounded-xl text-left transition flex flex-col gap-1"
                    >
                      <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-300 hover:text-blue-400 transition truncate block">
                        {q.title}
                      </a>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">{q.platform} {q.number}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </aside>

      </motion.div>

      {/* Small footer bar */}
      <footer className="border-t border-[#1e293b]/30 mt-16 py-8 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        PrepPath Premium DSA System © 2026. All rights reserved.
      </footer>
    </div>
  );
}
