"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserAvatar, PRESET_AVATARS } from "@/components/Avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

import { 
  DSA_QUESTIONS, 
  APTITUDE_QUESTIONS, 
  DSAPriorQuestion
} from "@/lib/questions";

// ==========================================
// 📋 TYPES & INTERFACES ARCHITECTURE
// ==========================================
interface QuestionLog {
  questionText: string;
  userAnswer: string;
  score: number;
  feedback: string;
}

interface InterviewSession {
  _id: string;
  topic: string;
  score: number;
  feedback: string;
  createdAt: string;
  questions: QuestionLog[];
}

interface ChartDataPoint {
  name: string;
  score: number;
}

interface ResumeAnalysisData {
  atsScore: number;
  skills: string[];
  yearsOfExperience: number;
  gaps: string[];
  suggestedQuestions: string[];
  feedback: string;
}

interface DSAPracticeAttempt {
  _id: string;
  questionId: string;
  status: "solved" | "attempted";
  submittedCode: string;
  feedback: string;
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  attemptedAt: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ==========================================
  // ⚙️ CORE STATE HOOKS BLOCK
  // ==========================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [avatarDropdownActive, setAvatarDropdownActive] = useState(false);

  // History & Statistics state
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    highestScore: 0,
    solvedDsaCount: 0,
    solvedAptitudeCount: 0
  });

  // Resume state
  const [resumeRecord, setResumeRecord] = useState<any>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysisData | null>(null);
  const [resumeProcessing, setResumeProcessing] = useState(false);
  const [processingPercent, setProcessingPercent] = useState(0);
  const [processingStep, setProcessingStep] = useState<"extract" | "skills" | "match">("extract");
  const [resumeError, setResumeError] = useState("");

  // DSA Practice state
  const [dsaAttempts, setDsaAttempts] = useState<DSAPracticeAttempt[]>([]);
  const [selectedDsaTopic, setSelectedDsaTopic] = useState("All");
  const [activeDsaQuestion, setActiveDsaQuestion] = useState<DSAPriorQuestion | null>(null);
  const [dsaCodeInput, setDsaCodeInput] = useState("");
  const [dsaLanguage, setDsaLanguage] = useState("javascript");
  const [dsaEvaluating, setDsaEvaluating] = useState(false);
  const [dsaEvaluationResult, setDsaEvaluationResult] = useState<any>(null);

  // Aptitude Practice state
  const [activeAptOptionInputs, setActiveAptOptionInputs] = useState<Record<string, number>>({});
  const [activeAptEvaluations, setActiveAptEvaluations] = useState<Record<string, any>>({});
  const [activeAptLoading, setActiveAptLoading] = useState<Record<string, boolean>>({});

  // Mock Interview Setup state
  const [setupTrack, setSetupTrack] = useState("java-dsa");
  const [setupDifficulty, setSetupDifficulty] = useState("medium");
  const [setupDuration, setSetupDuration] = useState(30);
  const [setupCompany, setSetupCompany] = useState("");

  // Audit Log Modal state
  const [selectedAuditSession, setSelectedAuditSession] = useState<InterviewSession | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Profile state hooks
  const [profile, setProfile] = useState({
    name: "",
    avatarUrl: "",
    college: "",
    targetCompany: "",
    role: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [profileErrorMessage, setProfileErrorMessage] = useState("");

  const fetchUserProfile = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.email) return;
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (response.ok && data.success && data.profile) {
        setProfile({
          name: data.profile.name || session.user.name || "",
          avatarUrl: data.profile.avatarUrl || "",
          college: data.profile.college || "",
          targetCompany: data.profile.targetCompany || "",
          role: data.profile.role || ""
        });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }, [session?.user?.email, session?.user?.name, status]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMessage("");
    setProfileErrorMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      if (response.ok && data.success && data.profile) {
        setProfileSuccessMessage("Profile credentials updated successfully!");
        setProfile({
          name: data.profile.name,
          avatarUrl: data.profile.avatarUrl || "",
          college: data.profile.college || "",
          targetCompany: data.profile.targetCompany || "",
          role: data.profile.role || ""
        });
      } else {
        setProfileErrorMessage(data.error || "Failed to update profile details.");
      }
    } catch {
      setProfileErrorMessage("An error occurred while updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // 🛡️ SECURITY & SESSION GATEKEEPER EFFECT
  // ==========================================
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ==========================================
  // 🌓 THEME CONTROL LAYER
  // ==========================================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ==========================================
  // 📊 COMPREHENSIVE DATA FETCHER EFFECT
  // ==========================================
  const fetchPerformanceHistory = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    try {
      setLoadingHistory(true);
      const response = await fetch("/api/history");
      const data = await response.json();

      if (response.ok) {
        // Set Interview History
        const historyData: InterviewSession[] = data.history || [];
        setInterviews(historyData);

        // Set Resume Data
        if (data.resume) {
          setResumeRecord(data.resume);
          try {
            const analyzed = JSON.parse(data.resume.textContent);
            setResumeAnalysis(analyzed);
          } catch {
            setResumeAnalysis(null);
          }
        } else {
          setResumeRecord(null);
          setResumeAnalysis(null);
        }

        // Set DSA Attempts
        const attempts: DSAPracticeAttempt[] = data.dsaAttempts || [];
        setDsaAttempts(attempts);

        // Set Aptitude Attempts
        const aptAttempts = data.aptitudeAttempts || [];

        // Populate evaluations state for already solved aptitude questions
        const initialEvaluations: Record<string, any> = {};
        const initialSelected: Record<string, number> = {};
        aptAttempts.forEach((attempt: any) => {
          initialEvaluations[attempt.questionId] = {
            isCorrect: attempt.isCorrect,
            selectedOption: attempt.selectedOption,
            correctOption: APTITUDE_QUESTIONS.find(q => q.id === attempt.questionId)?.correctOptionIndex
          };
          initialSelected[attempt.questionId] = attempt.selectedOption;
        });
        setActiveAptEvaluations(initialEvaluations);
        setActiveAptOptionInputs(initialSelected);

        // Calculate statistics
        const solvedCount = attempts.filter((a) => a.status === "solved").length;
        const solvedAptitudeCount = aptAttempts.filter((a: any) => a.isCorrect).length;

        if (historyData.length > 0) {
          let totalQuestionsEvaluated = 0;
          let combinedScoreSum = 0;
          let peakScore = 0;
          const graphPoints: ChartDataPoint[] = [];

          [...historyData].reverse().forEach((sess, idx) => {
            let sessionScoreSum = 0;
            let sessionQuestionsCount = 0;

            if (sess.questions && Array.isArray(sess.questions)) {
              sess.questions.forEach((q) => {
                totalQuestionsEvaluated++;
                combinedScoreSum += q.score;
                if (q.score > peakScore) peakScore = q.score;
                sessionScoreSum += q.score;
                sessionQuestionsCount++;
              });
            }

            if (sessionQuestionsCount > 0) {
              graphPoints.push({
                name: `Sess ${idx + 1}`,
                score: Math.round((sessionScoreSum / sessionQuestionsCount) * 10) / 10
              });
            } else if (sess.score !== null) {
              if (sess.score > peakScore) peakScore = sess.score;
              graphPoints.push({
                name: `Sess ${idx + 1}`,
                score: sess.score
              });
              totalQuestionsEvaluated += 1;
              combinedScoreSum += sess.score;
            }
          });

          setChartData(graphPoints);
          setStats({
            totalSessions: historyData.length,
            averageScore: totalQuestionsEvaluated > 0 ? Math.round((combinedScoreSum / totalQuestionsEvaluated) * 10) / 10 : 0,
            highestScore: peakScore,
            solvedDsaCount: solvedCount,
            solvedAptitudeCount: solvedAptitudeCount
          });
        } else {
          setChartData([]);
          setStats({
            totalSessions: 0,
            averageScore: 0,
            highestScore: 0,
            solvedDsaCount: solvedCount,
            solvedAptitudeCount: solvedAptitudeCount
          });
        }
      }
    } catch (err) {
      console.error("Error generating dashboard metrics:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    fetchPerformanceHistory();
    fetchUserProfile();
  }, [fetchPerformanceHistory, fetchUserProfile]);

  // ==========================================
  // 📁 RESUME FILE UPLOAD HANDLER
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processResume(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processResume(file);
  };

  const processResume = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
      setResumeError("Currently, only PDF or TXT resume files are supported.");
      return;
    }

    setResumeError("");
    setResumeProcessing(true);
    setProcessingPercent(0);
    setProcessingStep("extract");

    const progressInterval = setInterval(() => {
      setProcessingPercent((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 250);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result?.toString().split(",")[1];
        
        setTimeout(() => setProcessingStep("skills"), 600);
        setTimeout(() => setProcessingStep("match"), 1200);

        const response = await fetch("/api/resume/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || "application/pdf",
            fileData: base64Data
          })
        });

        clearInterval(progressInterval);
        setProcessingPercent(100);

        const data = await response.json();
        if (response.ok && data.success) {
          setResumeRecord(data.resume);
          setResumeAnalysis(data.analysis);
          await fetchPerformanceHistory();
        } else {
          setResumeError(data.error || "Failed to process resume analysis.");
        }
      } catch {
        setResumeError("An error occurred while uploading your resume file.");
      } finally {
        setTimeout(() => setResumeProcessing(false), 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetResumeUpload = () => {
    setResumeRecord(null);
    setResumeAnalysis(null);
    setResumeError("");
  };

  // ==========================================
  // 💻 DSA CODE SUBMISSION HANDLER
  // ==========================================
  const handleDsaSubmit = async () => {
    if (!activeDsaQuestion || dsaEvaluating) return;

    setDsaEvaluating(true);
    setDsaEvaluationResult(null);

    try {
      const response = await fetch("/api/dsa/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeDsaQuestion.id,
          code: dsaCodeInput,
          language: dsaLanguage
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDsaEvaluationResult(data.evaluation);
        await fetchPerformanceHistory();
      } else {
        setDsaEvaluationResult({
          status: "attempted",
          score: 2,
          feedback: data.error || "Execution timeout or evaluation failure."
        });
      }
    } catch {
      setDsaEvaluationResult({
        status: "attempted",
        score: 0,
        feedback: "Network evaluation error. Please try again."
      });
    } finally {
      setDsaEvaluating(false);
    }
  };

  // ==========================================
  // 🧠 APTITUDE QUESTION ATTEMPT HANDLER
  // ==========================================
  const handleAptitudeSubmit = async (questionId: string, optionIdx: number) => {
    if (activeAptLoading[questionId] || activeAptEvaluations[questionId]) return;

    // Set loading
    setActiveAptLoading(prev => ({ ...prev, [questionId]: true }));
    setActiveAptOptionInputs(prev => ({ ...prev, [questionId]: optionIdx }));

    try {
      const response = await fetch("/api/aptitude/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedOption: optionIdx
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setActiveAptEvaluations(prev => ({
          ...prev,
          [questionId]: {
            isCorrect: data.isCorrect,
            selectedOption: optionIdx,
            correctOption: data.correctOption
          }
        }));
        await fetchPerformanceHistory();
      }
    } catch (err) {
      console.error("Failed to check aptitude answer:", err);
    } finally {
      setActiveAptLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // ==========================================
  // 🚀 LAUNCH DYNAMIC INTERVIEW INSTANCE
  // ==========================================
  const startInterview = async () => {
    if (status !== "authenticated" || !session?.user?.email) return;

    try {
      const response = await fetch("/api/interview/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          topic: setupTrack.replace("-", " ").toUpperCase()
        })
      });

      const data = await response.json();
      if (response.ok && data.interviewId) {
        router.push(`/interview?id=${data.interviewId}&track=${setupTrack}&difficulty=${setupDifficulty}&duration=${setupDuration}&company=${encodeURIComponent(setupCompany)}`);
      } else {
        console.error("Failed to initialize interview database pipeline:", data.error);
      }
    } catch (err) {
      console.error("Network crash during interview session setup:", err);
    }
  };

  // ==========================================
  // 🌀 SHIM LOADER GATE
  // ==========================================
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a] font-mono text-sm tracking-widest text-[#94a3b8]">
        COMPILING PORTAL RESOURCES...
      </div>
    );
  }

  if (!session) return null;

  const getReadinessTierBadge = (avg: number) => {
    if (avg >= 8.0) return <span className="tier-badge tier-ready">Interview Ready</span>;
    if (avg >= 5.5) return <span className="tier-badge tier-developing">Developing Skills</span>;
    return <span className="tier-badge tier-preparing">Needs Prep</span>;
  };

  const getDsaAttemptStatus = (qid: string) => {
    const record = dsaAttempts.find((a) => a.questionId === qid);
    if (!record) return "new";
    return record.status;
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9]">
      
      {/* =========================================================
          ⚡ REDESIGNED STICKY GLASSMORPHIC NAVIGATION HEADER
         ========================================================= */}
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-4 bg-[#f8fafc]/40 dark:bg-[#0f172a]/40 border-b border-slate-200/50 dark:border-[#334155]/30 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab("dashboard")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
              PrepPath
            </span>
          </div>

          {/* Centered Tab Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-[#1e293b]/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "mock-interview", label: "Mock Interview" },
              { id: "resume", label: "Resume Interview" },
              { id: "dsa", label: "DSA Practice" },
              { id: "aptitude", label: "Aptitude Practice" },
              { id: "profile", label: "Profile" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-[#334155] text-blue-600 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200/50 dark:border-[#334155]/30 bg-white/50 dark:bg-[#1e293b]/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.05a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-.707-8.485a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setAvatarDropdownActive(!avatarDropdownActive)}
                className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200/50 dark:border-[#334155]/30 bg-white/50 dark:bg-[#1e293b]/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <UserAvatar avatarUrl={profile.avatarUrl} name={profile.name || session.user.name || undefined} className="h-7 w-7 rounded-lg" />
                <svg className="w-3.5 h-3.5 text-slate-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {avatarDropdownActive && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-2xl p-2 z-55">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{profile.name || session.user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{session.user.email}</p>
                    {profile.role && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">{profile.role}</p>}
                    {profile.college && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{profile.college}</p>}
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 uppercase tracking-wider">Pro Access</span>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setAvatarDropdownActive(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      View Profile Details
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-red-650 hover:bg-red-50 dark:hover:bg-red-500/10 text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign Out Account
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Tab Bar */}
        <div className="md:hidden mt-3 flex flex-wrap justify-around border-t border-slate-100 dark:border-[#334155] pt-2 gap-y-1">
          <button onClick={() => setActiveTab("dashboard")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Dashboard</button>
          <button onClick={() => setActiveTab("mock-interview")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "mock-interview" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Mock</button>
          <button onClick={() => setActiveTab("resume")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "resume" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Resume</button>
          <button onClick={() => setActiveTab("dsa")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "dsa" ? "bg-blue-600 text-white" : "text-slate-500"}`}>DSA</button>
          <button onClick={() => setActiveTab("aptitude")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "aptitude" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Aptitude</button>
          <button onClick={() => setActiveTab("profile")} className={`text-[10px] font-bold py-1 px-2.5 rounded-lg ${activeTab === "profile" ? "bg-blue-600 text-white" : "text-slate-500"}`}>Profile</button>
        </div>
      </nav>

      {/* =========================================================
          📦 MAIN VIEWPORT CONTAINER
         ========================================================= */}
      <main className="mx-auto max-w-7xl p-4 md:p-8">

        {/* =========================================================
            📊 VIEW: DASHBOARD TAB
           ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="animate-in">
            <div className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[60px]" />
              <div className="relative z-10">
                <span className="text-[10px] font-bold font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase">Metrics Terminal</span>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">Welcome, {session.user.name || "Developer"}</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  Analyze your overall placement readiness profile. Review performance graph timelines, upload resumes for ATS feedback, or practice coding and aptitude questions.
                </p>
              </div>
            </div>

            {/* KPI Metrics Cards (5 columns for new Aptitude stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 mb-8">
              {/* Interviews Taken */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">Interviews Taken</span>
                    <span className="block text-3xl font-black tracking-tight mt-2">{stats.totalSessions}</span>
                    <p className="text-[10px] text-green-500 mt-2 font-medium">✨ Real-time loops</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-[#1e293b] border border-blue-100 dark:border-[#334155]">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Interview Score */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">Average Score</span>
                    <span className="block text-3xl font-black tracking-tight mt-2">{stats.averageScore}</span>
                    <p className="text-[10px] text-indigo-500 mt-2 font-medium">Out of 10 rating</p>
                  </div>
                  <div className="relative shrink-0">
                    <svg className="progress-ring w-12 h-12" viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border)" strokeWidth="5"/>
                      <circle
                        className="progress-ring-circle"
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="157.08"
                        strokeDashoffset={157.08 - (157.08 * (stats.averageScore || 0)) / 10}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-black">{Math.round((stats.averageScore || 0) * 10)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DSA Solved Count */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">DSA Solved</span>
                    <span className="block text-3xl font-black tracking-tight mt-2">{stats.solvedDsaCount} <span className="text-xs text-slate-450">/ {DSA_QUESTIONS.length}</span></span>
                    <p className="text-[10px] text-amber-500 mt-2 font-medium">Coding questions</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-[#1e293b] border border-amber-100 dark:border-[#334155]">
                    <svg className="w-4 h-4 text-amber-550" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Aptitude Accuracy */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">Aptitude accuracy</span>
                    <span className="block text-3xl font-black tracking-tight mt-2">{stats.solvedAptitudeCount} <span className="text-xs text-slate-450">/ {APTITUDE_QUESTIONS.length}</span></span>
                    <p className="text-[10px] text-violet-500 mt-2 font-medium">Logic accuracy</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50 dark:bg-[#1e293b] border border-violet-100 dark:border-[#334155]">
                    <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-.304 0-.604-.04-.896-.12l-.548-.547z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* AI Readiness Badge Card */}
              <div className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-450 dark:text-slate-500 font-bold">Readiness Level</span>
                    <div className="mt-3">
                      {getReadinessTierBadge(stats.averageScore)}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-3 font-mono">Assessed index</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-[#1e293b] border border-green-100 dark:border-[#334155]">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance progression charts */}
            {!loadingHistory && chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card p-5 md:p-6">
                  <div className="mb-4">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Score Progression Trend</h3>
                    <p className="text-xs text-slate-400">Score ratings across interview logs</p>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} opacity={0.3} />
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", color: "var(--fg)", fontSize: 12 }} />
                        <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3.5} activeDot={{ r: 6 }} name="Score Rating" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-5 md:p-6">
                  <div className="mb-4">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Attempts Matrix Review</h3>
                    <p className="text-xs text-slate-400">Session metrics comparison</p>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#334155" : "#e2e8f0"} opacity={0.3} />
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                        <YAxis domain={[0, 10]} stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", color: "var(--fg)", fontSize: 12 }} />
                        <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Session Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Assessment timeline */}
            <div className="card p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Recent Placement Assessments</h3>
                  <p className="text-xs text-slate-400">Assessment timeline details & diagnostics logs</p>
                </div>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center font-mono text-xs text-slate-400">Compiling placement history...</div>
              ) : interviews.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#334155] p-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No historical mock interview sessions found.</p>
                  <button onClick={() => setActiveTab("mock-interview")} className="btn-primary text-xs">Configure Mock Session Now</button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Key</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluation Grade</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Timestamp</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Diagnostic Feed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {interviews.map((sess) => (
                        <tr key={sess._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{sess.topic}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-black text-sm text-amber-500 dark:text-amber-400">
                            {sess.score !== null ? `${sess.score} / 10` : "Evaluation Pending"}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                            {new Date(sess.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedAuditSession(sess);
                                setIsAuditModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 text-xs font-bold font-mono rounded-lg border border-blue-200 dark:border-[#334155] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              Diagnostics ➔
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =========================================================
            🎯 VIEW: MOCK INTERVIEW SETUP TAB
           ========================================================= */}
        {activeTab === "mock-interview" && (
          <div className="max-w-2xl mx-auto animate-in">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase">Configuration Portal</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Configure Placement Mock</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Specify credentials to start your AI placement assessment.</p>
            </div>

            <div className="card p-6 md:p-8 space-y-6">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Assessment Domain Track</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "java-dsa", name: "Java & DSA", desc: "Garbage collection, Big O, algorithm arrays", icon: "☕" },
                    { id: "mern", name: "MERN Stack", desc: "React virtual DOM, event loops, scalability", icon: "🌐" },
                    { id: "android", name: "Android Native", desc: "Compose UI, Kotlin, memory life-cycle", icon: "📱" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSetupTrack(t.id)}
                      className={`p-4 text-left border-2 rounded-2xl transition-all cursor-pointer ${
                        setupTrack === t.id
                          ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750 bg-white dark:bg-[#1e293b]/40"
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <h4 className="font-bold text-sm mt-3">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Difficulty Parameter</label>
                  <div className="flex border border-slate-200 dark:border-slate-800 p-1 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    {["easy", "medium", "hard"].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSetupDifficulty(diff)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                          setupDifficulty === diff
                            ? "bg-white dark:bg-[#334155] text-blue-600 dark:text-white shadow-sm font-bold"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-850 dark:hover:text-white"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Session Duration</label>
                  <div className="flex border border-slate-200 dark:border-slate-800 p-1 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    {[15, 30, 45].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSetupDuration(dur)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          setupDuration === dur
                            ? "bg-white dark:bg-[#334155] text-blue-600 dark:text-white shadow-sm font-bold"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-850 dark:hover:text-white"
                        }`}
                      >
                        {dur} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="setup-company" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Target Corporate standard (Optional)</label>
                <select
                  id="setup-company"
                  aria-label="Target Corporate standard (Optional)"
                  value={setupCompany}
                  onChange={(e) => setSetupCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1e293b] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">Any Placement Standards</option>
                  <option value="Google">Google (Standard Software Engineer)</option>
                  <option value="Amazon">Amazon (SDE I/II parameters)</option>
                  <option value="Microsoft">Microsoft (Core algorithms & systems)</option>
                  <option value="Meta">Meta (System Optimization)</option>
                  <option value="Apple">Apple (Firmware & low latency)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button onClick={() => setActiveTab("dashboard")} className="btn-secondary text-xs">Dashboard</button>
                <button onClick={startInterview} className="btn-primary text-xs flex items-center gap-1.5">
                  Launch Assessment Workspace 🚀
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            📁 VIEW: RESUME INTERVIEW (ANALYSIS) TAB
           ========================================================= */}
        {activeTab === "resume" && (
          <div className="max-w-4xl mx-auto animate-in">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase">Audit Terminal</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Resume ATS Analysis</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Upload resume PDF to inspect ATS scorecards, skills gaps, and tailor mock prep.</p>
            </div>

            {!resumeRecord && !resumeProcessing && (
              <div className="card p-8 text-center">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("resume-input-file")?.click()}
                  className="drop-zone p-12 text-center cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-slate-700 bg-white dark:bg-[#1e293b]/20 hover:bg-slate-50 dark:hover:bg-[#1e293b]/40 transition rounded-3xl"
                >
                  <input
                    type="file"
                    id="resume-input-file"
                    className="hidden"
                    accept=".pdf,.txt"
                    aria-label="Upload resume file"
                    onChange={handleFileUpload}
                  />
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-blue-50 dark:bg-[#1e293b] border border-blue-100 dark:border-slate-800">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">Drag and drop your resume here</h3>
                  <p className="text-xs text-slate-400 mt-1">or click to browse files on your computer</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">Accepts PDF & Plain Text documents (Max 5MB)</p>
                </div>
                {resumeError && (
                  <p className="text-xs text-red-500 font-semibold mt-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 p-2.5 rounded-xl">{resumeError}</p>
                )}
              </div>
            )}

            {resumeProcessing && (
              <div className="card p-8 md:p-12 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-blue-50 dark:bg-[#1e293b] border border-blue-100 dark:border-slate-800">
                  <svg className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">Processing Your Resume</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Evaluating experience depth & mapping matching skill algorithms...</p>

                <div className="mt-8 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-bold font-mono mb-2">
                    <span className="text-slate-400">Analysis Progress</span>
                    <span className="text-blue-600 dark:text-blue-400">{processingPercent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 p-0.5">
                    <div className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300" style={{ width: `${processingPercent}%` }}></div>
                  </div>
                </div>

                <div className="mt-8 space-y-3.5 text-left max-w-xs mx-auto border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingStep !== "extract" ? "border-green-500 bg-green-500/10" : "border-slate-300 animate-pulse"}`}>
                      {processingStep !== "extract" && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                    <span className={`text-xs ${processingStep !== "extract" ? "text-slate-400 font-medium" : "font-bold text-slate-800 dark:text-white"}`}>Extracting text content</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingStep === "match" ? "border-green-500 bg-green-500/10" : processingStep === "skills" ? "border-blue-500 animate-pulse" : "border-slate-300"}`}>
                      {processingStep === "match" && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                    <span className={`text-xs ${processingStep === "match" ? "text-slate-400 font-medium" : processingStep === "skills" ? "font-bold text-slate-800 dark:text-white" : "text-slate-400"}`}>Identifying skills and keywords</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${processingPercent === 100 ? "border-green-500 bg-green-500/10" : processingStep === "match" ? "border-blue-500 animate-pulse" : "border-slate-300"}`}>
                      {processingPercent === 100 && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                    </div>
                    <span className={`text-xs ${processingPercent === 100 ? "text-slate-400 font-medium" : processingStep === "match" ? "font-bold text-slate-800 dark:text-white" : "text-slate-400"}`}>Matching with job requirements</span>
                  </div>
                </div>
              </div>
            )}

            {resumeRecord && resumeAnalysis && !resumeProcessing && (
              <div className="space-y-6">
                
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50 dark:bg-[#1e293b] border border-green-100 dark:border-slate-800">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">ATS Evaluation Complete</h3>
                        <p className="text-xs text-slate-400 font-mono">Last updated: {new Date(resumeRecord.extractedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={resetResumeUpload} className="btn-secondary text-xs py-1.5 px-3">Upload New Resume</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-100 dark:border-[#334155]/30 bg-slate-50 dark:bg-slate-800/20 text-center">
                      <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{resumeAnalysis.atsScore}%</p>
                      <p className="text-xs text-slate-400 mt-2 font-semibold">ATS Match Rating</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 dark:border-[#334155]/30 bg-slate-50 dark:bg-slate-800/20 text-center">
                      <p className="text-4xl font-black text-green-500">{resumeAnalysis.skills?.length || 0}</p>
                      <p className="text-xs text-slate-400 mt-2 font-semibold">Skills Identified</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-slate-100 dark:border-[#334155]/30 bg-slate-50 dark:bg-slate-800/20 text-center">
                      <p className="text-4xl font-black text-amber-500">{resumeAnalysis.yearsOfExperience || 0} yrs</p>
                      <p className="text-xs text-slate-400 mt-2 font-semibold">Years of Experience</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-4">Identified Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeAnalysis.skills?.map((sk, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-4">Targeted Gaps & Suggestions</h3>
                    {resumeAnalysis.gaps && resumeAnalysis.gaps.length > 0 ? (
                      <ul className="space-y-3.5">
                        {resumeAnalysis.gaps.map((gap, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-green-500 font-semibold">No critical skill gaps identified. Candidate matching parameters look strong!</p>
                    )}
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-4">Resume-Tailored Mock Questions</h3>
                  <div className="space-y-4">
                    {resumeAnalysis.suggestedQuestions?.map((q, index) => (
                      <div key={index} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50 dark:bg-slate-800/10">
                        <div className="h-6 w-6 font-mono font-black text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 rounded flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/15">
                  <h3 className="font-extrabold text-sm text-blue-600 dark:text-blue-400 mb-2">Technical Recruiter&apos;s Diagnostic Summary</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{resumeAnalysis.feedback}</p>
                </div>

              </div>
            )}
          </div>
        )}

        {/* =========================================================
            💻 VIEW: DSA PRACTICE TAB
           ========================================================= */}
        {activeTab === "dsa" && (
          <div className="animate-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-1 space-y-6">
                <div className="card p-5">
                  <h3 className="font-extrabold text-sm mb-3">Topic Filter</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Arrays", "Linked Lists", "Stacks", "Trees", "Dynamic Programming", "Graphs"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedDsaTopic(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedDsaTopic === t
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  {DSA_QUESTIONS.filter(q => selectedDsaTopic === "All" || q.topic === selectedDsaTopic).map((q) => {
                    const status = getDsaAttemptStatus(q.id);
                    const isActive = activeDsaQuestion?.id === q.id;
                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setActiveDsaQuestion(q);
                          setDsaCodeInput(q.starterCode);
                          setDsaEvaluationResult(null);
                        }}
                        className={`card p-4 text-left cursor-pointer transition-all duration-300 select-none ${
                          isActive
                            ? "border-blue-500 bg-blue-500/5"
                            : "hover:border-slate-355 dark:hover:border-slate-755"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`status-dot ${status === "solved" ? "status-solved" : status === "attempted" ? "status-attempted" : "status-new"}`} title={status} />
                          <span className={`text-xs font-bold capitalize font-mono px-2 py-0.5 rounded ${
                            q.difficulty === "easy"
                              ? "bg-green-500/10 text-green-500"
                              : q.difficulty === "medium"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-red-500/10 text-red-500"
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm mt-3 text-slate-800 dark:text-white">{q.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <span>{q.topic}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2">
                {activeDsaQuestion ? (
                  <div className="card p-6 md:p-8 space-y-6 animate-in">
                    
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{activeDsaQuestion.title}</h2>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">{activeDsaQuestion.topic}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed whitespace-pre-wrap">{activeDsaQuestion.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase mb-2">Example Cases</h4>
                        <div className="space-y-3">
                          {activeDsaQuestion.examples.map((ex, i) => (
                            <div key={i} className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50 dark:bg-slate-800/10 text-[11px]">
                              <p className="font-mono"><strong className="text-slate-400">Input:</strong> {ex.input}</p>
                              <p className="font-mono mt-1"><strong className="text-slate-400">Output:</strong> {ex.output}</p>
                              {ex.explanation && <p className="text-slate-400 mt-1 italic"><strong className="text-slate-400">Why:</strong> {ex.explanation}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase mb-2">Constraints</h4>
                        <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {activeDsaQuestion.constraints.map((c, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase">Write Code Solution</h4>
                        
                        <div className="flex items-center gap-2">
                          <label htmlFor="dsa-language" className="text-[10px] font-bold text-slate-400">Language:</label>
                          <select
                            id="dsa-language"
                            title="Select programming language"
                            value={dsaLanguage}
                            onChange={(e) => setDsaLanguage(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-[11px] focus:outline-none"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                          </select>
                        </div>
                      </div>

                      <label htmlFor="dsa-code" className="sr-only">Code input</label>
                      <textarea
                        id="dsa-code"
                        title="Enter your solution code"
                        placeholder="Write your code solution here..."
                        aria-label="Code input"
                        value={dsaCodeInput}
                        onChange={(e) => setDsaCodeInput(e.target.value)}
                        disabled={dsaEvaluating}
                        rows={10}
                        className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16] text-[#0f172a] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={handleDsaSubmit}
                          title="Submit solution"
                          disabled={dsaEvaluating || !dsaCodeInput.trim()}
                          className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          {dsaEvaluating ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Running evaluation...
                            </>
                          ) : "Submit Solution ➔"}
                        </button>
                      </div>
                    </div>

                    {dsaEvaluationResult && (
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#334155]/30 bg-slate-50 dark:bg-slate-800/10 space-y-4 animate-in">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">AI Evaluation Feedback</h4>
                          <span className={`px-3 py-1 text-xs font-mono font-black rounded-lg ${
                            dsaEvaluationResult.status === "solved"
                              ? "bg-green-500/10 text-green-500 border border-green-500/10"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/10"
                          }`}>
                            {dsaEvaluationResult.status === "solved" ? "Correct - Solved! 🎉" : "Flawed - Attempted ⚠️"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 border border-slate-200 dark:border-[#334155]/20 bg-white dark:bg-[#1e293b]/40 rounded-xl text-center">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono">Assigned Score</span>
                            <span className="text-lg font-black mt-1 block">{dsaEvaluationResult.score} / 10</span>
                          </div>
                          <div className="p-3 border border-slate-200 dark:border-[#334155]/20 bg-white dark:bg-[#1e293b]/40 rounded-xl text-center">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono">Time Complexity</span>
                            <span className="text-lg font-black font-mono mt-1 block text-blue-600 dark:text-blue-400">{dsaEvaluationResult.timeComplexity}</span>
                          </div>
                          <div className="p-3 border border-slate-200 dark:border-[#334155]/20 bg-white dark:bg-[#1e293b]/40 rounded-xl text-center">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono">Space Complexity</span>
                            <span className="text-lg font-black font-mono mt-1 block text-indigo-550">{dsaEvaluationResult.spaceComplexity}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold font-mono mb-1">Code Review Critique</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{dsaEvaluationResult.feedback}</p>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                      </svg>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200">Select a Coding Challenge</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Choose one of our curated placement questions from the left side list to write and evaluate your solution.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================
            🧠 VIEW: APTITUDE PRACTICE TAB
           ========================================================= */}
        {activeTab === "aptitude" && (
          <div className="animate-in space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase">Training Sandbox</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Aptitude Practice</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Solve corporate-placement quantitative and logical reasoning multiple choice questions.</p>
            </div>

            <div className="space-y-6">
              {APTITUDE_QUESTIONS.map((q) => {
                const evaluation = activeAptEvaluations[q.id];
                const selectedOption = activeAptOptionInputs[q.id];
                const isLoading = activeAptLoading[q.id];

                return (
                  <div key={q.id} className="card p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">{q.topic}</span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 ml-2 font-bold">{q.subtopic}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-400 dark:text-slate-500">{q.title}</h4>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold whitespace-pre-wrap">{q.question}</p>

                    {/* Options list selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {q.options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        let optionStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]/40 hover:border-slate-350 dark:hover:border-slate-700";
                        
                        if (evaluation) {
                          if (idx === q.correctOptionIndex) {
                            optionStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold";
                          } else if (isSelected) {
                            optionStyle = "border-red-500 bg-red-500/10 text-red-650 dark:text-red-400 font-bold";
                          } else {
                            optionStyle = "border-slate-150 dark:border-slate-850 opacity-60";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-blue-500 bg-blue-500/5";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={!!evaluation || isLoading}
                            onClick={() => handleAptitudeSubmit(q.id, idx)}
                            className={`p-4 text-left rounded-xl border text-xs transition duration-200 cursor-pointer ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] uppercase border ${
                                evaluation && idx === q.correctOptionIndex
                                  ? "border-green-500 bg-green-500/10 text-green-500"
                                  : evaluation && isSelected
                                  ? "border-red-500 bg-red-500/10 text-red-500"
                                  : "border-slate-200 dark:border-slate-700 text-slate-400"
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Loader */}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 py-2">
                        <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Evaluating option selection...
                      </div>
                    )}

                    {/* Check correctness & logic breakdown explanation */}
                    {evaluation && (
                      <div className="p-4 border border-blue-500/10 bg-blue-500/5 rounded-2xl text-xs space-y-2.5 animate-in stagger-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono uppercase tracking-wider text-[10px] ${evaluation.isCorrect ? "text-green-500" : "text-red-500"}`}>
                            {evaluation.isCorrect ? "Correct answer! 🎉" : "Incorrect selection ❌"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-[10px] font-mono uppercase tracking-wider text-slate-450 dark:text-slate-500 block mb-1">Mathematical Explanation:</strong>
                          <p className="text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line font-medium">{q.explanation}</p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================
            👤 VIEW: PROFILE TAB
           ========================================================= */}
        {activeTab === "profile" && (
          <div className="animate-in space-y-8">
            {/* Header banner */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[60px]" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">User Space</span>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">Profile Workspace</h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                    Configure your student credentials, choose your interactive avatar, and analyze overall readiness benchmark indicators.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <UserAvatar avatarUrl={profile.avatarUrl} name={profile.name || session.user.name || undefined} className="h-16 w-16" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{profile.name || session.user.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{session.user.email}</p>
                    <p className="text-[10px] font-bold text-indigo-500 mt-1 font-mono uppercase">
                      {profile.role || "Candidate Member"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form & Avatar Selector */}
              <div className="lg:col-span-2 space-y-8">
                {/* Credentials Form Card */}
                <div className="card p-6 md:p-8 bg-white dark:bg-[#1e293b]">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Credentials</h2>
                    <p className="text-xs text-slate-400 mt-1">Configure profile identifiers used across mock assessments.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {profileSuccessMessage && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold">
                        ✓ {profileSuccessMessage}
                      </div>
                    )}
                    {profileErrorMessage && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs font-bold">
                        ✗ {profileErrorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">CURRENT ROLE / TARGET TITLE</label>
                        <input
                          type="text"
                          value={profile.role}
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Final Year CS Student, Intern"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">COLLEGE / UNIVERSITY</label>
                        <input
                          type="text"
                          value={profile.college}
                          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Stanford University"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 mb-2">TARGET COMPANY</label>
                        <input
                          type="text"
                          value={profile.targetCompany}
                          onChange={(e) => setProfile({ ...profile, targetCompany: e.target.value })}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="e.g. Google, Microsoft, Meta"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="btn-primary text-xs px-6 py-2.5 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingProfile && (
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                        )}
                        {savingProfile ? "Saving Details..." : "Save Credentials"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Avatar Selection Card */}
                <div className="card p-6 md:p-8 bg-white dark:bg-[#1e293b]">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose Your Avatar</h2>
                    <p className="text-xs text-slate-400 mt-1">Select an identity representational badge to display on dashboard headers and active simulators.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PRESET_AVATARS.map((av) => {
                      const isSelected = profile.avatarUrl === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setProfile({ ...profile, avatarUrl: av.id })}
                          className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-3 transition cursor-pointer ${
                            isSelected
                              ? "border-indigo-505 bg-indigo-500/5 ring-2 ring-indigo-500/30"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">{av.svg}</div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{av.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      OR INPUT CUSTOM AVATAR IMAGE URL
                    </label>
                    <input
                      type="url"
                      value={profile.avatarUrl.startsWith("avatar-") ? "" : profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      placeholder="https://example.com/avatar.png"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                      Must start with http://, https://, or load local path references.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics & Analytics Sidebar */}
              <div className="space-y-8">
                <div className="card p-6 md:p-8 bg-white dark:bg-[#1e293b]">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Prep Analytics</h2>
                    <p className="text-xs text-slate-400 mt-1">Aggregated scoring metrics comparing with entry-level corporate benchmarks.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Stat Item: Interviews */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 dark:text-slate-500 block uppercase">
                          MOCK ASSESSMENTS
                        </span>
                        <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">
                          {stats.totalSessions} Sessions
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-500 font-mono">
                        Avg: {stats.averageScore}/10
                      </span>
                    </div>

                    {/* Stat Item: DSA Solved */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 dark:text-slate-500 block uppercase">
                          DSA CHALLENGES
                        </span>
                        <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">
                          {stats.solvedDsaCount} Solved
                        </span>
                      </div>
                      <span className="text-xs font-bold text-teal-500 font-mono">
                        Target: {DSA_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Stat Item: Aptitude Solved */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 dark:text-slate-500 block uppercase">
                          APTITUDE MCQ SOLVED
                        </span>
                        <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">
                          {stats.solvedAptitudeCount} Correct
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-500 font-mono">
                        Target: {APTITUDE_QUESTIONS.length}
                      </span>
                    </div>

                    {/* Stat Item: ATS Match Score */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850">
                      <div>
                        <span className="text-[9px] font-bold font-mono text-slate-450 dark:text-slate-500 block uppercase">
                          RESUME ATS SCORE
                        </span>
                        <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 block">
                          {resumeAnalysis?.atsScore ? `${resumeAnalysis.atsScore}%` : "No Resume"}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-500 font-mono">
                        Benchmark: 80%+
                      </span>
                    </div>
                  </div>

                  {/* Benchmark Comparison Board */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3 tracking-wider">
                      BENCHMARK COMPARISONS
                    </h3>
                    <div className="space-y-4">
                      {/* Metric 1: Interview Score vs Target */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>INTERVIEW READY SCORING</span>
                          <span>{stats.averageScore ? Math.round((stats.averageScore / 10) * 100) : 0}% / 75% Target</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, stats.averageScore ? (stats.averageScore / 10) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: DSA Readiness */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>DSA TRACK COMPLETION</span>
                          <span>{DSA_QUESTIONS.length ? Math.round((stats.solvedDsaCount / DSA_QUESTIONS.length) * 100) : 0}% / 60% Target</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, DSA_QUESTIONS.length ? (stats.solvedDsaCount / DSA_QUESTIONS.length) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Aptitude Readiness */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>APTITUDE MCQ READINESS</span>
                          <span>{APTITUDE_QUESTIONS.length ? Math.round((stats.solvedAptitudeCount / APTITUDE_QUESTIONS.length) * 100) : 0}% / 80% Target</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, APTITUDE_QUESTIONS.length ? (stats.solvedAptitudeCount / APTITUDE_QUESTIONS.length) * 100 : 0)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================
          🔥 DYNAMIC INTERACTIVE AUDIT MODAL OVERLAY
         ========================================================= */}
      {isAuditModalOpen && selectedAuditSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/20 max-w-4xl w-full rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400">Diagnostic Timeline Node</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">{selectedAuditSession.topic} Assessment Audit</h2>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Timestamp: {new Date(selectedAuditSession.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsAuditModalOpen(false);
                  setSelectedAuditSession(null);
                }}
                className="cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 p-2.5 rounded-xl transition font-bold text-xs px-4"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
              {selectedAuditSession.questions && selectedAuditSession.questions.length > 0 ? (
                selectedAuditSession.questions.map((q, idx) => (
                  <div key={idx} className="border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 space-y-4">
                    
                    <div>
                      <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Evaluated Question objective</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono leading-relaxed">
                        {q.questionText || "No question string logged."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Candidate answer submission</span>
                      <p className="text-xs text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 font-mono leading-relaxed whitespace-pre-wrap">
                        {q.userAnswer || "[No answer logged]"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1.5">AI Diagnostic Analysis & Feedback</span>
                      <div className="border border-blue-500/10 bg-blue-500/5 rounded-2xl px-4 py-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-200 font-semibold">
                        {q.feedback || "No assessment feedback log compiled."}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-250 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500">Target Score assigned for this QA turn:</span>
                      <span className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-black font-mono text-amber-500">
                        {q.score} / 10
                      </span>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 font-mono text-xs text-slate-450 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-slate-950/20">
                  🚫 No question response dialogues recorded inside this assessment.
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between shrink-0">
              <div className="text-xs font-bold text-slate-500">Overall Assessment Score:</div>
              <span className="rounded-xl bg-blue-600 text-white font-mono font-black text-sm px-4 py-1.5">{selectedAuditSession.score} / 10</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
