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
    };
  }, [open, close]);

  return (
    <>
      <figure className="my-4 cursor-pointer" onClick={() => setOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={300}
          height={169}
          className="rounded-lg border border-deep-slate/10 transition-opacity hover:opacity-80"
        />
        <figcaption className="mt-1.5 text-xs text-deep-slate/50">
          {alt} — click to expand
        </figcaption>
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <button
            ref={closeRef}
            onClick={close}
            className="absolute right-4 top-4 text-2xl text-white/70 hover:text-white"
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
