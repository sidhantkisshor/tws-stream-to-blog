export default function PostLoading() {
  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-4 py-12">
      {/* Desktop sidebar skeleton */}
      <div className="hidden w-56 shrink-0 lg:block">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded-lg bg-deep-slate/5" />
          <div className="h-3 w-full rounded-lg bg-deep-slate/5" />
          <div className="h-3 w-5/6 rounded-lg bg-deep-slate/5" />
          <div className="h-3 w-4/6 rounded-lg bg-deep-slate/5" />
          <div className="h-3 w-full rounded-lg bg-deep-slate/5" />
          <div className="h-3 w-3/6 rounded-lg bg-deep-slate/5" />
        </div>
      </div>

      {/* Main content skeleton */}
      <article className="min-w-0 max-w-prose animate-pulse">
        {/* Tag pills */}
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-20 rounded-full bg-deep-slate/5" />
          <div className="h-6 w-16 rounded-full bg-deep-slate/5" />
          <div className="h-6 w-24 rounded-full bg-deep-slate/5" />
        </div>

        {/* Title */}
        <div className="h-9 w-full rounded-lg bg-deep-slate/5" />
        <div className="mt-2 h-9 w-2/3 rounded-lg bg-deep-slate/5" />

        {/* Hook */}
        <div className="mt-3 h-6 w-3/4 rounded-lg bg-deep-slate/5" />

        {/* Date */}
        <div className="mt-3 h-4 w-36 rounded-lg bg-deep-slate/5" />

        {/* Hero image */}
        <div className="mt-8 aspect-video w-full rounded-xl bg-deep-slate/5" />

        {/* Content blocks */}
        <div className="mt-10 space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-7 w-1/2 rounded-lg bg-deep-slate/5" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full rounded-lg bg-deep-slate/5" />
                <div className="h-4 w-full rounded-lg bg-deep-slate/5" />
                <div className="h-4 w-5/6 rounded-lg bg-deep-slate/5" />
                <div className="h-4 w-3/4 rounded-lg bg-deep-slate/5" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
