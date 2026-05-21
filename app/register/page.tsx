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
    <div className="flex min-h-screen items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-2">Create your account</h2>
        <p className="text-sm text-zinc-400 text-center mb-6">Start practicing your technical interviews</p>

        {/* Dynamic Error Container Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-950/50 border border-red-900 text-red-400 text-sm whitespace-pre-wrap break-words">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Aditya Ranjan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-black font-medium py-2 rounded-lg text-sm mt-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
