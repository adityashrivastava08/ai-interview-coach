"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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

// ==========================================
// 📋 TYPES & INTERFACES ARCHITECTURE
// ==========================================
interface QuestionLog {
  questionText: string;
  score: number;
  feedback: string;
}

interface InterviewSession {
  _id: string;
  topic: string;
  createdAt: string;
  questions: QuestionLog[];
}

interface ChartDataPoint {
  name: string;
  score: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ==========================================
  // ⚙️ CORE STATE HOOKS BLOCK
  // ==========================================
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  // 🔥 Sync Fix: Default state ko backend tracks ke generic IDs se match kiya ('java-dsa')
  const [selectedTrack, setSelectedTrack] = useState("java-dsa");

  /* 🔥 HISTORICAL AUDIT MODAL HOOKS CONTROLLER */
  const [selectedAuditSession, setSelectedAuditSession] = useState<InterviewSession | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    highestScore: 0,
  });

  // ==========================================
  // 🗺️ AVAILABLE INTERVIEW TRACKS GRID SPEC (UPDATED MATCHING SYSTEM)
  // ==========================================
  const tracks = [
    {
      id: "java-dsa", // Backend map key
      title: "Java & DSA Track",
      desc: "Master core algorithms, arrays, sliding windows, and competitive programming frameworks.",
      icon: "☕",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400"
    },
    {
      id: "mern", // Backend map key
      title: "MERN Full-Stack Developer",
      desc: "Evaluate your full-stack capability on Express routers, secure JWT authentication, and MongoDB scaling.",
      icon: "🌐",
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400"
    },
    {
      id: "android", // Backend map key
      title: "Android Core Engineering",
      desc: "Test mobile app lifecycle states, explicit intents logic, and native Java component handling.",
      icon: "📱",
      color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400"
    }
  ];

  // ==========================================
  // 🛡️ SECURITY & SESSION GATEKEEPER EFFECT
  // ==========================================
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ==========================================
  // 📊 METRICS & DATABASE HISTORY FETCHER EFFECT
  // ==========================================
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const fetchPerformanceHistory = async () => {
      try {
        const response = await fetch(`/api/history?email=${session.user.email}`);
        const data = await response.json();

        if (response.ok && data.history) {
          const historyData: InterviewSession[] = data.history;
          setInterviews(historyData);

          if (historyData.length > 0) {
            let totalQuestionsEvaluated = 0;
            let combinedScoreSum = 0;
            let peakScore = 0;
            const graphPoints: ChartDataPoint[] = [];

            [...historyData].reverse().forEach((session, index) => {
              let sessionScoreSum = 0;
              let sessionQuestionsCount = 0;

              // Check guard rule if questions exist before loop
              if (session.questions && Array.isArray(session.questions)) {
                session.questions.forEach((q) => {
                  totalQuestionsEvaluated++;
                  combinedScoreSum += q.score;
                  if (q.score > peakScore) peakScore = q.score;
                  sessionScoreSum += q.score;
                  sessionQuestionsCount++;
                });
              }

              if (sessionQuestionsCount > 0) {
                graphPoints.push({
                  name: `Sess ${index + 1}`,
                  score: Math.round((sessionScoreSum / sessionQuestionsCount) * 10) / 10
                });
              }
            });

            setChartData(graphPoints);
            setStats({
              totalSessions: historyData.length,
              averageScore: totalQuestionsEvaluated > 0 ? Math.round((combinedScoreSum / totalQuestionsEvaluated) * 10) / 10 : 0,
              highestScore: peakScore,
            });
          }
        }
      } catch (err) {
        console.error("Error generating dashboard metrics:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchPerformanceHistory();
  }, [status, session]);

  // ==========================================
  // 🌀 INITIAL LOADING RUNTIME RENDER GATE
  // ==========================================
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-sm tracking-widest text-slate-600">LOADING METRICS ENGINE...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/20">

      {/* ==========================================
          ⚡ BRAND NEW PREMIUM NAVIGATION DECK HEADER
         ========================================== */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/70 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              IntervAI
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden text-xs font-mono text-slate-400 md:inline-block bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ==========================================
          📦 MAIN CONTAINER VIEWPORT WORKSPACE
         ========================================== */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

        {/* 🌟 BANNER WELCOME DISPLAY BLOCK */}
        <div className="mb-10 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <h1 className="text-2xl font-black text-white sm:text-4xl">Welcome back, {session?.user?.name || "Developer"}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl">
            Select a specialized technical domain below to launch an interactive, multi-turn AI interview simulation setup.
          </p>
        </div>

        {/* 🚀 INTERACTIVE TRACK SELECTION CARDS GRID CONFIG */}
        <div className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 font-bold">Available Interview Tracks</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {tracks.map((track) => {
              const isSelected = selectedTrack === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`group relative rounded-2xl border p-5 cursor-pointer backdrop-blur transition-all duration-300 ${isSelected
                    ? `bg-gradient-to-br ${track.color} shadow-xl scale-[1.01]`
                    : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{track.icon}</span>
                    <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-cyan-400 bg-cyan-400/20" : "border-white/20"
                      }`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white mb-1 group-hover:text-cyan-400 transition">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {track.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* FLOATING WORKSPACE LAUNCH TRIGGER STRIP (REDIRECTS TO /interview) */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => router.push(`/interview?track=${encodeURIComponent(selectedTrack)}`)}
              className="cursor-pointer w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 text-xs font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:opacity-90 tracking-wide text-center uppercase"
            >
              🚀 Launch Active Workspace ({tracks.find(t => t.id === selectedTrack)?.title || selectedTrack})
            </button>
          </div>
        </div>

        {/* 📈 ANALYTICS NUMERIC METRICS CARDS PANEL */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 mb-10">
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5 shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-500">Simulations Completed</span>
            <span className="mt-1 block text-2xl font-black tracking-tight text-white">{stats.totalSessions}</span>
          </div>
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5 shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">Average Evaluation Score</span>
            <span className="mt-1 block text-2xl font-black tracking-tight text-cyan-300">{stats.averageScore} <span className="text-xs text-slate-500 font-normal">/ 10</span></span>
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-5 shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-amber-400/70">Peak Performance Rating</span>
            <span className="mt-1 block text-2xl font-black tracking-tight text-amber-300">{stats.highestScore} <span className="text-xs text-slate-500 font-normal">/ 10</span></span>
          </div>
        </div>

        {/* 📉 VISUAL ANALYTICS GRAPHICAL GRID (LINE & BAR RENDERS) */}
        {!loadingHistory && chartData.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 mb-10">
            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 text-xs">
              <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider text-cyan-400/80">Score Progression Trend</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 6 }} name="Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-5 text-xs">
              <h3 className="text-xs font-bold text-white mb-4 font-mono uppercase tracking-wider text-amber-400/80">Session Comparison Matrix</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#f59e0b", borderRadius: "8px" }} />
                    <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            🕒 RECENT EVALUATION TIMELINE MATRIX FEED
           ========================================================== */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur">
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-500 mb-4 font-bold">Historical Evaluation Timeline</h2>

          {loadingHistory ? (
            <div className="py-12 text-center font-mono text-xs text-slate-500">Compiling analytical database timeline...</div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-white/10 p-8">
              <p className="text-sm text-slate-400 mb-4">No logged records found in your tracking cluster dashboard.</p>
              <button onClick={() => setSelectedTrack("java-dsa")} className="text-xs font-bold text-cyan-400 hover:underline">Select a card above and start your first session ➔</button>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[40vh] overflow-y-auto pr-2">
              {interviews.map((session) => (
                <div key={session._id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{session.topic}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {new Date(session.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-mono text-slate-500">{session.questions ? session.questions.length : 0} question(s) evaluated</span>

                    <button
                      onClick={() => {
                        console.log("CLICKED SESSION DATA:", session);
                        setSelectedAuditSession(session);
                        setIsAuditModalOpen(true);
                      }}
                      className="cursor-pointer rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-black font-mono text-cyan-300 transition hover:bg-cyan-500 hover:text-slate-950"
                    >
                      View Audit Log ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* =========================================================
          🔥 PREMIUM INTERACTIVE HISTORICAL AUDIT MODAL OVERLAY 🔥
         ========================================================= */}
      {isAuditModalOpen && selectedAuditSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/20 max-w-4xl w-full rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Historical Audit Node</span>
                <h2 className="text-xl font-black text-white">{selectedAuditSession.topic} Session</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Timestamp: {new Date(selectedAuditSession.createdAt).toLocaleString("en-US")}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsAuditModalOpen(false);
                  setSelectedAuditSession(null);
                }}
                className="cursor-pointer text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition font-bold text-xs px-3"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {selectedAuditSession.questions && selectedAuditSession.questions.length > 0 ? (
                selectedAuditSession.questions.map((q, idx) => (
                  <div key={idx} className="border border-white/5 bg-slate-950/40 rounded-xl p-4 space-y-4">
                    
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">Evaluated Objective</span>
                      <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-white/5 font-mono">
                        {q.questionText || "No question string logged."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-wider block mb-2">AI Diagnostic Assessment & Feedback</span>
                      <div className="border border-cyan-500/10 bg-cyan-500/5 rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-slate-200">
                        {q.feedback || "No diagnostic assessment logged."}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-white/5">
                      <span className="text-xs font-mono text-slate-400">Target Readiness Score Assigned:</span>
                      <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-black font-mono text-amber-400">
                        {q.score} / 10
                      </span>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 font-mono text-xs text-slate-500 border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
                  🚫 No diagnostic question logs found inside this session node. 
                  <br />
                  <span className="text-cyan-400/60 block mt-2">Try completing a brand new dynamic interview stream!</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}