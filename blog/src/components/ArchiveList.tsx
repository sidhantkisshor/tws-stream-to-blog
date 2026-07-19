"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "./SearchBar";
import type { SerializedPost } from "./PostsDisplay";

function ArchiveRow({ post }: { post: SerializedPost }) {
  const date = new Date(post.publishedAt);
  return (
    <div className="group py-5 first:pt-0">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/posts/${post.slug}`}
            className="text-lg font-bold text-deep-slate no-underline transition-colors duration-200 hover:text-burnt-amber"
          >
            {post.title}
          </Link>
          <p className="mt-1 text-sm leading-relaxed text-deep-slate/55 line-clamp-1">
            {post.hook.replace(/\s*—\s*/g, ", ")}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="rounded-full bg-deep-slate/5 px-2.5 py-0.5 text-[11px] font-medium text-deep-slate/45 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/60"
              >
                {tag}
              </Link>
            ))}
            <time
              className="ml-1 text-sm tabular-nums text-deep-slate/35"
              dateTime={date.toISOString()}
            >
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span aria-hidden className="text-deep-slate/20">·</span>
            <span className="text-sm tabular-nums text-deep-slate/35">
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            width={80}
            height={80}
            className="h-[60px] w-[60px] shrink-0 rounded-lg object-cover sm:h-[80px] sm:w-[80px]"
            sizes="80px"
          />
        ) : (
          <div className="h-[60px] w-[60px] shrink-0 rounded-lg bg-gradient-to-br from-deep-slate/5 to-burnt-amber/5 sm:h-[80px] sm:w-[80px]" />
        )}
      </div>
    </div>
  );
}

export function ArchiveList({ posts }: { posts: SerializedPost[] }) {
  const [query, setQuery] = useState("");
  const handleChange = useCallback((q: string) => setQuery(q), []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.hook.toLowerCase().includes(q) ||
          p.tags.join(" ").toLowerCase().includes(q),
      )
    : posts;

  return (
    <>
      <SearchBar query={query} onChange={handleChange} />
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-deep-slate/40">
          No posts match your search.
        </p>
      ) : (
        <div className="divide-y divide-deep-slate/8">
          {filtered.map((post) => (
            <ArchiveRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
