import Link from "next/link";
import Image from "next/image";
import { getRecentPosts } from "@/lib/posts";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getRecentPosts(20);
  const [featured, ...rest] = posts;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.twsgurukul.com";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TWSGurukulX",
      url: baseUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "TWSGurukulX — Trading Insights",
      description: "Live stream trading analysis and market insights from Trading With Sidhant Team",
      url: baseUrl,
      publisher: {
        "@type": "Organization",
        name: "TWSGurukulX",
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo-icon.png` },
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    <main className="mx-auto max-w-4xl px-4 py-12">
      {!featured ? (
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
          {/* Featured latest post */}
          <Link href={`/posts/${featured.slug}`} className="group block no-underline">
            <article className="animate-reveal mb-14">
              {featured.heroImage ? (
                <div className="animate-image-reveal relative aspect-video overflow-hidden rounded-xl bg-deep-slate/5">
                  <Image
                    src={featured.heroImage}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-slate/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ) : (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-deep-slate/5" />
              )}
              <div className="mt-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="tag-pill rounded-full bg-wealth-teal/8 px-3 py-1 text-xs font-medium text-wealth-teal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-deep-slate transition-colors duration-300 group-hover:text-burnt-amber sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-2 text-lg text-deep-slate/60">{featured.hook}</p>
                <time
                  className="mt-3 block text-sm text-deep-slate/35"
                  dateTime={featured.publishedAt.toISOString()}
                >
                  {featured.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </article>
          </Link>

          {/* Accent divider */}
          <div className="accent-line mb-10 animate-reveal delay-2" />

          {/* Recent posts list */}
          {rest.length > 0 && (
            <section className="animate-reveal delay-3">
              <h2 className="mb-6 font-instrument text-lg text-burnt-amber/70">
                Recent Posts
              </h2>
              <div className="divide-y divide-deep-slate/8">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="post-row group block rounded-lg py-5 no-underline first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-deep-slate transition-colors duration-200 group-hover:text-burnt-amber">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-deep-slate/55 line-clamp-1">
                          {post.hook}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-deep-slate/5 px-2.5 py-0.5 text-[11px] font-medium text-deep-slate/45"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <time
                        className="shrink-0 text-sm tabular-nums text-deep-slate/35"
                        dateTime={post.publishedAt.toISOString()}
                      >
                        {post.publishedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* WhatsApp CTA */}
          <section className="mt-14 animate-reveal delay-4">
            <WhatsAppCTA />
          </section>
        </>
      )}
    </main>
    </>
  );
}
