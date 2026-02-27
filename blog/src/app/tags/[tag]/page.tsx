import { getPostsByTag, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `${tag} | TWS Trading Insights`,
    description: `Trading insights and analysis tagged with ${tag}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12">
        <a href="/" className="text-sm text-wealth-teal">&larr; Back to all posts</a>
        <h1 className="mt-4 text-3xl font-bold text-deep-slate">
          Posts tagged <span className="text-burnt-amber">{tag}</span>
        </h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </main>
  );
}
