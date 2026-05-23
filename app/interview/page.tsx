"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InterviewWorkspace() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentQuestion] = useState(
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice."
  );
  const [userCode, setUserCode] = useState(`public int[] twoSum(int[] nums, int target) {\n    // Write your Java code here\n    return new int[] {};\n}`);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Establishing secure analytics record... Please wait." }
  ]);
  const [textReply, setTextReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);

  const feedBottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll down when new chat text displays
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
          body: JSON.stringify({ email: session.user.email, topic: "Java & DSA" })
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
  }, [status, session]);

  if (status === "loading") return <div className="flex min-h-screen items-center justify-center px-4 font-mono text-sm font-semibold tracking-widest text-slate-600">LOADING WORKSPACE...</div>;
  if (!session) { router.push("/login"); return null; }

  // REUSABLE UNIFIED NETWORK TRANSACTION HANDLER
  const executePipelineQuery = async (currentUserInputText: string, standardCodePayload: string) => {
    if (loading) return;
    setLoading(true);

    // Append the user's input to the chat log local array state
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Upper Navigation Header Ribbon */}
      <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-cyan-300/15 bg-slate-950/95 px-4 py-3 shadow-2xl shadow-cyan-950/30 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-black tracking-wide text-white">IntervAI Technical Playground</span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">Topic: Java & DSA</span>
        </div>
        <button onClick={() => router.push("/dashboard")} className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-300/10 hover:text-white">
          Close Session
        </button>
      </header>

      {/* Main Split Screen Framework Body */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        
        {/* Left Column Stack: Problem Box & Floating Feed Box */}
        <div className="flex min-h-0 flex-1 flex-col border-b border-cyan-300/15 bg-slate-900/70 lg:w-1/2 lg:border-b-0 lg:border-r">
          <div className="max-h-[30vh] overflow-y-auto border-b border-cyan-300/15 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(15,23,42,0.2),rgba(245,158,11,0.1))] p-4 sm:p-6">
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-cyan-200/70">Active Problem Prompt</span>
            <h3 className="mb-3 text-lg font-bold text-white">Two Sum Indices</h3>
            <p className="rounded-lg border border-white/10 bg-slate-950/70 p-4 font-mono text-sm leading-relaxed text-slate-200 shadow-inner shadow-cyan-950/30">
              {currentQuestion}
            </p>
          </div>

          {/* Interactive Scrollable Feed Bubble Display Area */}
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

          {/* NEW CRITICAL FEATURE: Floating Text Chat Input Dialogue Console Deck */}
          <form onSubmit={handleTextChatSubmit} className="border-t border-cyan-300/15 bg-slate-950 p-4 flex gap-2 shrink-0">
            <input
              type="text"
              value={textReply}
              onChange={(e) => setTextReply(e.target.value)}
              placeholder="Reply to the interviewer's follow-up challenge question..."
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !textReply.trim()}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 text-xs font-bold text-slate-950 transition disabled:opacity-30 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>

        {/* Right Panel: Code Sandbox Editor Area */}
        <div className="flex min-h-0 flex-1 flex-col bg-slate-950 lg:w-1/2">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-violet-300/15 bg-violet-300/10 px-4">
            <span className="font-mono text-xs text-violet-100">Solution.java</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <form onSubmit={handleCodeSubmit} className="flex-1 flex flex-col overflow-hidden">
            <textarea
              aria-label="Code Editor"
              className="w-full flex-1 resize-none bg-slate-950 p-4 font-mono text-sm leading-relaxed text-cyan-50 outline-none selection:bg-cyan-700/50 sm:p-6"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck="false"
            />

            <div className="flex shrink-0 items-center justify-end border-t border-white/10 bg-slate-900/90 p-4">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer rounded-lg bg-amber-300 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-950/25 transition hover:bg-amber-200 disabled:opacity-40"
              >
                {loading ? "Evaluating Code..." : "Submit Answer"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}