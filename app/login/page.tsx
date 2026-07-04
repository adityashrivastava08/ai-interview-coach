"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { PortalLoader } from "@/components/PortalLoader";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [animatingPortal, setAnimatingPortal] = useState(false);

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

      // SUCCESS: Start loading animation sequence
      setAnimatingPortal(true);
      router.refresh();

      // 1.2-second high-impact loader sequence
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Login failed.");
      setLoading(false);
    }
  };

  if (animatingPortal) {
    return <PortalLoader />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-background text-foreground relative">
      {/* Editorial Gridlines */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-[0.25] dark:opacity-[0.15]">
        <div className="absolute left-[20%] top-0 h-full w-[1px] bg-border" />
        <div className="absolute right-[20%] top-0 h-full w-[1px] bg-border" />
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-350 hover:shadow-lg">
        <div className="h-1.5 bg-primary" />
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono bg-secondary px-3 py-1 rounded">
              PrepPath
            </span>
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground pt-2">Welcome back</h2>
            <p className="text-xs text-muted-foreground">Sign in to continue practicing</p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-600 dark:text-rose-450 whitespace-pre-wrap break-words font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full btn-primary text-xs uppercase tracking-wider py-3"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4 transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}