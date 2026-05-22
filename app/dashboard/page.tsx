"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Core Math Stats Aggregation States
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    highestScore: 0,
  });

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const fetchPerformanceHistory = async () => {
      try {
        const response = await fetch(`/api/history?email=${session.user.email}`);
        const data = await response.json();

        if (response.ok && data.history) {
          const historyData: InterviewSession[] = data.history;
          setInterviews(historyData);

          // Calculate metrics based on real database records
          if (historyData.length > 0) {
            let totalQuestionsEvaluated = 0;
            let combinedScoreSum = 0;
            let peakScore = 0;

            historyData.forEach((session) => {
              session.questions.forEach((q) => {
                totalQuestionsEvaluated++;
                combinedScoreSum += q.score;
                if (q.score > peakScore) peakScore = q.score;
              });
            });

            setStats({
              totalSessions: historyData.length,
              averageScore: totalQuestionsEvaluated > 0 ? Math.round((combinedScoreSum / totalQuestionsEvaluated) * 10) / 10 : 0,
              highestScore: peakScore,
            });
          }
        }
      } catch (err) {
        console.error("Error generating dashboard metrics feed:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchPerformanceHistory();
  }, [status, session]);

  if (status === "loading") return <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-sm tracking-widest text-slate-600">LOADING METRICS ENGINE...</div>;
  if (!session) { router.push("/login"); return null; }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/20">
      {/* Upper Navigation Control Deck */}
      <header className="flex min-h-16 items-center justify-between border-b border-cyan-300/15 bg-slate-950/80 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">IntervAI Controller Deck</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-mono text-slate-400 sm:inline">{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="cursor-pointer rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container Viewport */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        
        {/* Banner Welcome Block */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,182,212,0.1),rgba(15,23,42,0.3))] p-6 shadow-2xl shadow-cyan-950/20 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Welcome back, {session?.user?.name || "Developer"}</h1>
            <p className="mt-1 text-sm text-slate-400">Track your performance milestones and launch new simulator environments.</p>
          </div>
          <button onClick={() => router.push("/interview")} className="cursor-pointer whitespace-nowrap rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-90">
            🚀 Launch New Interview Session
          </button>
        </div>

        {/* Analytics Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 mb-8">
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-slate-500">Simulations Completed</span>
            <span className="mt-2 block text-3xl font-black tracking-tight text-white">{stats.totalSessions}</span>
          </div>
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-6 backdrop-blur shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-cyan-400/70">Average Evaluation Score</span>
            <span className="mt-2 block text-3xl font-black tracking-tight text-cyan-300">{stats.averageScore} <span className="text-xs text-slate-500 font-normal">/ 10</span></span>
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-6 backdrop-blur shadow-xl">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-amber-400/70">Peak Performance Rating</span>
            <span className="mt-2 block text-3xl font-black tracking-tight text-amber-300">{stats.highestScore} <span className="text-xs text-slate-500 font-normal">/ 10</span></span>
          </div>
        </div>

        {/* Recent Evaluation Log Feed Matrix */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur">
          <h2 className="text-lg font-bold text-white mb-6">Historical Evaluation Timeline</h2>

          {loadingHistory ? (
            <div className="py-12 text-center font-mono text-xs text-slate-500">Compiling analytical database timeline...</div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-white/10 p-8">
              <p className="text-sm text-slate-400 mb-4">No logged records found in your tracking cluster dashboard.</p>
              <button onClick={() => router.push("/interview")} className="text-xs font-bold text-cyan-400 hover:underline">Take your first interview simulation session ➔</button>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto pr-2">
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
                    <span className="text-xs font-mono text-slate-500">{session.questions.length} question(s) evaluated</span>
                    <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black font-mono text-cyan-300">
                      View Audit Log
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}