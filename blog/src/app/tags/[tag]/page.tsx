import Link from "next/link";
import Image from "next/image";
import { TelegramCTA } from "@/components/TelegramCTA";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.map((tag) => ({ tag }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return {
    title: `#${tag}`,
    description: `Trading insights and analysis tagged with ${tag}`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
    openGraph: {
      title: `#${tag} — TWSGurukulX`,
      description: `Trading insights and analysis tagged with ${tag}`,
      images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
    },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="animate-reveal mb-8">
        <Link href="/" className="text-sm text-wealth-teal no-underline hover:underline">
          &larr; All posts
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-deep-slate">
          Posts tagged{" "}
          <span className="font-instrument text-burnt-amber">#{tag}</span>
        </h1>
      </header>

      <div className="accent-line mb-8 animate-reveal delay-1" />

      <div className="animate-reveal delay-2 divide-y divide-deep-slate/8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="post-row group block rounded-lg py-5 no-underline first:pt-0"
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-deep-slate transition-colors duration-200 group-hover:text-burnt-amber">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-deep-slate/55 line-clamp-1">
                  {post.hook}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {post.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-deep-slate/5 px-2.5 py-0.5 text-[11px] font-medium text-deep-slate/45"
                    >
                      {t}
                    </span>
                  ))}
                  <time
                    className="ml-1 text-sm tabular-nums text-deep-slate/35"
                    dateTime={post.publishedAt.toISOString()}
                  >
                    {post.publishedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
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
          </Link>
        ))}
      </div>

      <section className="mt-14 animate-reveal delay-3">
        <TelegramCTA />
      </section>
    </main>
  );
}
