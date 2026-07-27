import { getRecentPosts } from "@/lib/posts";
import { PostsDisplay } from "@/components/PostsDisplay";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ProgramCTA } from "@/components/ProgramCTA";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getRecentPosts(50);

  const baseUrl = SITE_URL;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: baseUrl,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: baseUrl,
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo-icon.png` },
      },
    },
  ];

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    <main className="mx-auto max-w-4xl px-4 py-12">
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
        <>
          <PostsDisplay posts={serializedPosts} />

          <section className="mt-10 animate-reveal delay-3">
            <ProgramCTA variant="banner" />
          </section>

          <section className="mt-10 animate-reveal delay-4">
            <TelegramCTA />
          </section>

          <section className="mt-10 animate-reveal delay-4">
            <NewsletterCTA />
          </section>
        </>
      )}
    </main>
    </>
  );
}
