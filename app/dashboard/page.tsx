"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  // 1. useSession() pulls the live logged-in user data out of the AuthProvider context
  const { data: session, status } = useSession();
  const router = useRouter();

  // 2. While NextAuth reads the encrypted cookie, display a clean loading text
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="rounded-full border border-cyan-200 bg-white/80 px-5 py-3 text-sm font-semibold tracking-widest text-slate-600 shadow-xl shadow-cyan-950/10 backdrop-blur animate-pulse">LOADING WORKSPACE...</p>
      </div>
    );
  }

  // 3. SECURITY GUARD: If no active session exists, kick the user out to the login page immediately
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Header bar */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/70 bg-white/75 px-4 py-4 shadow-sm shadow-cyan-950/5 backdrop-blur md:px-6">
        <h1 className="text-xl font-black tracking-tight text-slate-950">AI Placement Prep</h1>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
          {/* Displaying the authenticated user email from our session token metadata */}
          <span className="min-w-0 truncate rounded-full border border-cyan-100 bg-cyan-50/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-inner shadow-white">
            {session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })} // Clears the browser session token and moves to login
            className="cursor-pointer rounded-lg border border-rose-100 bg-white px-4 py-1.5 text-xs font-bold text-rose-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Main Dashboard Content Workspace */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-4 text-center sm:p-6 md:p-8">
        <div className="w-full max-w-2xl space-y-5 overflow-hidden rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_30px_110px_-48px_rgba(15,23,42,0.6)] backdrop-blur sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-xl text-teal-700 shadow-inner shadow-white">
            AI
          </div>
          {/* Greeting the user dynamically by their real name saved in your database */}
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, <span className="text-teal-700">{session.user?.name || "Developer"}</span>!
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Your AI technical preparation playground is ready. Soon we will connect your profile to our live AI coding panel to practice dynamic system-level engineering interviews.
          </p>
          <div className="pt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Session Status: Authenticated Securely
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
