"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait until NextAuth finishes checking for an active session cookie
    if (status === "loading") return;

    if (session) {
      // User is authenticated! Move them directly into the workspace dashboard
      router.push("/dashboard");
    } else {
      // User is unauthenticated! Move them directly to the login interface
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="rounded-full border border-cyan-200/80 bg-white/80 px-5 py-3 text-sm font-semibold tracking-widest text-slate-600 shadow-[0_18px_70px_-28px_rgba(14,116,144,0.75)] backdrop-blur animate-pulse">
        INITIALIZING INTERVAI SECURE ROUTER...
      </p>
    </div>
  );
}
