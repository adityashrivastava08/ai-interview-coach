"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // SECURE GATEKEEPER: Agar user already authenticated hai, toh landing page se utha kar seedhe dashboard pheenko
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("sending");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your message.");
      }

      setSubmitStatus("success");
      setSubmitMessage(data.message || "Your message was saved successfully.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      setSubmitStatus("error");
      setSubmitMessage(error.message || "Failed to send message. Please try again.");
    }
  };

  // Jab tak session check ho raha hai, tab tak ek clean subtle loader dikhao
  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 font-mono text-xs tracking-widest text-slate-600">VERIFYING CONNECTION...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-5%] top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-80 w-80 rounded-[36%] bg-sky-500/10 blur-3xl" />
        <div className="absolute left-10 top-[55%] h-[320px] w-[320px] rounded-full bg-slate-900/60 shadow-[0_80px_120px_rgba(56,189,248,0.05)] transform rotate-12" />
      </div>
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 h-[400px] w-[400px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 border-b border-white/10 backdrop-blur-xl px-6 py-4 shadow-lg shadow-black/20">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-sky-350/20">
              ⚡
            </div>
            <span className="text-lg font-black tracking-wider text-white">
              PrepPath
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-semibold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/register")}
              className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-400/30 transition hover:bg-sky-500"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-20 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-16 grid-cols-1 items-start">
          <section className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-blue-400">
              <span>✨ Next-Gen AI Placement Prep Platform Live</span>
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl max-w-4xl mx-auto lg:mx-0 leading-[1.05]">
                Ace Your Placements With <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">AI Mock Interviews & Resume ATS Audit</span>
              </h1>
              <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                PrepPath helps you build placement readiness. Evaluate resume ATS scoring, practice curated coding questions with real-time feedback, and take high-stakes simulated AI mock interviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => router.push("/register")}
                className="cursor-pointer w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-xs font-black text-white shadow-2xl shadow-blue-500/20 transition hover:scale-[1.01] uppercase tracking-wider"
              >
                Start Preparing Now ➔
              </button>
              <button
                onClick={() => router.push("/login")}
                className="cursor-pointer w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-8 py-4 text-xs font-bold text-white transition"
              >
                Enter Dashboard
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl shadow-black/20 backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400 mb-6">What You Get</h2>
            <div className="space-y-6 text-left text-slate-300">
              <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Interview Practice</p>
                <p className="text-sm leading-7 text-slate-300">
                  Build confidence with realistic mock interviews, answer coaching, and feedback tailored to placement round expectations.
                </p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">DSA Skill Strengthening</p>
                <p className="text-sm leading-7 text-slate-300">
                  Strengthen classic placement topics like arrays, strings, trees, graphs, and dynamic programming with AI guidance on efficiency and edge cases.
                </p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Placement Preparation</p>
                <p className="text-sm leading-7 text-slate-300">
                  Prepare for campus and hiring rounds with structured prep, resume guidance, and practice that matches what companies ask for.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-24 border-t border-white/10 pt-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-12">Engineered Core Architectures</h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-sm">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="text-sm font-black text-white mb-1">Multi-Turn Active Dialogue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Don&apos;t just submit code. Respond to technical follow-up challenge queries dynamically with full conversational context memory retention.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-sm">
              <div className="text-2xl mb-3">📈</div>
              <h3 className="text-sm font-black text-white mb-1">Graphical Trend Metrics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track regression profiles using interactive linear graphs and matrix visualizations fed straight by persistent data clusters.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-sm">
              <div className="text-2xl mb-3">🧬</div>
              <h3 className="text-sm font-black text-white mb-1">Domain Multi-Track Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A unified preparation experience for interviews, resume checks, and coding progress tracking all in one dashboard.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-24 grid gap-10 grid-cols-1">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 shadow-xl shadow-black/20 backdrop-blur-sm">
            <h2 className="text-2xl font-black text-white mb-4">Interview, DSA Practice & Placement Preparation</h2>
            <p className="text-sm text-slate-300 leading-8 mb-6 max-w-2xl">
              PrepPath is designed for candidates who want a complete placement-ready journey. Practice mock interviews, sharpen DSA skills, and polish your preparation for real placement rounds.
            </p>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl bg-slate-950/40 p-5 border border-white/5">
                <p className="font-bold text-white mb-2">Interview Practice</p>
                <p>Build confidence with realistic mock interviews, answer coaching, and interview feedback tailored to placement round expectations.</p>
              </div>
              <div className="rounded-2xl bg-slate-950/40 p-5 border border-white/5">
                <p className="font-bold text-white mb-2">DSA Practice</p>
                <p>Strengthen classic placement topics like arrays, strings, trees, graphs, and dynamic programming with AI guidance on efficiency and edge cases.</p>
              </div>
              <div className="rounded-2xl bg-slate-950/40 p-5 border border-white/5">
                <p className="font-bold text-white mb-2">Placement Preparation</p>
                <p>Get ready for campus and hiring rounds with structured prep, resume guidance, and practice that matches what companies ask for.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30 backdrop-blur-lg">
            <h2 className="text-2xl font-black text-white mb-4">Contact Us</h2>
            <p className="text-sm text-slate-400 leading-7 mb-8">
              Reach out with your preparation goals, project ideas, or questions about PrepPath. Your message is stored securely and our team will follow up soon.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Name
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Email
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Subject
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  placeholder="What would you like to discuss?"
                />
              </label>

              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Message
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="mt-2 h-36 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 resize-none"
                  placeholder="Tell us about your preparation goals or questions."
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitStatus === "sending"}
              >
                {submitStatus === "sending" ? "Sending..." : "Send Message"}
              </button>

              {submitMessage ? (
                <p className={`text-sm ${submitStatus === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {submitMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>

      {/* Small Footer Block */}
      <footer className="border-t border-white/5 py-8 text-center text-xs font-mono text-slate-600 relative z-10">
        © 2026 PrepPath Placement Prep Platform. All rights reserved.
      </footer>
    </div>
  );
}