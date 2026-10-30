import Link from "next/link";
import { formatDate, plainDashes } from "@/lib/display";

interface NavPost {
  title: string;
  slug: string;
  publishedAt: Date;
}

interface SessionNavProps {
  previous: NavPost | null;
  next: NavPost | null;
}

function Side({ post, label, end = false }: { post: NavPost | null; label: string; end?: boolean }) {
  if (!post) return <div />;
  return (
    <Link href={`/posts/${post.slug}`} className={`post-row group block no-underline ${end ? "sm:text-right" : ""}`}>
      <span className="label text-mute">{label}</span>
      <p className="post-row-title mt-1 font-instrument text-[1.5rem] leading-[1.15] text-ink">{plainDashes(post.title)}</p>
      <time className="label mt-1 block text-mute" dateTime={post.publishedAt.toISOString()}>
        {formatDate(post.publishedAt)}
      </time>
    </Link>
  );
}

export function SessionNav({ previous, next }: SessionNavProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Other sessions" className="grid gap-8 border-t border-rule pt-8 sm:grid-cols-2">
      <Side post={previous} label="Previous session" />
      <Side post={next} label="Next session" end />
    </nav>
  );
}
