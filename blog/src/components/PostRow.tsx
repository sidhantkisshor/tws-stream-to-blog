import Link from "next/link";
import { formatDate, plainDashes, tagLabel } from "@/lib/display";

export interface PostRowData {
  title: string;
  slug: string;
  hook: string;
  tags: string[];
  publishedAt: string | Date;
  readingMinutes?: number;
}

/**
 * One post in any list. Type and a rule, no thumbnail, so a list never repeats a
 * picture. `stacked` keeps the phone layout on wide screens, for narrow columns.
 */
export function PostRow({ post, stacked = false }: { post: PostRowData; stacked?: boolean }) {
  const iso = new Date(post.publishedAt).toISOString();
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`post-row group block border-t border-rule py-7 no-underline ${
        stacked ? "" : "md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8 md:py-9"
      }`}
    >
      <div className={stacked ? "mb-2" : "mb-2 md:mb-0 md:pt-2"}>
        {post.tags[0] && <span className="label block text-hot-text">{tagLabel(post.tags[0])}</span>}
        <span className={`label mt-1 hidden text-mute ${stacked ? "" : "md:block"}`}>
          <time dateTime={iso}>{formatDate(post.publishedAt)}</time>
        </span>
      </div>
      <div className="min-w-0">
        <h3 className={`post-row-title text-[1.875rem] leading-[1.1] ${stacked ? "" : "md:text-[2.5rem]"}`}>
          {plainDashes(post.title)}
        </h3>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-body">{plainDashes(post.hook)}</p>
        <p className="label mt-3 text-mute">
          <span className={stacked ? "" : "md:hidden"}>
            {formatDate(post.publishedAt)}
            {post.readingMinutes ? ", " : ""}
          </span>
          {post.readingMinutes ? `${post.readingMinutes} min read` : ""}
        </p>
      </div>
    </Link>
  );
}
