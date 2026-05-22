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
    setErrorMessage("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email address or password.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed.");
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
            <p className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              IntervAI
            </p>
            <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-950">Welcome back</h2>
            <p className="text-sm text-slate-500">Sign in to continue practicing</p>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 whitespace-pre-wrap break-words">
              {errorMessage}
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Email Address
            </label>
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
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Password
            </label>
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-900">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
