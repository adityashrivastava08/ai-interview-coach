"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InterviewWorkspace() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mock data states for tracking interactive code and chats
  const [currentQuestion, setCurrentQuestion] = useState(
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice."
  );
  const [userCode, setUserCode] = useState(`public int[] twoSum(int[] nums, int target) {\n    // Write your Java code here\n    return new int[] {};\n}`);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Welcome Aditya! Let's start with a classic Data Structures problem. Look at the prompt on the left, draft your solution in the editor space, and click submit when you're ready." }
  ]);
  const [loading, setLoading] = useState(false);

  if (status === "loading") return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500">LOADING WORKSPACE...</div>;
  if (!session) { router.push("/login"); return null; }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulating API loading interaction
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "user", text: "Submitted code solution." },
        { role: "ai", text: "Analyzing code... Great layout structure. Can you explain your chosen approach's time complexity before we proceed to execution edge cases?" }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-screen bg-black text-zinc-100 flex flex-col font-sans overflow-hidden">
      {/* Upper Header Ribbon Bar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-wider text-white">IntervAI Technical Playground</span>
          <span className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-800 px-2.5 py-0.5 rounded">Topic: Java & DSA</span>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer">
          ✕ Close Session
        </button>
      </header>

      {/* Main Split Screen Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Prompt Display & Evaluation Feed */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col bg-zinc-950/20">
          <div className="p-6 border-b border-zinc-800 bg-zinc-950/40 max-h-[40vh] overflow-y-auto">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">Active Problem Prompt</span>
            <h3 className="text-lg font-semibold text-white mb-3">Two Sum Indices</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-mono bg-zinc-950 border border-zinc-900 p-4 rounded-lg">
              {currentQuestion}
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">AI Feedback Evaluation Feed</span>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-zinc-800 text-white border border-zinc-700" 
                    : "bg-zinc-900/80 text-zinc-200 border border-zinc-800"
                }`}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block opacity-40 mb-1">
                    {msg.role === "user" ? "You" : "AI IntervAI"}
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Code Sandbox Editor Area */}
        <div className="w-1/2 flex flex-col bg-zinc-950">
          <div className="h-10 bg-zinc-900/60 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
            <span className="text-xs font-mono text-zinc-400">Solution.java</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>

          <form onSubmit={handleCodeSubmit} className="flex-1 flex flex-col overflow-hidden">
            <textarea
              aria-label="Code Editor"
              className="flex-1 w-full p-6 bg-zinc-950 text-zinc-200 font-mono text-sm leading-relaxed focus:outline-none resize-none selection:bg-zinc-800"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck="false"
            />

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end items-center shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-6 py-2.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-md"
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