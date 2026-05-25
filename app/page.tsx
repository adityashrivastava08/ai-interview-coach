"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // SECURE GATEKEEPER: Agar user already authenticated hai, toh landing page se utha kar seedhe dashboard pheenko
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Jab tak session check ho raha hai, tab tak ek clean subtle loader dikhao
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-xs tracking-widest text-slate-600">VERIFYING CONNECTION...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500/20 overflow-x-hidden relative">
      
      {/* Background Subtle Tech Grid Glow Elements */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="border-b border-white/5 bg-slate-950/60 sticky top-0 z-50 backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              ⚡
            </div>
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              IntervAI
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/login")} 
              className="text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push("/register")} 
              className="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:opacity-90"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Decorative Badge Notification */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-6">
          <span>✨ Next-Gen Multi-Track AI Simulator Live</span>
        </div>

        {/* Main Pitch Catchphrase */}
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-[1.15]">
          Crack Technical Mock Interviews With{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Real-Time AI Context Evaluation
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An interactive, data-persistent technical interview playground. Simulate context-aware loops for Java DSA, MERN Full-Stack, and Android Engineering with diagnostic score reporting.
        </p>

        {/* Primary CTA Block */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => router.push("/register")} 
            className="cursor-pointer w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 text-xs font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.01] uppercase tracking-wider"
          >
            Start Mock Session Now ➔
          </button>
          <button 
            onClick={() => router.push("/login")} 
            className="cursor-pointer w-full sm:w-auto rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-900 px-8 py-4 text-xs font-bold text-slate-300 transition"
          >
            View Dashboard Deck
          </button>
        </div>

        {/* Features Preview Layout Section */}
        <div className="mt-24 border-t border-white/5 pt-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold mb-12">Engineered Core Architectures</h2>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="text-sm font-black text-white mb-1">Multi-Turn Active Dialogue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Don't just submit code. Respond to technical follow-up challenge queries dynamically with full conversational context memory retention.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur">
              <div className="text-2xl mb-3">📈</div>
              <h3 className="text-sm font-black text-white mb-1">Graphical Trend Metrics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track regression profiles using interactive linear graphs and matrix visualizations fed straight by persistent data clusters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur">
              <div className="text-2xl mb-3">🧬</div>
              <h3 className="text-sm font-black text-white mb-1">Domain Multi-Track Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless switch between deep algorithm analysis puzzles, full Express router security checks, or native Android layout cycles.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Small Footer Block */}
      <footer className="border-t border-white/5 py-8 text-center text-xs font-mono text-slate-600 relative z-10">
        © 2026 IntervAI Control Node Engine. All rights reserved.
      </footer>
    </div>
  );
}