import Link from "next/link";
import Image from "next/image";

interface RelatedPost {
  title: string;
  slug: string;
  heroImage: string;
  hook: string;
  publishedAt: Date;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h3 className="mb-4 font-instrument text-lg text-burnt-amber/70">
        More on this topic
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block overflow-hidden rounded-lg no-underline"
          >
            {post.heroImage ? (
              <div className="relative aspect-video overflow-hidden rounded-lg bg-deep-slate/5">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gradient-to-br from-deep-slate/5 to-burnt-amber/5" />
            )}
            <p className="mt-2 text-sm font-bold text-deep-slate transition-colors group-hover:text-burnt-amber">
              {post.title}
            </p>
            {post.hook && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-deep-slate/45">
                {post.hook.replace(/\s*—\s*/g, ", ")}
              </p>
            )}
            <time
              className="mt-0.5 block text-xs text-deep-slate/35"
              dateTime={post.publishedAt.toISOString()}
            >
              {post.publishedAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </Link>
        ))}
      </div>
    </section>
  );
}
