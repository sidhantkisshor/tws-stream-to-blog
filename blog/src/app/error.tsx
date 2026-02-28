"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-prose flex-col items-center justify-center px-4 text-center">
      <p className="font-instrument text-6xl text-burnt-amber/20">Oops</p>
      <h1 className="mt-4 text-2xl font-bold text-deep-slate">
        Something went wrong
      </h1>
      <p className="mt-2 text-deep-slate/50">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 cursor-pointer rounded-lg bg-wealth-teal px-5 py-2.5 text-sm font-medium text-warm-white hover:bg-wealth-teal/90"
      >
        Try again
      </button>
    </main>
  );
}
