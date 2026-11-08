"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect admin password. Please try again.");
        setLoading(false);
        return;
      }

      // Success -> navigate to dashboard
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      setError("An error occurred during authentication. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-between p-6 md:p-12 text-[#F6F2E6] font-sans selection:bg-[#2B59FF] selection:text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <Link href="/" className="font-serif text-xl text-[#F6F2E6] hover:opacity-70 transition-opacity">
          {siteConfig.brandName}
        </Link>
        <Link
          href="/"
          className="text-xs font-mono text-[var(--fg-muted)] hover:text-white transition-colors"
        >
          ← Return to site
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Cobalt Glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#2B59FF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#2B59FF] border border-[#2B59FF]/30 bg-[#2B59FF]/10 px-2.5 py-1 rounded-full">
                ● Restricted Access
              </span>
              <span className="font-mono text-xs text-[var(--fg-dim)]">Admin Portal</span>
            </div>

            <div>
              <h1 className="font-serif text-3xl text-[#F6F2E6] tracking-tight">
                Authentication
              </h1>
              <p className="font-sans text-xs md:text-sm text-[var(--fg-muted)] mt-2 leading-relaxed">
                Enter your administrative master password to manage portfolio photos, collections, and client enquiries.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/40 text-red-300 text-xs p-3.5 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--fg-dim)]">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    disabled={loading}
                    autoFocus
                    className="w-full bg-white/[0.05] border border-white/15 focus:border-[#2B59FF] text-[#F6F2E6] text-sm px-4 py-3 rounded-lg focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-dim)] hover:text-white transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#2B59FF] hover:bg-[#1f45d8] text-white text-sm font-sans font-medium py-3.5 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="font-mono text-[11px] text-[var(--fg-dim)]">
                Protected by environment variable <code className="text-white/60">ADMIN_PASSWORD</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center font-mono text-[11px] text-[var(--fg-dim)]">
        © {new Date().getFullYear()} {siteConfig.brandName} · All Rights Reserved
      </footer>
    </div>
  );
}
