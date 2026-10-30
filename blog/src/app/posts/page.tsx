import { Shout } from "@/components/Shout";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ArchiveList } from "@/components/ArchiveList";
import { getRecentPosts } from "@/lib/posts";
import { SITE_NAME, OG_IMAGE, SITE_OPEN_GRAPH } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Posts",
  description:
    `Browse every trading analysis and market insight from ${SITE_NAME} live streams.`,
  alternates: { canonical: "/posts" },
  openGraph: {
    title: `All Posts | ${SITE_NAME}`,
    description:
      `Browse every trading analysis and market insight from ${SITE_NAME} live streams.`,
    images: [OG_IMAGE],
    ...SITE_OPEN_GRAPH,
  },
};

export default async function ArchivePage() {
  const posts = await getRecentPosts(200);

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    hook: p.hook,
    tags: p.tags,
    publishedAt: p.publishedAt.toISOString(),
    readingMinutes: p.readingMinutes,
  }));

  return (
    <main>
      <header className="px-[var(--gutter)] pb-8 pt-6 md:pb-12 md:pt-10">
        <Shout as="h1" text="All Posts" wideMin={0.13} />
        <p className="mt-5 text-xl text-ink">
          {posts.length} {posts.length === 1 ? "post" : "posts"} published
        </p>
      </header>

      <div className="sheet">
        {posts.length === 0 ? (
          <div className="py-16">
            <p className="text-2xl text-ink">No posts yet.</p>
            <p className="mt-2 text-mute">Check back after the next live stream.</p>
          </div>
        ) : (
          <ArchiveList posts={serializedPosts} />
        )}

        <section className="mt-14 border-t border-rule pt-12">
          <TelegramCTA />
        </section>
      </div>
    </main>
  );
}
