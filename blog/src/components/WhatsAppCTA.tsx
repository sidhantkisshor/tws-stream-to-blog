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
      <div className="relative overflow-hidden rounded-xl border border-wealth-teal/15 bg-gradient-to-br from-wealth-teal/5 to-wealth-teal/10 px-6 py-8 text-center">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-wealth-teal/5" />
        <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-wealth-teal/5" />
        <p className="relative text-lg font-bold text-wealth-teal">
          You&apos;re in!
        </p>
        <p className="relative mt-1 text-sm text-wealth-teal/70">
          We&apos;ll WhatsApp you when new analysis drops.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-deep-slate/8 bg-white px-6 py-7 shadow-[0_1px_12px_rgba(44,53,57,0.04)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-burnt-amber/3" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-wealth-teal/3" />

      <div className="relative">
        <p className="text-lg font-bold text-deep-slate">
          Get notified when new analysis drops.
        </p>
        <p className="mt-1 text-sm text-deep-slate/50">
          Join via WhatsApp — no spam, just post alerts.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            aria-label="Country code"
            className="rounded-lg border border-deep-slate/12 bg-warm-white px-3 py-2.5 text-sm text-deep-slate transition-colors focus:border-wealth-teal focus:outline-none"
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
            className="flex-1 rounded-lg border border-deep-slate/12 bg-warm-white px-4 py-2.5 text-sm text-deep-slate placeholder:text-deep-slate/35 transition-colors focus:border-wealth-teal focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-wealth-teal px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(10,141,122,0.25)] transition-all hover:bg-wealth-teal/90 hover:shadow-[0_4px_12px_rgba(10,141,122,0.3)] disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Join"
            )}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2.5 text-sm text-red-600/80">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
