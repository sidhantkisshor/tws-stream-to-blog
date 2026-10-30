/** Rows in the shape of `PostRow`, shown while a list loads. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-t border-rule py-7 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-9">
          <div className="mb-3 h-3 w-20 bg-rule" />
          <div>
            <div className="h-8 w-3/4 bg-rule" />
            <div className="mt-3 h-4 w-1/2 bg-rule" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Holds the space a shout will take, so the page does not jump when it arrives. */
export function ShoutSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-16 w-full bg-rule md:h-28" />
      <div className="mt-3 h-16 w-2/3 bg-rule md:h-28" />
    </div>
  );
}
