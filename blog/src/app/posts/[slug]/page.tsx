import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ChartImage } from "@/components/ChartImage";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import type { Metadata } from "next";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
  chartRef?: string;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
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
    title: `${post.title} | TWSGurukulX`,
    description: post.seoDesc,
    openGraph: {
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
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

  const sections = post.sections as unknown as Section[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDesc,
    image: post.heroImage,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "TWSGurukulX" },
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-prose px-4 py-12">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-wealth-teal/10 px-3 py-1 text-xs font-medium text-wealth-teal no-underline hover:bg-wealth-teal/20"
              >
                {tag}
              </Link>
            ))}
          </div>
          <h1 className="font-instrument text-3xl leading-tight text-deep-slate sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-burnt-amber">{post.hook}</p>
          <time
            className="mt-2 block text-sm text-deep-slate/40"
            dateTime={post.publishedAt.toISOString()}
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-8">
          <p className="text-lg leading-relaxed text-deep-slate/80">{post.intro}</p>

          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-instrument text-2xl text-deep-slate">{section.heading}</h2>
              <div className="mt-3 leading-relaxed text-deep-slate/80 whitespace-pre-line">
                {section.body}
              </div>
              {section.chartRef && (
                <ChartImage
                  src={section.chartRef}
                  alt={`Chart: ${section.heading}`}
                />
              )}
            </section>
          ))}

          <section className="border-t border-deep-slate/10 pt-8">
            <p className="leading-relaxed text-deep-slate/80">{post.conclusion}</p>
          </section>
        </div>

        <div className="mt-12">
          <WhatsAppCTA />
        </div>
      </article>
    </>
  );
}
