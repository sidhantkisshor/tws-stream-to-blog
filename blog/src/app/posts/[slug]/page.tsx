import { notFound } from "next/navigation";
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
import { Shout } from "@/components/Shout";
import { TapePlate } from "@/components/TapePlate";
import { formatDate, plainDashes, tagLabel } from "@/lib/display";
import { hardLine } from "@/lib/hard-line";
import { getTape } from "@/lib/tape";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { TWS_FOUNDER, TWS_ORGANIZATION, TWS_TWITTER_SITE } from "@/lib/family";
import type { Metadata } from "next";

export const revalidate = 60;

// Every other post is served on-demand via ISR (see dynamicParams below) and
// then cached for `revalidate` seconds, so this only has to warm the pages
// most likely to get traffic right after a build.
const BUILD_TIME_PRERENDER_COUNT = 20;

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

// Only prerender a small, bounded slice of the most recent posts at build
// time. The post count grows continuously (n8n publishes new posts on an
// ongoing basis via POST /api/posts) and every prerendered page issues its
// own set of Prisma queries, so building all of them made the build's DB
// connection/query fan-out scale with total post count instead of staying
// flat. `dynamicParams = true` (the default, set explicitly here) means any
// slug not in this slice - an older post, or a brand-new one published after
// this build - is rendered on the first request and then cached for
// `revalidate` seconds, exactly like the prerendered pages.
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { publishedAt: "desc" },
      take: BUILD_TIME_PRERENDER_COUNT,
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// Explicit (matches the Next.js default, but this behavior is load-bearing
// here so it should not depend on the default staying what it is).
export const dynamicParams = true;

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
      // images intentionally omitted, picked up from app/posts/[slug]/opengraph-image.tsx
      type: "article",
      // A child openGraph object replaces the root one instead of merging with
      // it, so siteName has to be restated here or posts lose og:site_name.
      siteName: SITE_NAME,
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      // Restated for the same reason as openGraph.siteName above.
      site: TWS_TWITTER_SITE,
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

  const [relatedPosts, { previous, next }, tape] = await Promise.all([
    getRelatedPosts(post.id, post.tags, 3),
    getAdjacentPosts(post.publishedAt),
    getTape(post.sections),
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
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDesc,
      ...(post.heroImage ? { image: post.heroImage } : {}),
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      // The author and publisher are the family founder and parent Organization,
      // referenced by the same @id the root layout declares. @type and name are
      // restated because most consumers parse each ld+json block on its own, and
      // BlogPosting.author without a name fails Google's required-field check on
      // every indexed post.
      author: { "@type": "Person", "@id": TWS_FOUNDER.id, name: TWS_FOUNDER.name, url: TWS_FOUNDER.url },
      publisher: {
        "@type": "Organization",
        "@id": TWS_ORGANIZATION.id,
        name: TWS_ORGANIZATION.name,
        logo: { "@type": "ImageObject", url: TWS_ORGANIZATION.logo },
      },
      isPartOf: { "@id": `${baseUrl}/#blog` },
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

  const title = plainDashes(post.title);
  const hook = plainDashes(post.hook);
  const line = hardLine(post.sections);
  const firstTag = post.tags[0];

  const meta = (
    <>
      <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>, {readingTime} min read
    </>
  );

  return (
    <>
      <ReadingProgress />
      <ScrollNewsletterPrompt />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {tape ? (
        <header className="plate">
          <TapePlate tape={tape} />
          <div className="px-[var(--gutter)] pb-[72px] pt-[220px] md:pb-[136px] md:pl-[calc(var(--sheet-offset)+56px)] md:pt-[300px]">
            {firstTag && (
              <Link
                href={`/tags/${encodeURIComponent(firstTag)}`}
                className="label mb-3 block w-fit text-[#ff8259] no-underline hover:underline"
              >
                {tagLabel(firstTag)}
              </Link>
            )}
            <h1 className="plate-title max-w-[20ch]">{title}</h1>
            <p className="mt-4 max-w-[56ch] text-[1.0625rem] leading-relaxed text-white/80">{hook}</p>
            <p className="label mt-4 text-white/60">{meta}</p>
            {tape.caption && <p className="label mt-1 text-white/60">{tape.caption}</p>}
          </div>
        </header>
      ) : (
        <header className="px-[var(--gutter)] pb-10 pt-6 md:pb-14 md:pt-10">
          {firstTag && (
            <Link
              href={`/tags/${encodeURIComponent(firstTag)}`}
              className="label mb-4 block w-fit text-hot-text no-underline hover:underline"
            >
              {tagLabel(firstTag)}
            </Link>
          )}
          {line ? (
            <>
              <Shout text={line} />
              <h1 className="title-serif mt-8 max-w-[22ch]">{title}</h1>
            </>
          ) : (
            <Shout as="h1" text={title} />
          )}
          <p className="mt-5 max-w-[56ch] text-xl leading-snug text-ink">{hook}</p>
          <p className="label mt-4 text-mute">{meta}</p>
        </header>
      )}

      <div className={`sheet ${tape ? "sheet-over" : ""}`}>
        {tape && line && <Shout text={line} className="mb-10 md:mb-16" />}

        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,68ch)] lg:gap-16">
          {/* TOC: renders its own desktop sidebar and mobile disclosure */}
          <TableOfContents sections={sections.map((s) => ({ heading: s.heading, label: plainDashes(s.heading) }))} />

          <article className="min-w-0">
            <div className="space-y-12">
              <MarkdownBody tone="lead">{post.intro}</MarkdownBody>

              <KeyTakeaways sections={sections} />

              {sections.map((section, i) => (
                <div key={i}>
                  <section id={slugify(section.heading)}>
                    <h2 className="section-heading">{plainDashes(section.heading)}</h2>
                    <div className="mt-5">
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
                    <div className="mt-12">
                      <ProgramCTA variant="inline" />
                    </div>
                  )}
                </div>
              ))}

              <section className="border-t border-rule pt-10">
                <MarkdownBody>{post.conclusion}</MarkdownBody>
              </section>

              {faqItems.length > 0 && (
                <section className="border-t border-rule pt-10">
                  <h2 className="section-heading">Frequently Asked Questions</h2>
                  <dl className="mt-8 space-y-8">
                    {faqItems.map((faq, i) => (
                      <div key={i}>
                        <dt className="text-lg font-bold leading-snug text-ink">{plainDashes(faq.question)}</dt>
                        <dd className="mt-2 text-[1.0625rem] leading-relaxed text-body">
                          {plainDashes(faq.answer)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
            </div>

            <div className="mt-14 border-t border-rule pt-8">
              <p className="label mb-3 text-mute">Share this post</p>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            <div className="mt-14 space-y-14">
              <RelatedPosts posts={relatedPosts} />
              <SessionNav previous={previous} next={next} />
            </div>

            <div className="mt-14 grid gap-12 border-t border-rule pt-12">
              <TelegramCTA />
              <NewsletterCTA />
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
