"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PortalLoader } from "@/components/PortalLoader";

export default function RegisterPage() {
  const router = useRouter(); // Next.js tool used to transition between page URLs
  
  // useState hooks act as dynamic memory slots tracking input form text fields
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [animatingPortal, setAnimatingPortal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();       // Stop the browser from executing a default page refresh
    setErrorMessage("");      // Reset old validation alerts
    if (loading) return;      // Lock button interaction during processing
    setLoading(true);


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

      setAnimatingPortal(true);
      setTimeout(() => {
        router.push("/login");
      }, 1200);

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Registration failed.");
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
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground pt-2">Create account</h2>
            <p className="text-xs text-muted-foreground">Start practicing your technical interviews</p>
          </div>

          {/* Dynamic Error Container Box */}
          {errorMessage && (
            <div className="mb-5 rounded border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-600 dark:text-rose-455 whitespace-pre-wrap break-words font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Aditya Ranjan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

