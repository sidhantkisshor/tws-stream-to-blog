import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="mt-16 border-t border-deep-slate/10 bg-warm-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-deep-slate/5 px-3 py-1 text-xs text-deep-slate/60 no-underline hover:bg-deep-slate/10 hover:text-deep-slate"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <p className="text-sm text-deep-slate/40">
          &copy; 2026 Trading With Sidhant LLP
        </p>
      </div>
    </footer>
  );
}
