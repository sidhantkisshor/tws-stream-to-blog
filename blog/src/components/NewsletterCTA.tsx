"use client";

import { useState } from "react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're in! We'll send you new post alerts.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-deep-slate/8 bg-surface px-6 py-7 shadow-[0_1px_12px_rgba(44,53,57,0.04)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-burnt-amber/3" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-wealth-teal/3" />
      <div className="relative">
        <p className="text-lg font-bold text-deep-slate">Get post alerts in your inbox.</p>
        <p className="mt-1 text-sm text-deep-slate/50">
          New blog post? We&apos;ll email you. No spam, unsubscribe anytime.
        </p>
        {status === "success" ? (
          <p className="mt-4 text-sm font-medium text-wealth-teal">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-lg border border-deep-slate/10 bg-warm-white px-4 py-2.5 text-sm text-deep-slate placeholder:text-deep-slate/30 focus:border-wealth-teal/40 focus:outline-none focus:ring-2 focus:ring-wealth-teal/10"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-wealth-teal px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(10,141,122,0.25)] transition-all hover:bg-wealth-teal/90 hover:shadow-[0_4px_12px_rgba(10,141,122,0.3)] disabled:opacity-60"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
