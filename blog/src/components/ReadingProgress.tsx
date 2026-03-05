"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) {
        setProgress(Math.min(window.scrollY / scrollable, 1));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-60 h-[3px] transition-opacity duration-300"
      style={{
        width: `${progress * 100}%`,
        opacity: progress > 0 ? 1 : 0,
        background: "linear-gradient(to right, var(--color-wealth-teal), var(--color-burnt-amber))",
      }}
    />
  );
}
