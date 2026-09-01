import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getRelatedPosts, getAdjacentPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ChartImage } from "@/components/ChartImage";
import { InteractiveDemo } from "@/components/InteractiveDemo";
import { MarkdownBody } from "@/components/MarkdownBody";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ReadingProgress } from "@/components/ReadingProgress";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { ProgramCTA } from "@/components/ProgramCTA";
import { RelatedPosts } from "@/components/RelatedPosts";
import { SessionNav } from "@/components/SessionNav";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { ScrollNewsletterPrompt } from "@/components/ScrollNewsletterPrompt";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
  keyTakeaway?: string;
  chartRef?: string;
}

interface FaqItem {
  question: string;
  answer: string;
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
      // images intentionally omitted — picked up from app/posts/[slug]/opengraph-image.tsx
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDesc,
      // images fall back to the OG image route via the file-based convention
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

  const faqItems: FaqItem[] = Array.isArray(post.faq)
    ? (post.faq as unknown[]).filter(
        (f): f is FaqItem =>
          !!f &&
          typeof f === "object" &&
          typeof (f as FaqItem).question === "string" &&
          typeof (f as FaqItem).answer === "string"
      )
    : sections
        .filter((s) => s.heading && s.body)
        .slice(0, 5)
        .map((s) => ({
          question: s.heading,
          answer: s.body
            .replace(/[#*_`~\[\]()>!|-]/g, "")
            .replace(/\n+/g, " ")
            .trim()
            .slice(0, 300),
        }));

  const midpoint = Math.floor(sections.length / 2);

  const wordCount = [post.intro, ...sections.map((s) => s.body), post.conclusion]
    .join(" ")
    .split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const baseUrl = SITE_URL;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.seoDesc,
      ...(post.heroImage ? { image: post.heroImage } : {}),
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: { "@type": "Organization", name: SITE_NAME, url: baseUrl },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo-icon.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/posts/${slug}` },
      url: `${baseUrl}/posts/${slug}`,
      keywords: post.keywords.join(", "),
      wordCount,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: post.title, item: `${baseUrl}/posts/${slug}` },
      ],
    },
    ...(faqItems.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
            inLanguage: "en",
          },
        ]
      : []),
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
      <ScrollNewsletterPrompt />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-4 py-12 lg:flex-row lg:items-start lg:justify-start">
        {/* TOC: renders its own desktop sidebar and mobile disclosure */}
        <TableOfContents sections={sections} />

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
            <p className="mt-3 font-instrument text-xl text-burnt-amber/80">{post.hook.replace(/\s*—\s*/g, ", ")}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-deep-slate/35">
              <time dateTime={post.publishedAt.toISOString()}>
                {post.publishedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{readingTime} min read</span>
            </div>
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

            <KeyTakeaways sections={sections} />

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
                    section.chartRef.endsWith(".html") ? (
                      <InteractiveDemo
                        src={section.chartRef}
                        title={`${section.heading} (interactive)`}
                      />
                    ) : (
                      <ChartImage
                        src={section.chartRef}
                        alt={`Chart: ${section.heading}`}
                      />
                    )
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

            {faqItems.length > 0 && (
              <section className="mt-10 rounded-xl border border-deep-slate/8 bg-surface px-6 py-6">
                <h2 className="text-xl font-bold text-deep-slate">Frequently Asked Questions</h2>
                <dl className="mt-4 space-y-5">
                  {faqItems.map((faq, i) => (
                    <div key={i}>
                      <dt className="font-bold text-deep-slate/85">{faq.question}</dt>
                      <dd className="mt-1 text-[0.95rem] leading-relaxed text-deep-slate/60">
                        {faq.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          <div className="mt-10 space-y-10">
            <div>
              <p className="mb-3 text-sm text-deep-slate/40">Share this post</p>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            <RelatedPosts posts={relatedPosts} />

            <SessionNav previous={previous} next={next} />
          </div>

          <div className="mt-14 animate-reveal delay-4 space-y-6">
            <NewsletterCTA />
            <TelegramCTA />
          </div>
        </article>
      </div>
    </>
  );
}
