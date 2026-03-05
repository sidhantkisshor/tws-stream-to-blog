"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TOCProps {
  sections: { heading: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TableOfContents({ sections }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ids = sections.map((s) => slugify(s.heading));
  const idsKey = ids.join(",");

  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    observerRef.current = observer;

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const handleClick = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    []
  );

  if (sections.length === 0) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto w-48 shrink-0">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-deep-slate/30">
          Contents
        </p>
        <ul className="space-y-1">
          {sections.map((section, i) => {
            const id = ids[i];
            const isActive = activeId === id;
            return (
              <li key={id}>
                <button
                  onClick={() => handleClick(id)}
                  className={`block w-full text-left border-l-2 pl-3 py-1 text-sm transition-colors duration-200 ${
                    isActive
                      ? "border-wealth-teal text-wealth-teal font-medium"
                      : "border-transparent text-deep-slate/40 hover:text-deep-slate/60 hover:border-deep-slate/20"
                  }`}
                >
                  {section.heading}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile collapsible */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-deep-slate/10 bg-white px-4 py-3 text-sm font-medium text-deep-slate/70"
          aria-expanded={mobileOpen}
        >
          <span>Table of Contents</span>
          <svg
            className={`h-4 w-4 text-deep-slate/40 transition-transform duration-200 ${
              mobileOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="mt-2 space-y-0.5 rounded-lg border border-deep-slate/10 bg-white p-3">
            {sections.map((section, i) => {
              const id = ids[i];
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => handleClick(id)}
                    className={`block w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-wealth-teal/8 text-wealth-teal font-medium"
                        : "text-deep-slate/50 hover:text-deep-slate/70 hover:bg-deep-slate/5"
                    }`}
                  >
                    {section.heading}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
