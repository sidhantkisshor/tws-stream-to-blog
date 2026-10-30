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
    <div className="relative mb-10 max-w-md">
      <label htmlFor="post-search" className="label block text-mute">
        Search posts
      </label>
      <input
        id="post-search"
        type="text"
        value={local}
        onChange={(e) => update(e.target.value)}
        className="w-full border-0 border-b border-ink bg-transparent py-2 pr-8 text-lg text-ink outline-none focus:border-hot-text"
      />
      {local && (
        <button
          onClick={clear}
          className="absolute bottom-2 right-0 p-1 text-mute transition-colors hover:text-ink"
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
