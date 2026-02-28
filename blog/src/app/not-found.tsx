import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-prose flex-col items-center justify-center px-4 text-center">
      <p className="font-instrument text-8xl text-burnt-amber/20">404</p>
      <h1 className="mt-4 text-2xl font-bold text-deep-slate">
        Page not found
      </h1>
      <p className="mt-2 text-deep-slate/50">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-wealth-teal px-5 py-2.5 text-sm font-medium text-warm-white no-underline hover:bg-wealth-teal/90"
      >
        Back to home
      </Link>
    </main>
  );
}
