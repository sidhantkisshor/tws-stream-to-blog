"use client";

import { useCallback, useState } from "react";
import { SearchBar } from "./SearchBar";
import { PostRow } from "./PostRow";
import type { SerializedPost } from "./PostsDisplay";

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
        <p className="border-t border-rule py-12 text-mute">No posts match your search.</p>
      ) : (
        filtered.map((post) => <PostRow key={post.id} post={post} />)
      )}
    </>
  );
}
