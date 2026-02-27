import Link from "next/link";
import Image from "next/image";
import { getRecentPosts } from "@/lib/posts";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getRecentPosts(20);
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {!featured ? (
        <p className="text-deep-slate/50">No posts yet. Check back after the next live stream.</p>
      ) : (
        <>
          {/* Featured latest post */}
          <Link href={`/posts/${featured.slug}`} className="group block no-underline">
            <article className="mb-12">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={featured.heroImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-wealth-teal/10 px-2.5 py-0.5 text-xs font-medium text-wealth-teal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-instrument text-3xl text-deep-slate group-hover:text-burnt-amber transition-colors sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-2 text-deep-slate/70">{featured.hook}</p>
                <time
                  className="mt-2 block text-sm text-deep-slate/40"
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

          {/* Recent posts list */}
          {rest.length > 0 && (
            <section>
              <h2 className="mb-6 font-instrument text-xl text-deep-slate/60">Recent Posts</h2>
              <div className="divide-y divide-deep-slate/10">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group block py-5 no-underline first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-instrument text-lg text-deep-slate group-hover:text-burnt-amber transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-deep-slate/60 line-clamp-1">
                          {post.hook}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-deep-slate/5 px-2 py-0.5 text-xs text-deep-slate/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <time
                        className="shrink-0 text-sm text-deep-slate/40"
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
          <section className="mt-12">
            <WhatsAppCTA />
          </section>
        </>
      )}
    </main>
  );
}
