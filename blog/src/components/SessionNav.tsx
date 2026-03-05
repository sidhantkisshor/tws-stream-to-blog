import Link from "next/link";

interface NavPost {
  title: string;
  slug: string;
  publishedAt: Date;
}

interface SessionNavProps {
  previous: NavPost | null;
  next: NavPost | null;
}

export function SessionNav({ previous, next }: SessionNavProps) {
  if (!previous && !next) return null;

  return (
    <nav className="grid grid-cols-2 gap-4">
      <div>
        {previous && (
          <Link
            href={`/posts/${previous.slug}`}
            className="group block no-underline"
          >
            <span className="text-xs text-deep-slate/40">
              &larr; Previous Session
            </span>
            <p className="mt-0.5 text-sm text-deep-slate/50 transition-colors group-hover:text-deep-slate">
              {previous.title}
            </p>
            <time
              className="mt-0.5 block text-xs text-deep-slate/30"
              dateTime={previous.publishedAt.toISOString()}
            >
              {previous.publishedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            href={`/posts/${next.slug}`}
            className="group block no-underline"
          >
            <span className="text-xs text-deep-slate/40">
              Next Session &rarr;
            </span>
            <p className="mt-0.5 text-sm text-deep-slate/50 transition-colors group-hover:text-deep-slate">
              {next.title}
            </p>
            <time
              className="mt-0.5 block text-xs text-deep-slate/30"
              dateTime={next.publishedAt.toISOString()}
            >
              {next.publishedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
          </Link>
        )}
      </div>
    </nav>
  );
}
