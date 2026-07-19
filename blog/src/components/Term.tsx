"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getTerm } from "@/lib/glossary";

export function Term({ id, label }: { id: string; label?: string }) {
  const term = getTerm(id);
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const display = label ?? term?.label ?? id;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!term) {
    return <span>{display}</span>;
  }

  return (
    <span ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        className="cursor-help border-b border-dotted border-wealth-teal/60 text-deep-slate hover:text-wealth-teal focus:outline-none focus:ring-2 focus:ring-wealth-teal/30 focus:rounded-sm"
      >
        {display}
      </button>
      {open && (
        <span
          id={popoverId}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-deep-slate/10 bg-surface px-4 py-3 text-left text-sm font-normal not-italic text-deep-slate/80 shadow-[0_8px_24px_rgba(44,53,57,0.15)]"
          style={{ display: "block" }}
        >
          <span className="block font-bold text-wealth-teal">{term.label}</span>
          <span className="mt-1 block leading-relaxed">{term.short}</span>
          {term.long && (
            <span className="mt-2 block text-xs text-deep-slate/55">
              {term.long}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
