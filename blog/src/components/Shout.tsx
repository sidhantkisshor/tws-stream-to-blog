import { Fragment } from "react";
import { layoutShout, PHONE_SHOUT, WIDE_SHOUT } from "@/lib/shout";

/**
 * The one condensed black line a page gets. Words stay in reading order in a
 * single element, with a separate set of line breaks per breakpoint, so screen
 * readers and crawlers get one clean sentence. Case comes from CSS, so the text
 * in the document is the post's own.
 */
export function Shout({
  text,
  as: Tag = "p",
  className = "",
  hot = "number",
  wideMin,
}: {
  text: string;
  as?: "p" | "h1" | "h2";
  className?: string;
  /** What takes the hot colour: the first number, or the last word. */
  hot?: "number" | "last";
  /** Raises the wide screen minimum size, for a page masthead that should wrap and fill. */
  wideMin?: number;
}) {
  const words = text.trim().split(/\s+/);
  const phone = layoutShout(text, PHONE_SHOUT);
  const wide = layoutShout(text, wideMin ? { ...WIDE_SHOUT, minFraction: wideMin, maxFraction: 0.2 } : WIDE_SHOUT);
  const hotIndex = hot === "last" ? words.length - 1 : words.findIndex((w) => /\d/.test(w));

  return (
    <div className={`shout-box ${className}`}>
      <Tag
        className="shout"
        style={{ "--shout-phone": phone.fraction, "--shout-wide": wide.fraction } as React.CSSProperties}
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            {phone.breaks.includes(i) && <br className="shout-br-phone" />}
            {wide.breaks.includes(i) && <br className="shout-br-wide" />}
            {i === hotIndex ? <span className="shout-hot">{word}</span> : word}
          </Fragment>
        ))}
      </Tag>
    </div>
  );
}
