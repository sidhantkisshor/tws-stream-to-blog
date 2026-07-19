"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nl-prompt-shown";
const TRIGGER_PROGRESS = 0.6;

type Status = "idle" | "loading" | "success" | "error";

export function ScrollNewsletterPrompt() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setClosed(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    function onScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = window.scrollY / scrollable;
      if (p >= TRIGGER_PROGRESS) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  async function handleSubmit(e: React.FormEvent) {
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
        setMessage("You're in. New post alerts inbound.");
        try {
          window.localStorage.setItem(STORAGE_KEY, "subscribed");
        } catch {
          /* ignore */
        }
        setTimeout(() => setClosed(true), 2200);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (!visible || closed) return null;

  return (
    <div
      role="dialog"
      aria-label="Subscribe to new post alerts"
      aria-live="polite"
      className="scroll-nl-prompt fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-deep-slate/10 bg-surface px-5 py-4 shadow-[0_8px_32px_rgba(44,53,57,0.18)] sm:left-auto sm:right-6 sm:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss subscribe prompt"
        className="absolute right-2 top-2 rounded p-1 text-deep-slate/40 transition-colors hover:text-deep-slate"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
      <p className="pr-6 text-sm font-bold text-deep-slate">
        Enjoying this? Get new posts in your inbox.
      </p>
      {status === "success" ? (
        <p className="mt-2 text-sm text-wealth-teal">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-lg border border-deep-slate/10 bg-warm-white px-3 py-2 text-sm text-deep-slate placeholder:text-deep-slate/30 focus:border-wealth-teal/40 focus:outline-none focus:ring-2 focus:ring-wealth-teal/10"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-wealth-teal px-4 py-2 text-sm font-bold text-white transition-all hover:bg-wealth-teal/90 disabled:opacity-60"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs text-deep-slate/45 underline-offset-2 hover:underline"
          >
            no thanks
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500">{message}</p>
      )}
    </div>
  );
}
