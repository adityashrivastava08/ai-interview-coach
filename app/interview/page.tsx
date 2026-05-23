"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InterviewWorkspace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL parameters se chosen track read karo (Default: Java & DSA)
  const currentTrack = searchParams.get("track") || "Java & DSA";

  // Dynamic Content & Code Template Repository Config
  const trackConfigurations: Record<string, { prompt: string; code: string; label: string; file: string }> = {
    "Java & DSA": {
      label: "Topic: Java & DSA",
      file: "Solution.java",
      prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      code: "public int[] twoSum(int[] nums, int target) {\n    // Write your Java code here\n    return new int[] {};\n}"
    },
    "MERN Full-Stack": {
      label: "Topic: MERN Full-Stack",
      file: "server.js",
      prompt: "Create a secure Express.js API endpoint router POST '/api/users/login' that validates an incoming email parameter, utilizes bcrypt to check password hashes from a MongoDB User collection schema, and signs a JWT access token if verification succeeds.",
      code: "const router = require('express').Router();\nconst bcrypt = require('bcrypt');\nconst jwt = require('jsonwebtoken');\nconst User = require('../models/User');\n\nrouter.post('/login', async (req, res) => {\n    // Implement secure MERN login authentication middleware\n});\n\nmodule.exports = router;"
    },
    "Android Development": {
      label: "Topic: Android Studio Core",
      file: "MainActivity.java",
      prompt: "Implement a lifecycle logging tracking block inside an Android Activity class. Override onCreate(), onStart(), and onResume() templates to pass unique tracking string triggers to Android Logcat console, and invoke an Explicit Intent routing flow to explicit secondary target class ProfileActivity.class.",
      code: "package com.example.intervai;\n\nimport android.content.Intent;\nimport android.os.Bundle;\nimport android.util.Log;\nimport androidx.appcompat.app.AppCompatActivity;\n\npublic class MainActivity extends AppCompatActivity {\n    // Implement Android lifecycle methods and explicit intents here\n}"
    }
  };

  const activeConfig = trackConfigurations[currentTrack] || trackConfigurations["Java & DSA"];

  // States initialized dynamically based on selected path
  const [currentQuestion] = useState(activeConfig.prompt);
  const [userCode, setUserCode] = useState(activeConfig.code);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Establishing secure analytics record... Please wait." }
  ]);
  const [textReply, setTextReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [reportCard, setReportCard] = useState<{ score: number; summary: string } | null>(null);

  const feedBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const initializeSessionDocument = async () => {
      try {
        const response = await fetch("/api/interview/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: session.user.email, 
            topic: currentTrack // Dynamic assignment written to MongoDB logs
          })
        });
        const data = await response.json();
        
        if (response.ok && data.interviewId) {
          setActiveInterviewId(data.interviewId);
          setChatMessages([
            { role: "ai", text: `Welcome Aditya! Secure session tracking verified. Review the problem prompt layout panel, structure your initial code method, and click submit whenever you are ready.` }
          ]);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setChatMessages([{ role: "ai", text: "⚠️ System Logging warning: Workspace running in sandbox mode." }]);
      }
    };

    initializeSessionDocument();
  }, [status, session, currentTrack]);

  if (status === "loading") return <div className="flex min-h-screen items-center justify-center px-4 font-mono text-sm font-semibold tracking-widest text-slate-600">LOADING WORKSPACE...</div>;
  if (!session) { router.push("/login"); return null; }

  const executePipelineQuery = async (currentUserInputText: string, standardCodePayload: string) => {
    if (loading || isEnding) return;
    setLoading(true);

    const updatedHistory = [...chatMessages, { role: "user", text: currentUserInputText }];
    setChatMessages(updatedHistory);

    try {
      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemPrompt: currentQuestion,
          userCode: standardCodePayload,
          chatHistory: updatedHistory,
          interviewId: activeInterviewId
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setChatMessages((prev) => [...prev, { role: "ai", text: data.text }]);

    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "ai", text: "🛑 System Connection Error: Unable to record dialogue snapshot entries." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executePipelineQuery("Code sandbox solution profile submitted for analysis.", userCode);
  };

  const handleTextChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textReply.trim()) return;
    const cleanText = textReply;
    setTextReply("");
    executePipelineQuery(cleanText, "");
  };

  const handleEndSession = async () => {
    if (!activeInterviewId || chatMessages.length < 2) {
      router.push("/dashboard");
      return;
    }

    setIsEnding(true);

    try {
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: activeInterviewId,
          chatHistory: chatMessages
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setReportCard({
        score: data.finalScore,
        summary: data.feedbackSummary
      });

    } catch (err) {
      alert("Failed to compute performance analytics. Returning safely to controller deck.");
      router.push("/dashboard");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 relative">
      
      {/* Upper Navigation Header Ribbon */}
      <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-cyan-300/15 bg-slate-950/95 px-4 py-3 shadow-2xl shadow-cyan-950/30 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-black tracking-wide text-white">IntervAI Technical Playground</span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
            {activeConfig.label}
          </span>
        </div>
        <button 
          onClick={handleEndSession} 
          disabled={isEnding}
          className="cursor-pointer rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-1.5 text-xs font-black text-rose-300 transition hover:bg-rose-500 hover:text-white disabled:opacity-40"
        >
          {isEnding ? "Compiling Metrics..." : "✕ End Session & Grade"}
        </button>
      </header>

      {/* Main Split Screen Framework Body */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        
        {/* Left Column Stack: Problem Box & Floating Feed Box */}
        <div className="flex min-h-0 flex-1 flex-col border-b border-cyan-300/15 bg-slate-900/70 lg:w-1/2 lg:border-b-0 lg:border-r">
          <div className="max-h-[30vh] overflow-y-auto border-b border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(15,23,42,0.2),rgba(245,158,11,0.1))] p-4 sm:p-6">
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-cyan-200/70">Active Problem Prompt</span>
            <h3 className="mb-3 text-lg font-bold text-white">Interview Objective</h3>
            <p className="rounded-lg border border-white/10 bg-slate-950/70 p-4 font-mono text-sm leading-relaxed text-slate-200 shadow-inner shadow-cyan-950/30">
              {currentQuestion}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            <span className="block font-mono text-xs uppercase tracking-widest text-emerald-200/70">AI Feedback Evaluation Feed</span>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user" 
                    ? "border border-amber-200/20 bg-amber-300/15 text-amber-50 shadow-lg shadow-amber-950/10"
                    : "border border-cyan-200/15 bg-cyan-300/10 text-slate-100 shadow-lg shadow-cyan-950/20"
                }`}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block opacity-40 mb-1">
                    {msg.role === "user" ? "You" : "AI IntervAI"}
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={feedBottomRef} />
          </div>

          <form onSubmit={handleTextChatSubmit} className="border-t border-cyan-300/15 bg-slate-950 p-4 flex gap-2 shrink-0">
            <input
              type="text"
              value={textReply}
              onChange={(e) => setTextReply(e.target.value)}
              placeholder="Reply to the interviewer's follow-up challenge question..."
              disabled={loading || isEnding}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || isEnding || !textReply.trim()}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 text-xs font-bold text-slate-950 transition disabled:opacity-30 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Panel: Code Sandbox Editor Area */}
        <div className="flex min-h-0 flex-1 flex-col bg-slate-950 lg:w-1/2">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-violet-300/15 bg-violet-300/10 px-4">
            <span className="font-mono text-xs text-violet-100">{activeConfig.file}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <form onSubmit={handleCodeSubmit} className="flex-1 flex flex-col overflow-hidden">
            <textarea
              aria-label="Code Editor"
              className="w-full flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-relaxed text-cyan-50 outline-none selection:bg-cyan-700/50 sm:p-6"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck="false"
              disabled={isEnding}
            />

            <div className="flex shrink-0 items-center justify-end border-t border-white/10 bg-slate-900/90 p-4">
              <button
                type="submit"
                disabled={loading || isEnding}
                className="cursor-pointer rounded-lg bg-amber-300 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-950/25 transition hover:bg-amber-200 disabled:opacity-40"
              >
                {loading ? "Evaluating..." : "Submit Answer"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* NEW PREMIUM INTERACTIVE INTERVIEW REPORT CARD MODAL OVERLAY */}
      {reportCard && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-cyan-500/30 max-w-xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 max-h-[90vh] overflow-y-auto">
            <span className="block font-mono text-[10px] tracking-widest text-cyan-400 uppercase font-black text-center mb-1">Performance Audit Complete</span>
            <h2 className="text-2xl font-black text-white text-center mb-6">Simulation Evaluation Report</h2>
            
            <div className="flex flex-col items-center mb-6">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Assigned Readiness Score</span>
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-xl shadow-cyan-950">
                <span className="text-4xl font-black text-white font-mono">{reportCard.score}<span className="text-xs text-slate-500 font-normal">/10</span></span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 sm:p-5 mb-6 shadow-inner">
              <span className="block font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Bar Raiser Feedback Executive Summary</span>
              <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">{reportCard.summary}</p>
            </div>

            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-90 text-center block"
            >
              Return to Controller Deck Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}