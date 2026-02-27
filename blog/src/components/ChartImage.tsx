"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface ChartImageProps {
  src: string;
  alt: string;
}

export function ChartImage({ src, alt }: ChartImageProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open, close]);

  return (
    <>
      <figure
        ref={triggerRef}
        className="group my-5 cursor-pointer"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View full size: ${alt}`}
      >
        <div className="overflow-hidden rounded-lg border border-deep-slate/8 bg-deep-slate/3 transition-all duration-300 group-hover:border-deep-slate/15 group-hover:shadow-[0_4px_16px_rgba(44,53,57,0.08)]">
          <Image
            src={src}
            alt={alt}
            width={300}
            height={169}
            className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <figcaption className="mt-2 text-xs text-deep-slate/40 transition-colors group-hover:text-deep-slate/60">
          {alt} — click to expand
        </figcaption>
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-slate/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Full size chart: ${alt}`}
          style={{ animation: "reveal-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <button
            ref={closeRef}
            onClick={close}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={675}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
