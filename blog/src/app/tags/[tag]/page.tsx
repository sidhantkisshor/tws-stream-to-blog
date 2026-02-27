import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/posts";
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
    title: `#${tag} | TWSGurukulX`,
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
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <Link href="/" className="text-sm text-wealth-teal no-underline hover:underline">
          &larr; All posts
        </Link>
        <h1 className="mt-4 font-instrument text-3xl text-deep-slate">
          Posts tagged <span className="text-burnt-amber">#{tag}</span>
        </h1>
      </header>

      <div className="divide-y divide-deep-slate/10">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block py-5 no-underline first:pt-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-instrument text-lg text-deep-slate group-hover:text-burnt-amber transition-colors">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-deep-slate/60 line-clamp-1">
                  {post.hook}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-deep-slate/5 px-2 py-0.5 text-xs text-deep-slate/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <time
                className="shrink-0 text-sm text-deep-slate/40"
                dateTime={post.publishedAt.toISOString()}
              >
                {post.publishedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
