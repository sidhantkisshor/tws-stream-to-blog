"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SOCIAL } from "@/lib/site";
import { BrandLockup } from "@/components/BrandLockup";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onRouteChange = () => setOpen(false);
    onRouteChange();
  }, [pathname]);

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

  const themeIcon = dark ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-sheet">
      <nav className="flex h-[60px] items-center justify-between px-[var(--gutter)] md:h-[68px]">
        <Link href="/" className="group flex items-center gap-2 no-underline">
          {/* The only lockup above the fold, so this is the one instance that preloads. */}
          <BrandLockup size={28} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 sm:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[0.9375rem] no-underline transition-colors hover:text-ink ${
                pathname === link.href ? "font-medium text-ink" : "text-mute"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="text-mute transition-colors hover:text-ink"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {themeIcon}
            </button>
          )}
          <a href={SOCIAL.telegram} target="_blank" rel="noopener noreferrer" className="btn !py-2.5 !text-sm">
            Join Telegram
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 flex-col items-end justify-center gap-2 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`block h-0.5 w-7 bg-ink transition-transform duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-0.5 w-7 bg-ink transition-transform duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-rule bg-sheet px-[var(--gutter)] pb-6 pt-4 sm:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-instrument text-[2rem] leading-none text-ink no-underline"
              >
                {link.label}
              </Link>
            ))}
            <a href={SOCIAL.telegram} target="_blank" rel="noopener noreferrer" className="btn mt-2 w-fit">
              Join Telegram
            </a>
            {mounted && (
              <button onClick={toggleTheme} className="flex w-fit items-center gap-2 text-[0.9375rem] text-mute">
                {themeIcon}
                {dark ? "Light mode" : "Dark mode"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
