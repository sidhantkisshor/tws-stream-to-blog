import Link from "next/link";
import Image from "next/image";
import { TelegramCTA } from "@/components/TelegramCTA";
import { getRecentPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Posts | TWSGurukulX",
  description:
    "Browse every trading analysis and market insight from TWSGurukulX live streams.",
  alternates: { canonical: "/posts" },
  openGraph: {
    title: "All Posts — TWSGurukulX",
    description:
      "Browse every trading analysis and market insight from TWSGurukulX live streams.",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function ArchivePage() {
  const posts = await getRecentPosts(200);

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
        <div className="animate-reveal delay-2 divide-y divide-deep-slate/8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group py-5 first:pt-0"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="text-lg font-bold text-deep-slate no-underline transition-colors duration-200 hover:text-burnt-amber"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-deep-slate/55 line-clamp-1">
                    {post.hook}
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
                      dateTime={post.publishedAt.toISOString()}
                    >
                      {post.publishedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
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
          ))}
        </div>
      )}

      <section className="mt-14 animate-reveal delay-3">
        <TelegramCTA />
      </section>
    </main>
  );
}
