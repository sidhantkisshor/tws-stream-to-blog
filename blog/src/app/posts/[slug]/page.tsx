import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ChartImage } from "@/components/ChartImage";
import { MarkdownBody } from "@/components/MarkdownBody";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <article className="mx-auto max-w-prose px-4 py-12">
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

        <div className="animate-reveal delay-2 space-y-10">
          <div className="text-lg leading-relaxed text-deep-slate/75">
            <MarkdownBody>{post.intro}</MarkdownBody>
          </div>

          {sections.map((section, i) => (
            <section key={i}>
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
          ))}

          <div className="accent-line" />

          <section className="pt-2">
            <MarkdownBody>{post.conclusion}</MarkdownBody>
          </section>
        </div>

        <div className="mt-14 animate-reveal delay-4">
          <WhatsAppCTA />
        </div>
      </article>
    </>
  );
}
