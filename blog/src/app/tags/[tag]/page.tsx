import Link from "next/link";
import { Shout } from "@/components/Shout";
import { PostRow } from "@/components/PostRow";
import { tagLabel } from "@/lib/display";
import { TelegramCTA } from "@/components/TelegramCTA";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME, OG_IMAGE, SITE_OPEN_GRAPH } from "@/lib/site";
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
      title: `#${tag} | ${SITE_NAME}`,
      description: `Trading insights and analysis tagged with ${tag}`,
      images: [OG_IMAGE],
      ...SITE_OPEN_GRAPH,
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

  const baseUrl = SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Posts tagged #${tag}`,
    description: `Trading insights and analysis tagged with ${tag}`,
    url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
    numberOfItems: posts.length,
    inLanguage: "en",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/posts/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main>
        <header className="px-[var(--gutter)] pb-8 pt-6 md:pb-12 md:pt-10">
          <Shout as="h1" text={tagLabel(tag)} wideMin={0.13} />
          <p className="mt-5 text-xl text-ink">
            {posts.length} {posts.length === 1 ? "post" : "posts"}.{" "}
            <Link href="/posts" className="link-rule">
              All posts
            </Link>
          </p>
        </header>

        <div className="sheet">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}

          <section className="mt-14 border-t border-rule pt-12">
            <TelegramCTA />
          </section>
        </div>
      </main>
    </>
  );
}
