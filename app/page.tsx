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
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans text-xs tracking-widest text-muted-foreground uppercase">
        Verifying Connection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary overflow-x-hidden relative">
      
      {/* Editorial Decorative Grid Lines (Pure CSS Subtle Artistry) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-[0.25] dark:opacity-[0.15]">
        <div className="absolute left-[10%] top-0 h-full w-[1px] bg-border" />
        <div className="absolute left-[50%] top-0 h-full w-[1px] bg-border" />
        <div className="absolute left-[90%] top-0 h-full w-[1px] bg-border" />
      </div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-foreground">
              PrepPath
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/login")}
              className="text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground transition duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/register")}
              className="btn-primary text-xs uppercase tracking-wider px-5 py-2.5"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="mx-auto max-w-7xl px-6 md:px-8 pt-16 md:pt-24 pb-20 relative z-10">
        
        {/* Intro Badge & Bold Serif Title */}
        <section className="text-center max-w-4xl mx-auto space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>Placement Prep Platform Live</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] text-balance">
            Ace Your Placements With <span className="text-primary italic">AI Mock Interviews</span> & ATS Auditing
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            PrepPath helps you build placement readiness. Evaluate resume ATS scoring, practice curated coding questions with real-time feedback, and take high-stakes simulated AI mock interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto btn-primary text-xs uppercase tracking-wider px-8 py-4 font-bold shadow-sm"
            >
              Start Preparing Now
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto btn-secondary text-xs uppercase tracking-wider px-8 py-4 font-bold"
            >
              Enter Dashboard
            </button>
          </div>
        </section>

        {/* Brand Core Pillars Section (Sophisticated Asymmetrical Grid) */}
        <section className="border-t border-border pt-16 mb-24 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase font-mono">01 / Services</p>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-foreground">
              What You Get
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We design state-of-the-art diagnostic interfaces to pinpoint development goals for high-stakes placement rounds.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="group border border-border bg-card p-8 rounded-lg hover:border-primary/40 transition duration-300">
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary font-mono mb-2">Interviews & Feedback</p>
              <h3 className="text-lg font-bold text-foreground mb-2">Interview Practice</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Build confidence with realistic mock interviews, answer coaching, and feedback tailored to placement round expectations.
              </p>
            </div>

            <div className="group border border-border bg-card p-8 rounded-lg hover:border-primary/40 transition duration-300">
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary font-mono mb-2">Algorithm Evaluation</p>
              <h3 className="text-lg font-bold text-foreground mb-2">DSA Skill Strengthening</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Strengthen classic placement topics like arrays, strings, trees, graphs, and dynamic programming with AI guidance on efficiency and edge cases.
              </p>
            </div>

            <div className="group border border-border bg-card p-8 rounded-lg hover:border-primary/40 transition duration-300">
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary font-mono mb-2">End-to-End Readiness</p>
              <h3 className="text-lg font-bold text-foreground mb-2">Placement Preparation</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Prepare for campus and hiring rounds with structured prep, resume guidance, and practice that matches what companies ask for.
              </p>
            </div>
          </div>
        </section>

        {/* Engineered Architecture Grid */}
        <section className="border-t border-border pt-16 mb-24">
          <div className="mb-12 space-y-2">
            <p className="text-[10px] font-bold tracking-widest text-primary uppercase font-mono">02 / Architecture</p>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-foreground">
              Engineered Core Architectures
            </h2>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="border border-border bg-card p-8 rounded-lg">
              <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center text-primary mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Multi-Turn Active Dialogue</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Don&apos;t just submit code. Respond to technical follow-up challenge queries dynamically with full conversational context memory retention.
              </p>
            </div>

            <div className="border border-border bg-card p-8 rounded-lg">
              <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center text-primary mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Graphical Trend Metrics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track regression profiles using interactive linear graphs and matrix visualizations fed straight by persistent data clusters.
              </p>
            </div>

            <div className="border border-border bg-card p-8 rounded-lg">
              <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center text-primary mb-6">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">Domain Multi-Track Hub</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A unified preparation experience for interviews, resume checks, and coding progress tracking all in one dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Services list and Contact form split */}
        <section className="border-t border-border pt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Mission Description */}
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold tracking-widest text-primary uppercase font-mono">03 / Mission</p>
              <h2 className="font-serif text-3xl font-extrabold tracking-tight text-foreground">
                Interview, DSA Practice & Placement Preparation
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-balance">
              PrepPath is designed for candidates who want a complete placement-ready journey. Practice mock interviews, sharpen DSA skills, and polish your preparation for real placement rounds.
            </p>
            <div className="space-y-4 border-l-2 border-border pl-6">
              <div>
                <p className="font-bold text-foreground text-sm">Interview Practice</p>
                <p className="text-xs text-muted-foreground mt-1">Build confidence with realistic mock interviews, answer coaching, and interview feedback tailored to placement round expectations.</p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">DSA Practice</p>
                <p className="text-xs text-muted-foreground mt-1">Strengthen classic placement topics like arrays, strings, trees, graphs, and dynamic programming with AI guidance on efficiency and edge cases.</p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Placement Preparation</p>
                <p className="text-xs text-muted-foreground mt-1">Get ready for campus and hiring rounds with structured prep, resume guidance, and practice that matches what companies ask for.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="border border-border bg-card p-8 rounded-lg">
            <h2 className="font-serif text-2xl font-extrabold text-foreground mb-2">Contact Us</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Reach out with your preparation goals, project ideas, or questions about PrepPath. Your message is stored securely and our team will follow up soon.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="h-32 w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Tell us about your preparation goals or questions."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs uppercase tracking-wider py-3"
                disabled={submitStatus === "sending"}
              >
                {submitStatus === "sending" ? "Sending..." : "Send Message"}
              </button>

              {submitMessage ? (
                <p className={`text-xs font-bold text-center mt-2 ${submitStatus === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {submitMessage}
                </p>
              ) : null}
            </form>
          </div>
        </section>

      </main>

      {/* Small Footer Block */}
      <footer className="border-t border-border py-10 text-center text-[10px] tracking-wider font-mono text-muted-foreground uppercase">
        © 2026 PrepPath Placement Prep Platform. All rights reserved.
      </footer>
    </div>
  );
}
