"use client";

import { Shout } from "@/components/Shout";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="px-[var(--gutter)] pb-24 pt-6 md:pt-10">
      <Shout as="h1" text="Stopped out" hot="last" />
      <p className="mt-6 max-w-[40ch] text-xl leading-snug text-ink">
        Something went wrong on our side. Please try again.
      </p>
      <button onClick={reset} className="btn mt-7 cursor-pointer">
        Try again
      </button>
    </main>
  );
}
