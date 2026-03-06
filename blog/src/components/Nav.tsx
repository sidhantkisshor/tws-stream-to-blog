"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onRouteChange = () => setOpen(false);
    onRouteChange();
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const toggleTheme = useCallback(() => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [dark]);

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
          {mounted && (
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-deep-slate/50 transition-colors hover:text-deep-slate"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
          <Link
            href="/posts"
            className={`text-sm no-underline transition-colors ${
              pathname === "/posts"
                ? "font-medium text-deep-slate"
                : "text-deep-slate/60 hover:text-deep-slate"
            }`}
          >
            Posts
          </Link>
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
            href="https://t.me/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-wealth-teal/20 bg-wealth-teal/5 px-4 py-1.5 text-sm font-medium text-wealth-teal no-underline transition-all hover:border-wealth-teal/40 hover:bg-wealth-teal/10 hover:text-wealth-teal hover:no-underline hover:shadow-[0_2px_8px_rgba(10,141,122,0.12)]"
          >
            Join Telegram
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
            href="/posts"
            onClick={() => setOpen(false)}
            className="text-sm text-deep-slate/70 no-underline"
          >
            Posts
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="text-sm text-deep-slate/70 no-underline"
          >
            About
          </Link>
          <a
            href="https://t.me/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-wealth-teal no-underline"
          >
            Join Telegram
          </a>
          {mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm text-deep-slate/70 no-underline"
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              {dark ? "Light mode" : "Dark mode"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
