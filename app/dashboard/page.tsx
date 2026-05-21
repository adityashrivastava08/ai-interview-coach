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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400 text-sm tracking-widest animate-pulse">LOADING WORKSPACE...</p>
      </div>
    );
  }

  // 3. SECURITY GUARD: If no active session exists, kick the user out to the login page immediately
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation Header bar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0">
        <h1 className="text-xl font-bold tracking-wider text-zinc-100">IntervAI Workspace</h1>
        <div className="flex items-center gap-4">
          {/* Displaying the authenticated user email from our session token metadata */}
          <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
            👤 {session.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })} // Clears the browser session token and moves to login
            className="bg-zinc-800 hover:bg-red-950/40 hover:text-red-400 border border-zinc-700 hover:border-red-900 text-zinc-300 text-xs font-medium px-4 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Main Dashboard Content Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center items-center text-center">
        <div className="max-w-xl border border-zinc-800 bg-zinc-950 p-10 rounded-2xl shadow-2xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto text-xl shadow-inner">
            🚀
          </div>
          {/* Greeting the user dynamically by their real name saved in your database */}
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-zinc-400">{session.user?.name || "Developer"}</span>!
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your AI technical preparation playground is ready. Soon we will connect your profile to our live AI coding panel to practice dynamic system-level engineering interviews.
          </p>
          <div className="pt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Session Status: Authenticated Securely
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}