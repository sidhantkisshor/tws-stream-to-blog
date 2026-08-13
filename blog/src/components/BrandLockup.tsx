import Image from "next/image";
import { BRAND_AVATAR, SITE_NAME } from "@/lib/site";

/**
 * Brand name font size as a fraction of the avatar diameter.
 *
 * The type is derived from `size` rather than set by a second prop so the
 * lockup stays one knob wide: the footer asks for a 20px mark and gets
 * proportionally smaller type automatically. A separate text-size prop could be
 * set out of step with the mark, which is exactly the drift this component
 * exists to prevent.
 */
const NAME_SIZE_RATIO = 0.55;

/**
 * How loudly the lockup sits on the page.
 *
 * `muted` exists for the footer, where the brand should recede rather than
 * compete with the links above it. It must NOT be done with a blanket
 * `opacity` wrapper: the name is real text, and fading text as a whole drags
 * its contrast below WCAG AA (deep-slate at 30% over the footer gradient is
 * 1.75:1 in light mode, 2.53:1 in dark). So the two halves are muted
 * separately: the avatar, which is decorative and carries no contrast
 * requirement, is dimmed with opacity, while the name is muted with the
 * `deep-slate` text token at 75% alpha, which still measures 5.26:1 in light
 * mode and 8.82:1 in dark against the footer gradient's end stop.
 */
type BrandTone = "default" | "muted";

interface BrandLockupProps {
  /** Avatar diameter in pixels. 28 sits level with the nav link cap height. */
  size?: number;
  className?: string;
  /**
   * Visual weight. `muted` recedes at rest and resolves to full strength on
   * hover, and expects a `group`-classed ancestor (both call sites wrap the
   * lockup in one) so hovering anywhere in the link brightens the whole mark.
   */
  tone?: BrandTone;
  /**
   * Preload the avatar. Only the nav should set this. The footer instance is
   * below the fold, so preloading it there would spend early bandwidth
   * competing with the page's real LCP image.
   */
  priority?: boolean;
}

/**
 * The brand lockup: the parent avatar beside the brand name set as text.
 *
 * The name is text, not a wordmark image, because the marketing site this blog
 * belongs to has no wordmark artwork either. Text also means the name inverts
 * with the theme for free, with no dark mode image swap and nothing to redraw
 * the next time the brand is renamed.
 *
 * The avatar ships its own white outline, so it needs no ring to separate it
 * from the page. It is decorative here: the adjacent text already names the
 * brand, and labelling the image as well would make a screen reader announce
 * the brand twice inside one link.
 */
export function BrandLockup({
  size = 28,
  className = "",
  tone = "default",
  priority = false,
}: BrandLockupProps) {
  const muted = tone === "muted";

  return (
    <span className={`inline-flex shrink-0 items-center gap-2 ${className}`}>
      <Image
        src={BRAND_AVATAR}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover${
          muted ? " opacity-60 transition-opacity group-hover:opacity-100" : ""
        }`}
        priority={priority}
      />
      <span
        /*
         * `deep-slate` is the body text token and it inverts under `.dark`
         * (#2C3539 on the light background, #F5F0E8 on the dark one), so the
         * name stays legible in both themes. A fixed hex would vanish in one.
         *
         * The muted tone stays on that same token and only lowers its alpha,
         * so it inverts with the theme too and keeps a measured AA pass in
         * both (see the BrandTone note above).
         */
        className={`font-satoshi font-bold tracking-tight whitespace-nowrap ${
          muted
            ? "text-deep-slate/75 transition-colors group-hover:text-deep-slate"
            : "text-deep-slate"
        }`}
        style={{ fontSize: size * NAME_SIZE_RATIO, lineHeight: 1.1 }}
      >
        {SITE_NAME}
      </span>
    </span>
  );
}
