import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { PROGRAMS_URL, LEGAL_ENTITY, SOCIAL, SITE_NAME } from "@/lib/site";
import { tagLabel } from "@/lib/display";
import { FamilyStrip } from "@/components/FamilyStrip";
import { Shout } from "@/components/Shout";

const SMALL = "text-[0.9375rem] text-mute no-underline transition-colors hover:text-ink";

export async function Footer() {
  const tags = await getAllTags();

  const socials = [
    { label: "YouTube", href: SOCIAL.youtube },
    { label: "Instagram", href: SOCIAL.instagram },
    { label: "X", href: SOCIAL.x },
    { label: "Telegram", href: SOCIAL.telegram },
    { label: "LinkedIn", href: SOCIAL.linkedin },
    { label: "WhatsApp", href: SOCIAL.whatsapp },
  ];

  return (
    <footer className="border-t border-rule px-[var(--gutter)] pb-8 pt-12">
      <FamilyStrip />
      {tags.length > 0 && (
        <nav aria-label="All topics" className="mb-8 flex flex-wrap gap-x-5 gap-y-1.5">
          {tags.map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className={SMALL}>
              {tagLabel(tag)}
            </Link>
          ))}
        </nav>
      )}
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={SMALL}>
            {s.label}
          </a>
        ))}
        <a href={PROGRAMS_URL} className={SMALL}>
          tradingwithsidhant.com/programs
        </a>
      </div>
      <div className="mb-10 flex flex-wrap gap-x-5 gap-y-1.5">
        <Link href="/posts" className={SMALL}>
          All Posts
        </Link>
        <Link href="/privacy" className={SMALL}>
          Privacy Policy
        </Link>
        <Link href="/terms" className={SMALL}>
          Terms of Service
        </Link>
      </div>
      <Link href="/" aria-label={SITE_NAME} className="block no-underline">
        <Shout text={SITE_NAME} />
      </Link>
      <p className="label mt-4 text-mute">&copy; 2026 {LEGAL_ENTITY}</p>
    </footer>
  );
}
