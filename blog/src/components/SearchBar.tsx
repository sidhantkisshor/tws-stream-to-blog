"use client";

import { useState, useRef, useCallback } from "react";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(query);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const update = useCallback(
    (value: string) => {
      setLocal(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(value), 200);
    },
    [onChange]
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocal("");
    onChange("");
  }, [onChange]);

  return (
    <div className="relative mb-8">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-deep-slate/30"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx={11} cy={11} r={8} />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={local}
        onChange={(e) => update(e.target.value)}
        placeholder="Search posts..."
        className="w-full rounded-lg border border-deep-slate/10 bg-white px-4 py-2.5 pl-10 text-sm text-deep-slate outline-none transition-colors placeholder:text-deep-slate/30 focus:border-burnt-amber/40 focus:ring-1 focus:ring-burnt-amber/20"
      />
      {local && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-deep-slate/30 transition-colors hover:text-deep-slate/60"
          aria-label="Clear search"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
