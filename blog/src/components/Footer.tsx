import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="mt-20 border-t border-deep-slate/8 bg-gradient-to-b from-warm-white to-[#F3F0EB]">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="tag-pill rounded-full bg-deep-slate/5 px-3 py-1 text-xs font-medium text-deep-slate/50 no-underline hover:bg-deep-slate/10 hover:text-deep-slate/70"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-deep-slate/30">
            &copy; 2026 Trading With Sidhant LLP
          </p>
          <Link
            href="/"
            className="group flex items-baseline gap-0.5 text-sm no-underline hover:no-underline"
          >
            <span className="font-bold text-deep-slate/30 transition-colors group-hover:text-deep-slate/50">
              TWS
            </span>
            <span className="font-instrument text-deep-slate/20 transition-colors group-hover:text-burnt-amber/50">
              GurukulX
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
