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
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <p className="text-zinc-400 text-sm tracking-widest animate-pulse">
        INITIALIZING INTERVAI SECURE ROUTER...
      </p>
    </div>
  );
}