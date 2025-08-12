// app/verify-email/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;

    try {
      setStatus("sending");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${siteUrl}/post-login` },
      });
      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-[#0d0d0d] border border-gray-800 p-8 rounded-lg font-mono">
        <h1 className="text-3xl font-bold text-center mb-3">Verify your email</h1>
        <p className="text-gray-400 text-center mb-6">
          We’ve sent a verification link to your email. Click it, then come back and{" "}
          <Link href="/login" className="underline text-blue-400 hover:text-blue-300">log in</Link>.
        </p>

        <form onSubmit={handleResend} className="space-y-3">
          <label className="text-sm text-gray-400">Didn’t get the email? Resend it:</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 py-2 rounded"
          >
            {status === "sending" ? "Sending…" : "Resend verification email"}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {status === "sent" && (
            <p className="text-green-400 text-sm text-center">
              Sent! Check your inbox (and spam folder).
            </p>
          )}
        </form>

        <div className="text-center mt-6 text-gray-500 text-sm">
          Already verified?{" "}
          <Link href="/login" className="underline text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}