import Link from "next/link";
import { Shout } from "./Shout";
import { TapePlate } from "./TapePlate";
import { plainDashes, tagLabel } from "@/lib/display";
import type { Tape } from "@/lib/tape";

/**
 * A post's hard line over its own candles, breaking out of the sheet to full
 * width. The margins undo the sheet's left offset and padding, so they must
 * match `.sheet` in globals.css.
 */
export function HardLineBand({
  slug,
  title,
  tag,
  line,
  tape,
}: {
  slug: string;
  title: string;
  tag?: string;
  line: string;
  tape: Tape;
}) {
  return (
    <Link
      href={`/posts/${slug}`}
      className="band on-market plate my-12 block no-underline md:my-16"
      style={{ minHeight: 0 }}
    >
      <TapePlate tape={tape} strip />
      <div className="px-[var(--gutter)] pb-10 pt-40 md:pb-14 md:pt-72">
        <Shout text={line} />
        <p className="mt-5 max-w-[60ch] text-base text-white/80">
          {tag ? `${tagLabel(tag)}. ` : ""}
          <span className="underline decoration-white/40 underline-offset-4">{plainDashes(title)}</span>
        </p>
      </div>
    </Link>
  );
}
