import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  title: string;
  slug: string;
  hook: string;
  heroImage: string;
  tags: string[];
  publishedAt: Date;
}

export function PostCard({ title, slug, hook, heroImage, tags, publishedAt }: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="group block no-underline">
      <article className="overflow-hidden rounded-lg border border-deep-slate/10 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-video">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-wealth-teal/10 px-2.5 py-0.5 text-xs font-medium text-wealth-teal"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mb-2 text-lg font-bold text-deep-slate group-hover:text-burnt-amber transition-colors">
            {title}
          </h2>
          <p className="mb-3 text-sm text-deep-slate/70 line-clamp-2">{hook}</p>
          <time className="text-xs text-deep-slate/50" dateTime={publishedAt.toISOString()}>
            {publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </article>
    </Link>
  );
}
