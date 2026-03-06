import Link from "next/link";
import Image from "next/image";
import { getAllTags } from "@/lib/posts";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="mt-20 border-t border-deep-slate/8 bg-gradient-to-b from-warm-white to-deep-slate/5">
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
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <a
            href="https://youtube.com/@tradingwithsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            YouTube
          </a>
          <a
            href="https://instagram.com/tradingwithsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Instagram
          </a>
          <a
            href="https://x.com/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            X
          </a>
          <a
            href="https://t.me/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Telegram
          </a>
          <a
            href="https://wa.me/918062963333"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            WhatsApp
          </a>
          <a
            href="https://twsgurukul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            twsgurukul.com
          </a>
          <a
            href="https://tradingwithsidhant.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            tradingwithsidhant.com
          </a>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-deep-slate/30">
            &copy; 2026 Trading With Sidhant LLP
          </p>
          <Link
            href="/"
            className="group flex items-center gap-1.5 text-sm no-underline hover:no-underline"
          >
            <Image
              src="/logo-icon.png"
              alt="TWSGurukulX"
              width={20}
              height={20}
              className="rounded-sm opacity-30 transition-opacity group-hover:opacity-50"
            />
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
