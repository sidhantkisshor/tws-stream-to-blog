import Link from "next/link";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ArchiveList } from "@/components/ArchiveList";
import { getRecentPosts } from "@/lib/posts";
import { SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Posts",
  description:
    `Browse every trading analysis and market insight from ${SITE_NAME} live streams.`,
  alternates: { canonical: "/posts" },
  openGraph: {
    title: `All Posts — ${SITE_NAME}`,
    description:
      `Browse every trading analysis and market insight from ${SITE_NAME} live streams.`,
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function ArchivePage() {
  const posts = await getRecentPosts(200);

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    hook: p.hook,
    heroImage: p.heroImage,
    tags: p.tags,
    publishedAt: p.publishedAt.toISOString(),
    readingMinutes: p.readingMinutes,
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="animate-reveal mb-8">
        <Link
          href="/"
          className="text-sm text-wealth-teal no-underline hover:underline"
        >
          &larr; Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-deep-slate">
          All Posts
        </h1>
        <p className="mt-1 text-sm text-deep-slate/50">
          {posts.length} {posts.length === 1 ? "post" : "posts"} published
        </p>
      </header>

      <div className="accent-line mb-8 animate-reveal delay-1" />

      {posts.length === 0 ? (
        <div className="animate-reveal py-20 text-center">
          <p className="font-instrument text-2xl text-deep-slate/30">
            No posts yet.
          </p>
          <p className="mt-2 text-sm text-deep-slate/40">
            Check back after the next live stream.
          </p>
        </div>
      ) : (
        <div className="animate-reveal delay-2">
          <ArchiveList posts={serializedPosts} />
        </div>
      )}

      <section className="mt-14 animate-reveal delay-3">
        <TelegramCTA />
      </section>
    </main>
  );
}
