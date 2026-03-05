"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-deep-slate/10 bg-warm-white/90 shadow-[0_1px_12px_rgba(44,53,57,0.04)] backdrop-blur-md"
          : "bg-warm-white/80 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 no-underline hover:no-underline"
        >
          <Image
            src="/logo-icon.png"
            alt="TWSGurukulX"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold tracking-tight text-deep-slate transition-colors group-hover:text-burnt-amber">
              TWS
            </span>
            <span className="font-instrument text-xl text-burnt-amber transition-colors group-hover:text-deep-slate">
              GurukulX
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/about"
            className={`text-sm no-underline transition-colors ${
              pathname === "/about"
                ? "font-medium text-deep-slate"
                : "text-deep-slate/60 hover:text-deep-slate"
            }`}
          >
            About
          </Link>
          <a
            href="https://wa.me/918062963333"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-wealth-teal/20 bg-wealth-teal/5 px-4 py-1.5 text-sm font-medium text-wealth-teal no-underline transition-all hover:border-wealth-teal/40 hover:bg-wealth-teal/10 hover:shadow-[0_2px_8px_rgba(10,141,122,0.12)]"
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
          <span
            className={`block h-0.5 w-6 bg-deep-slate transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-deep-slate transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-deep-slate transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-deep-slate/10 bg-warm-white transition-all duration-300 sm:hidden ${
          open ? "max-h-40 opacity-100" : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-4 py-4">
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
    </header>
  );
}
