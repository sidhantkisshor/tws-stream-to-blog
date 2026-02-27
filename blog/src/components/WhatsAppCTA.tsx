"use client";

import { useState } from "react";

export function WhatsAppCTA() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, countryCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setPhone("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-wealth-teal/20 bg-wealth-teal/5 px-6 py-5 text-center">
        <p className="font-medium text-wealth-teal">
          You&apos;re in! We&apos;ll WhatsApp you when new analysis drops.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-deep-slate/10 bg-white px-6 py-6">
      <p className="mb-1 text-lg font-medium text-deep-slate">
        Get notified when new analysis drops.
      </p>
      <p className="mb-4 text-sm text-deep-slate/60">
        Join via WhatsApp — no spam, just post alerts.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          aria-label="Country code"
          className="rounded-lg border border-deep-slate/20 bg-warm-white px-3 py-2 text-sm text-deep-slate"
        >
          <option value="+91">+91</option>
          <option value="+1">+1</option>
          <option value="+44">+44</option>
          <option value="+971">+971</option>
          <option value="+65">+65</option>
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          placeholder="Phone number"
          aria-label="Phone number"
          required
          className="flex-1 rounded-lg border border-deep-slate/20 bg-warm-white px-4 py-2 text-sm text-deep-slate placeholder:text-deep-slate/40 focus:border-wealth-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-wealth-teal px-5 py-2 text-sm font-medium text-white hover:bg-wealth-teal/90 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
