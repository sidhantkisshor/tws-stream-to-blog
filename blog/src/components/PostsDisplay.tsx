"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "./SearchBar";

export interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  hook: string;
  heroImage: string | null;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
}

function PostThumbnail({ src, alt }: { src: string | null; alt: string }) {
  return src ? (
    <Image
      src={src}
      alt={alt}
      width={80}
      height={80}
      className="h-[60px] w-[60px] shrink-0 rounded-lg object-cover sm:h-[80px] sm:w-[80px]"
      sizes="80px"
    />
  ) : (
    <div className="h-[60px] w-[60px] shrink-0 rounded-lg bg-gradient-to-br from-deep-slate/5 to-burnt-amber/5 sm:h-[80px] sm:w-[80px]" />
  );
}

function PostRow({ post }: { post: SerializedPost }) {
  const date = new Date(post.publishedAt);
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="post-row group block rounded-lg py-5 no-underline first:pt-0"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-deep-slate transition-colors duration-200 group-hover:text-burnt-amber">
            {post.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-deep-slate/55 line-clamp-1">
            {post.hook.replace(/\s*—\s*/g, ", ")}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-deep-slate/5 px-2.5 py-0.5 text-[11px] font-medium text-deep-slate/45"
              >
                {tag}
              </span>
            ))}
            <time
              className="ml-1 text-sm tabular-nums text-deep-slate/35"
              dateTime={date.toISOString()}
            >
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
            <span aria-hidden className="text-deep-slate/20">·</span>
            <span className="text-sm tabular-nums text-deep-slate/35">
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
        <PostThumbnail src={post.heroImage} alt={post.title} />
      </div>
    </Link>
  );
}

export function PostsDisplay({ posts }: { posts: SerializedPost[] }) {
  const [query, setQuery] = useState("");
  const handleChange = useCallback((q: string) => setQuery(q), []);

  const isSearching = query.trim().length > 0;
  const filtered = isSearching
    ? posts.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.hook.toLowerCase().includes(q) ||
          p.tags.join(" ").toLowerCase().includes(q)
        );
      })
    : [];

  const [featured, ...rest] = posts;

  return (
    <>
      <SearchBar query={query} onChange={handleChange} />

      {isSearching ? (
        <section className="animate-reveal">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-deep-slate/40">
              No posts match your search.
            </p>
          ) : (
            <div className="divide-y divide-deep-slate/8">
              {filtered.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured latest post */}
          {featured && (
            <Link href={`/posts/${featured.slug}`} className="group block no-underline">
              <article className="animate-reveal mb-14">
                {featured.heroImage ? (
                  <div className="animate-image-reveal relative aspect-video overflow-hidden rounded-xl bg-deep-slate/5">
                    <Image
                      src={featured.heroImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      priority
                      sizes="(max-width: 896px) 100vw, 896px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-slate/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-deep-slate/5" />
                )}
                <div className="mt-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {featured.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="tag-pill rounded-full bg-wealth-teal/8 px-3 py-1 text-xs font-medium text-wealth-teal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-deep-slate transition-colors duration-300 group-hover:text-burnt-amber sm:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-lg text-deep-slate/60">{featured.hook.replace(/\s*—\s*/g, ", ")}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-deep-slate/35">
                    <time dateTime={new Date(featured.publishedAt).toISOString()}>
                      {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span aria-hidden className="text-deep-slate/20">·</span>
                    <span className="tabular-nums">{featured.readingMinutes} min read</span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Accent divider */}
          <div className="accent-line mb-10 animate-reveal delay-2" />

          {/* Recent posts list */}
          {rest.length > 0 && (
            <section className="animate-reveal delay-3">
              <h2 className="mb-6 font-instrument text-lg text-burnt-amber/70">
                Recent Posts
              </h2>
              <div className="divide-y divide-deep-slate/8">
                {rest.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
