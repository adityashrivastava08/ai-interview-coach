"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const track = searchParams.get("track") || "mern"; 

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial Question from AI
  useEffect(() => {
    async function triggerInitialQuestion() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/interview/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track,
            messages: [{ role: "user", content: "Hello, I am ready for the interview." }]
          }),
        });
        const data = await res.json();
        if (data.text) {
          setMessages([{ role: "model", content: data.text }]);
        }
      } catch (err) {
        console.error("Failed to fetch initial question:", err);
      } finally {
        setIsLoading(false);
      }
    }
    triggerInitialQuestion();
  }, [track]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isSaving) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

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
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "🚨 [Connection Error] Interviewer ne connection kho diya." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

 const handleEndInterview = async () => {
    // Agar koi message nahi hai ya pehle se save ho raha hai, toh click rok do
    if (messages.length === 0 || isSaving) return;

    // 🔥 Alert hataya: Ab seedha saving state true hogi aur processing shuru
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, messages }),
      });

      if (res.ok) {
        // Database mein data jate hi direct redirect bina kisi alert ke
        window.location.replace("/dashboard");
      } else {
        const errorData = await res.json();
        console.error("Server Error:", errorData.error);
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Save Network Error:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            IntervAI Live Session
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Track: <span className="text-indigo-400 font-semibold">{track.replace("-", " ")}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEndInterview}
            disabled={isSaving || messages.length === 0}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-red-600/20"
          >
            {isSaving ? "Saving..." : "End Interview ⏹️"}
          </button>
          <div className="flex items-center space-x-2 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full text-red-400 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm backdrop-blur-md transition-all shadow-md ${
              msg.role === "user"
                ? "bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/30"
                : "bg-slate-900/80 text-slate-200 rounded-tl-none border border-slate-800/80"
            }`}>
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/80 border border-slate-800/80 text-slate-400 max-w-[80%] rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-md flex items-center space-x-2">
              <span className="text-xs italic animate-pulse">Interviewer is evaluating</span>
              <div className="flex space-x-1">
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer Input */}
      <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isSaving}
            placeholder={isLoading ? "Interviewer ke bolne ka wait karein..." : "Apna technical jawaab yahan type karein..."}
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-100 placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || isSaving || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40"
          >
            Send ➔
          </button>
        </div>
      </form>
    </div>
  );
}