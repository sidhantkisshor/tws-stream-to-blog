"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TOCProps {
  sections: { heading: string; label?: string }[];
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
      <nav aria-label="Contents" className="sticky top-24 hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
        <p className="label mb-3 text-mute">Contents</p>
        <ul className="space-y-3">
          {sections.map((section, i) => {
            const id = ids[i];
            const isActive = activeId === id;
            return (
              <li key={id}>
                <button
                  onClick={() => handleClick(id)}
                  className={`block w-full text-left text-sm leading-snug transition-colors duration-150 ${
                    isActive ? "font-medium text-hot-text" : "text-mute hover:text-ink"
                  }`}
                >
                  {section.label ?? section.heading}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile disclosure */}
      <div className="mb-8 border-y border-rule lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between py-3 text-[0.9375rem] font-medium text-ink"
          aria-expanded={mobileOpen}
        >
          <span>Contents</span>
          <svg
            className={`h-4 w-4 text-mute transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <ul className="space-y-2 pb-4">
            {sections.map((section, i) => {
              const id = ids[i];
              return (
                <li key={id}>
                  <button
                    onClick={() => handleClick(id)}
                    className={`block w-full text-left text-[0.9375rem] leading-snug ${
                      activeId === id ? "font-medium text-hot-text" : "text-body"
                    }`}
                  >
                    {section.label ?? section.heading}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
