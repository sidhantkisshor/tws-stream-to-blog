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
    <div>
      <p className="font-instrument text-[2rem] leading-[1.1] text-ink">Get post alerts in your inbox.</p>
      <p className="mt-3 text-[1.0625rem] text-body">New blog post? We&apos;ll email you. No spam, unsubscribe anytime.</p>
      {status === "success" ? (
        <p className="mt-5 font-medium text-hot-text">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-wrap items-end gap-4">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="newsletter-email" className="label block text-mute">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-ink bg-transparent py-2 text-lg text-ink outline-none focus:border-hot-text"
            />
          </div>
          <button type="submit" disabled={status === "loading"} className="btn disabled:opacity-60">
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}
      {status === "error" && <p className="mt-2 text-sm text-hot-text">{message}</p>}
    </div>
  );
}
