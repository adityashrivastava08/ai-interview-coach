"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/Avatar";

interface Message {
  role: "user" | "model";
  content: string;
}

function InterviewContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "",
    avatarUrl: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (response.ok && data.success && data.profile) {
          setProfile({
            name: data.profile.name || "",
            avatarUrl: data.profile.avatarUrl || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile on interview simulator:", err);
      }
    }
    fetchProfile();
  }, []);
  
  // URL parameters from Mock Interview Setup tab
  const interviewId = searchParams.get("id");
  const track = searchParams.get("track") || "mern";
  const difficulty = searchParams.get("difficulty") || "medium";
  const duration = parseInt(searchParams.get("duration") || "30", 10);
  const company = searchParams.get("company") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mic, Camera & Voice mute state toggles
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);

  // Active question counter
  const [questionIndex, setQuestionIndex] = useState(1);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Countdown Timer tick
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndInterview();
      return;
    }
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // 🔊 WEB SPEECH API SYNTHESIZER UTILITY
  // ==========================================
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Clear ongoing speech
      window.speechSynthesis.cancel();

      if (voiceMuted) return;

      const cleanedText = text
        .replace(/`{3}[\s\S]*?`{3}/g, "[code snippet omitted]") // Don't read raw code blocks
        .replace(/`.*?`/g, "") // Don't read inline code backticks
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 0.95; // Slightly slower, professional pace
      utterance.pitch = 1.0;

      // Filter for standard English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.includes("en-"));
      if (engVoice) {
        utterance.voice = engVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Initial Question from AI
  useEffect(() => {
    async function triggerInitialQuestion() {
      setIsLoading(true);
      try {
        const welcomeMessage = company 
          ? `Hello, I am ready for the ${company} mock interview.` 
          : "Hello, I am ready for the interview.";

        const res = await fetch("/api/interview/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track,
            messages: [{ role: "user", content: welcomeMessage }]
          }),
        });
        const data = await res.json();
        if (data.text) {
          setMessages([{ role: "model", content: data.text }]);
          speakText(data.text);
        }
      } catch (err) {
        console.error("Failed to fetch initial question:", err);
        const welcomeFallback = "👋 Welcome! Let's begin the interview. Can you introduce yourself and tell me about a technical project you completed recently?";
        setMessages([
          { role: "model", content: welcomeFallback }
        ]);
        speakText(welcomeFallback);
      } finally {
        setIsLoading(false);
      }
    }
    triggerInitialQuestion();
    
    // Stop voice output if page is unloaded
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [track, company]);

  // Send answer
  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isSaving) return;

    // Stop speaking user responses or pre-existing questions
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setQuestionIndex((prev) => prev + 1);

    try {
      const backendMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: backendMessages, track }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
        speakText(data.text);
      } else {
        throw new Error(data.error || "Connection error");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errFallback = "🚨 [Evaluation Connection Interrupted] Please verify your network and input your response again.";
      setMessages((prev) => [
        ...prev,
        { role: "model", content: errFallback }
      ]);
      speakText(errFallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Skip question
  const handleSkipQuestion = async () => {
    if (isLoading || isSaving) return;
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setInput("");
    setIsLoading(true);
    setQuestionIndex((prev) => prev + 1);

    const skipMessage: Message = { role: "user", content: "[Skipped Question]" };
    const updatedMessages = [...messages, skipMessage];
    setMessages(updatedMessages);

    try {
      const backendMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: backendMessages, track }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setMessages((prev) => [...prev, { role: "model", content: data.text }]);
        speakText(data.text);
      } else {
        throw new Error();
      }
    } catch {
      const skipFallback = "Can you respond to the next concept or question?";
      setMessages((prev) => [...prev, { role: "model", content: skipFallback }]);
      speakText(skipFallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete and save interview
  const handleEndInterview = async () => {
    if (messages.length === 0 || isSaving) return;

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSaving(true);
    
    try {
      const res = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, messages }),
      });

      if (res.ok) {
        window.location.replace("/dashboard");
      } else {
        const errorData = await res.json();
        console.error("Server Save Error:", errorData.error);
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Save Network Error:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-[#0f172a] dark:text-[#f1f5f9] font-sans p-4 md:p-8 flex flex-col justify-between">
      
      {/* =========================================================
          ⚡ ATTRACTIVE TRANSPARENT GLASSMORPHIC HEADER PANEL
         ========================================================= */}
      <header className="sticky top-0 z-50 px-4 md:px-8 py-4 bg-slate-50/40 dark:bg-[#0f172a]/40 border-b border-slate-200/50 dark:border-[#334155]/30 backdrop-blur-xl transition-all duration-300 rounded-3xl mb-6">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
              PrepPath Live Simulator
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
              Track: <span className="text-blue-600 dark:text-blue-400 font-bold">{track.replace("-", " ").toUpperCase()}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold font-mono bg-white/50 dark:bg-slate-850 px-3.5 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span id="interview-timer">{formatTime(timeLeft)}</span>
            </div>

            <div className="live-indicator text-[10px] font-bold font-mono bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 rounded-xl text-red-500">
              LIVE
            </div>

            {session && (
              <div className="flex items-center gap-2 p-1 rounded-xl border border-slate-200/50 dark:border-[#334155]/30 bg-white/50 dark:bg-[#1e293b]/50">
                <UserAvatar avatarUrl={profile.avatarUrl} name={profile.name || session.user?.name || ""} className="h-7 w-7 rounded-lg" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-2 hidden sm:inline">
                  {profile.name || session.user?.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main split grid layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-6">
        
        {/* Left Section: Video / AI Screen */}
        <section className="card p-6 flex flex-col justify-between bg-white dark:bg-[#1e293b]">
          
          <div className="flex-1 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] p-8 relative overflow-hidden min-h-[300px]">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[40px]" />
            
            <div className="text-center relative z-10 w-full">
              {/* Interviewer avatar */}
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 border-4 border-white dark:border-slate-800">
                <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">AI Interviewer Portal</h3>
              <p className="text-xs text-slate-400 capitalize font-mono mt-1">{difficulty} round parameters active</p>

              {/* Volume voice control indicator */}
              <button
                type="button"
                onClick={() => {
                  const newMute = !voiceMuted;
                  setVoiceMuted(newMute);
                  if (newMute && typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  } else if (!newMute && messages.length > 0) {
                    const lastModelMsg = [...messages].reverse().find(m => m.role === "model");
                    if (lastModelMsg) speakText(lastModelMsg.content);
                  }
                }}
                className={`mt-5 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono transition-all flex items-center gap-1.5 mx-auto cursor-pointer ${
                  voiceMuted
                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                    : "bg-blue-500/10 border-blue-500/25 text-blue-650 dark:text-blue-400 hover:bg-blue-500/20"
                }`}
              >
                {voiceMuted ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    Speech Synth: Muted
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 animate-pulse text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Speech Synth: Speaking
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action media toggles & Save */}
          <div className="mt-4 flex justify-between items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  micActive 
                    ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100" 
                    : "bg-red-500/15 border-red-500/20 text-red-500 hover:bg-red-500/20"
                }`}
                title="Toggle Microphone"
              >
                {micActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                )}
              </button>

              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  cameraActive 
                    ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100" 
                    : "bg-red-500/15 border-red-500/20 text-red-500 hover:bg-red-500/20"
                }`}
                title="Toggle Web Camera"
              >
                {cameraActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                )}
              </button>
            </div>

            <button
              onClick={handleEndInterview}
              disabled={isSaving || messages.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/10"
            >
              {isSaving ? "Evaluating Session..." : "End & Evaluate Interview ⏹️"}
            </button>
          </div>

        </section>

        {/* Right Section: Active Question Dialogue & Text Response */}
        <section className="card p-6 flex flex-col justify-between bg-white dark:bg-[#1e293b]">
          
          <div className="mb-4">
            <span className="text-[10px] font-bold font-mono tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-xl">
              Turn Sequence: Question {questionIndex}
            </span>
          </div>

          {/* Dialogue Log area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-3 scrollbar-thin max-h-[350px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-100 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-none font-semibold"
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-[#0f172a] text-slate-400 max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3.5 text-xs shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <span className="italic font-mono text-[10px] animate-pulse">AI Interviewer is formulating question</span>
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Response formulation text editor */}
          <form onSubmit={handleSendAnswer} className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isSaving}
              rows={4}
              placeholder={isLoading ? "Please wait for the interviewer..." : "Type your technical explanation or logic reply here..."}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
            
            <div className="mt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isLoading || isSaving}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Skip Question
              </button>
              
              <button
                type="submit"
                disabled={isLoading || isSaving || !input.trim()}
                className="btn-primary text-xs px-5 py-2 cursor-pointer disabled:opacity-40"
              >
                Submit Answer ➔
              </button>
            </div>
          </form>

        </section>

      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] font-mono text-slate-400 dark:text-slate-500 py-3 border-t border-slate-200 dark:border-slate-850">
        © 2026 PrepPath placement simulation sandbox. Evaluate securely.
      </footer>

    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0f172a] font-mono text-xs tracking-widest text-slate-400">
        LOADING ACTIVE SIMULATOR...
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}