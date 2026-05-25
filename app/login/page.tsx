"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // double clicks ko disable karega runtime par

    setErrorMessage("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(), // automatic spacing aur casing issue khatam
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email address or password.");
      }

      // SUCCESS: Tokens aur authentication state ko fresh karo pehle
      router.refresh();

      // 100ms ka micro-task gap taaki browser cookies internally lock kar sake
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_28px_90px_-38px_rgba(0,0,0,0.8)] backdrop-blur">
        <div className="h-2 bg-[linear-gradient(90deg,#06b6d4,#3b82f6,#6366f1,#f59e0b)]" />
        <div className="p-6 sm:p-8">
          <div className="mb-7 text-center">
            <p className="mb-3 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 animate-pulse">
              IntervAI
            </p>
            <h2 className="mb-2 text-3xl font-black tracking-tight text-white">Welcome back</h2>
            <p className="text-sm text-slate-400">Sign in to continue practicing</p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400 whitespace-pre-wrap break-words">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white shadow-inner outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white shadow-inner outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full cursor-pointer rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:opacity-90 disabled:opacity-50 font-black uppercase tracking-wider"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-cyan-400 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}