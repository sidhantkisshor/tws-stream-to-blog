import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { PROGRAMS_URL, MAIN_SITE_URL, LEGAL_ENTITY, SOCIAL } from "@/lib/site";
import { BrandLockup } from "@/components/BrandLockup";

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
            href={SOCIAL.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            YouTube
          </a>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Instagram
          </a>
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            X
          </a>
          <a
            href={SOCIAL.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Telegram
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            LinkedIn
          </a>
          <a
            href={SOCIAL.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            WhatsApp
          </a>
          <a
            href={PROGRAMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            tradingwithsidhant.com/programs
          </a>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            tradingwithsidhant.com
          </a>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link
            href="/posts"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            All Posts
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
          >
            Terms of Service
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-deep-slate/30">
            &copy; 2026 {LEGAL_ENTITY}
          </p>
          <Link
            href="/"
            className="group flex items-center gap-2 no-underline hover:no-underline"
          >
            {/*
              Below the fold, so no `priority`: preloading here would compete
              with the LCP image.

              size={26} rather than the old 20 because the name is derived from
              it at 0.55: 20 rendered an 11px brand name, below this footer's
              own 12px small print. 26 puts the name at 14.3px, level with the
              `text-sm` copyright line it sits beside, and scales the avatar
              with it so the lockup stays in proportion.

              The quiet look is `tone="muted"` now, not an opacity wrapper. The
              wrapper faded real text to 1.75:1 in light mode and 2.53:1 in
              dark; the tone mutes the decorative avatar with opacity and the
              name with the deep-slate token at 75% alpha, which measures
              5.26:1 and 8.82:1 against this gradient. Hover still resolves the
              whole lockup to full strength.
            */}
            <BrandLockup size={26} tone="muted" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
