import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getRelatedPosts, getAdjacentPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ChartImage } from "@/components/ChartImage";
import { MarkdownBody } from "@/components/MarkdownBody";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ReadingProgress } from "@/components/ReadingProgress";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { ProgramCTA } from "@/components/ProgramCTA";
import { RelatedPosts } from "@/components/RelatedPosts";
import { SessionNav } from "@/components/SessionNav";
import type { Metadata } from "next";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
  chartRef?: string;
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({ select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.seoDesc,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      title: post.title,
      description: post.seoDesc,
      ...(post.heroImage
        ? { images: [{ url: post.heroImage, width: 1200, height: 675, alt: post.title }] }
        : {}),
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDesc,
      ...(post.heroImage
        ? { images: [{ url: post.heroImage, width: 1200, height: 675, alt: post.title }] }
        : {}),
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const sections: Section[] = Array.isArray(post.sections)
    ? (post.sections as unknown[]).filter(
        (s): s is Section =>
          !!s &&
          typeof s === "object" &&
          typeof (s as Section).heading === "string" &&
          typeof (s as Section).body === "string"
      )
    : [];

  const [relatedPosts, { previous, next }] = await Promise.all([
    getRelatedPosts(post.id, post.tags, 3),
    getAdjacentPosts(post.publishedAt),
  ]);

  const midpoint = Math.floor(sections.length / 2);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.twsgurukul.com";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.seoDesc,
      ...(post.heroImage ? { image: post.heroImage } : {}),
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: { "@type": "Organization", name: "TWSGurukulX", url: baseUrl },
      publisher: {
        "@type": "Organization",
        name: "TWSGurukulX",
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo-icon.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/posts/${slug}` },
      url: `${baseUrl}/posts/${slug}`,
      keywords: post.keywords.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: post.title, item: `${baseUrl}/posts/${slug}` },
      ],
    },
  ];

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="mx-auto flex max-w-5xl gap-8 px-4 py-12">
        {/* Desktop TOC sidebar */}
        <div className="hidden lg:block">
          <TableOfContents sections={sections} />
        </div>

        <article className="min-w-0 max-w-prose">
          <header className="animate-reveal mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="tag-pill rounded-full bg-wealth-teal/8 px-3 py-1 text-xs font-medium text-wealth-teal no-underline hover:bg-wealth-teal/15"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-deep-slate sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 font-instrument text-xl text-burnt-amber/80">{post.hook}</p>
            <time
              className="mt-3 block text-sm text-deep-slate/35"
              dateTime={post.publishedAt.toISOString()}
            >
              {post.publishedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </header>

          {post.heroImage && (
            <div className="animate-image-reveal relative mb-10 aspect-video overflow-hidden rounded-xl bg-deep-slate/5">
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 65ch"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Mobile TOC */}
          <div className="lg:hidden animate-reveal delay-1">
            <TableOfContents sections={sections} />
          </div>

          <div className="animate-reveal delay-2 space-y-10">
            <div className="text-lg leading-relaxed text-deep-slate/75">
              <MarkdownBody>{post.intro}</MarkdownBody>
            </div>

            <KeyTakeaways hook={post.hook} sections={sections} />

            {sections.map((section, i) => (
              <div key={i}>
                <section id={slugify(section.heading)}>
                  <h2 className="text-2xl font-bold tracking-tight text-deep-slate">
                    {section.heading}
                  </h2>
                  <div className="mt-3">
                    <MarkdownBody>{section.body}</MarkdownBody>
                  </div>
                  {section.chartRef && (
                    <ChartImage
                      src={section.chartRef}
                      alt={`Chart: ${section.heading}`}
                    />
                  )}
                </section>
                {i === midpoint && sections.length >= 3 && (
                  <div className="my-8">
                    <ProgramCTA variant="inline" />
                  </div>
                )}
              </div>
            ))}

            <div className="accent-line" />

            <section className="pt-2">
              <MarkdownBody>{post.conclusion}</MarkdownBody>
            </section>
          </div>

          <div className="mt-10 space-y-10">
            <div>
              <p className="mb-3 text-sm text-deep-slate/40">Share this post</p>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            <RelatedPosts posts={relatedPosts} />

            <SessionNav previous={previous} next={next} />
          </div>

          <div className="mt-14 animate-reveal delay-4">
            <TelegramCTA />
          </div>
        </article>
      </div>
    </>
  );
}
