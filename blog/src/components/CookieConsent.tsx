"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    loadGTM?: () => void;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        const id = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(id);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing)
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem("cookie_consent", "accepted");
    } catch {}
    window.loadGTM?.();
    setVisible(false);
  }

  function reject() {
    try {
      localStorage.setItem("cookie_consent", "rejected");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-deep-slate/10 " +
        "bg-surface/90 backdrop-blur-md " +
        "transition-transform duration-500 ease-out " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:gap-4 sm:py-2.5">
        <p className="text-sm text-deep-slate/70 sm:flex-1">
          We use cookies for analytics to improve your experience.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={reject}
            className={
              "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium " +
              "bg-deep-slate/5 text-deep-slate/50 " +
              "transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/70"
            }
          >
            Reject
          </button>
          <button
            onClick={accept}
            className={
              "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium " +
              "bg-wealth-teal text-white " +
              "transition-colors hover:bg-wealth-teal/90"
            }
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
