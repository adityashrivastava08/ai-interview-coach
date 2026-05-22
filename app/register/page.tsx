"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter(); // Next.js tool used to transition between page URLs
  
  // useState hooks act as dynamic memory slots tracking input form text fields
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();       // Stop the browser from executing a default page refresh
    setErrorMessage("");      // Reset old validation alerts
    setLoading(true);         // Lock button interaction during processing

    try {
      // Execute an explicit HTTP network request down to our backend handler route
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Read response body data as plain raw text string characters first
      const textData = await response.text();

      // If the backend drops an issue (like a 404 or a database validation crash)
      if (!response.ok) {
        let displayError = "Registration failed.";
        try {
          // If the error response happens to be clean JSON data, grab the error string
          const jsonError = JSON.parse(textData);
          displayError = jsonError.error || displayError;
        } catch {
          // If the error response is an HTML webpage, print the explicit status code
          displayError = `Server returned an error status (${response.status}). Ensure app/api/register/route.ts exists.`;
        }
        throw new Error(displayError);
      }

      router.push("/login");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-[0_28px_90px_-38px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="h-2 bg-[linear-gradient(90deg,#0f766e,#06b6d4,#fb7185,#f59e0b)]" />
        <div className="p-6 sm:p-8">
          <div className="mb-7 text-center">
            <p className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              IntervAI
            </p>
            <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-950">Create your account</h2>
            <p className="text-sm text-slate-500">Start practicing your technical interviews</p>
          </div>

        {/* Dynamic Error Container Box */}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap break-words">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Full Name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-cyan-100 bg-cyan-50/50 px-3 py-2.5 text-sm text-slate-950 shadow-inner shadow-cyan-100/40 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="Aditya Ranjan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Email Address</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-cyan-100 bg-cyan-50/50 px-3 py-2.5 text-sm text-slate-950 shadow-inner shadow-cyan-100/40 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-cyan-100 bg-cyan-50/50 px-3 py-2.5 text-sm text-slate-950 shadow-inner shadow-cyan-100/40 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-lg bg-teal-700 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
