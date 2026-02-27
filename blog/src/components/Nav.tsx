"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-deep-slate/10 bg-warm-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-instrument text-2xl text-burnt-amber no-underline hover:no-underline"
        >
          TWSGurukulX
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link href="/about" className="text-sm text-deep-slate/70 hover:text-deep-slate no-underline">
            About
          </Link>
          <a
            href="https://wa.me/918062963333"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-wealth-teal/10 px-4 py-1.5 text-sm font-medium text-wealth-teal no-underline hover:bg-wealth-teal/20"
          >
            Join WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`block h-0.5 w-6 bg-deep-slate transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-deep-slate transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-deep-slate transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-deep-slate/10 bg-warm-white px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-sm text-deep-slate/70 no-underline"
            >
              About
            </Link>
            <a
              href="https://wa.me/918062963333"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-wealth-teal no-underline"
            >
              Join WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
