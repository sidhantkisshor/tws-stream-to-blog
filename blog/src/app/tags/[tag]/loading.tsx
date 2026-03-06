export default function TagLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Back link */}
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-20 rounded-lg bg-deep-slate/5" />
        <div className="mt-4 h-8 w-64 rounded-lg bg-deep-slate/5" />
      </div>

      {/* Accent divider */}
      <div className="mb-8 h-px w-full bg-deep-slate/5" />

      {/* Post rows skeleton */}
      <div className="space-y-0 divide-y divide-deep-slate/8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 py-5 first:pt-0">
            <div className="min-w-0 flex-1 animate-pulse">
              <div className="h-5 w-3/4 rounded-lg bg-deep-slate/5" />
              <div className="mt-2 h-4 w-1/2 rounded-lg bg-deep-slate/5" />
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="h-5 w-14 rounded-full bg-deep-slate/5" />
                <div className="h-5 w-16 rounded-full bg-deep-slate/5" />
                <div className="ml-1 h-4 w-12 rounded-lg bg-deep-slate/5" />
              </div>
            </div>
            <div className="h-[60px] w-[60px] shrink-0 rounded-lg bg-deep-slate/5 sm:h-[80px] sm:w-[80px]" />
          </div>
        ))}
      </div>
    </main>
  );
}
