"use client";

import { useState, useCallback, type ReactNode } from "react";
import { SearchBar } from "./SearchBar";
import { PostRow } from "./PostRow";

export interface SerializedPost {
  id: string;
  title: string;
  slug: string;
  hook: string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
}

/**
 * `posts` is everything searchable. The default list skips the first post, which
 * the page has already shown as the plate. `bands` replaces a post's row with a
 * full bleed band, so the list breaks its own rhythm with a real hard line.
 */
export function PostsDisplay({
  posts,
  bands = {},
}: {
  posts: SerializedPost[];
  bands?: Record<string, ReactNode>;
}) {
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
    : [];

  return (
    <>
      <SearchBar query={query} onChange={handleChange} />

      {q ? (
        filtered.length === 0 ? (
          <p className="border-t border-rule py-12 text-mute">No posts match your search.</p>
        ) : (
          filtered.map((post) => <PostRow key={post.id} post={post} />)
        )
      ) : (
        posts.slice(1).map((post) =>
          bands[post.id] ? (
            <div key={post.id}>{bands[post.id]}</div>
          ) : (
            <PostRow key={post.id} post={post} />
          ),
        )
      )}
    </>
  );
}
