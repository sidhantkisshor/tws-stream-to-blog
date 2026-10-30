import { drawTape, TAPE_H, TAPE_W, type Tape } from "@/lib/tape";

/** Rough width of one label character, for sizing the price tag. */
const TAG_CHAR = 12.5;

/**
 * The real candles of a session, drawn as a full bleed dark plate. Monochrome so
 * it reads as a photograph, with one hot line for the level that was traded. It
 * is decorative for assistive tech: the interactive chart further down the post
 * holds the same data, and the caption names the source.
 */
export function TapePlate({ tape, tags = true }: { tape: Tape; tags?: boolean }) {
  const drawing = drawTape(tape);
  const taggedIndex = drawing.levels.findIndex((l) => l.kind !== "level");
  return (
    <svg
      aria-hidden="true"
      className="tape"
      viewBox={`0 0 ${TAPE_W} ${TAPE_H}`}
      preserveAspectRatio="xMaxYMin slice"
    >
      <path d={drawing.up} className="tape-up" />
      <path d={drawing.down} className="tape-down" />
      {drawing.levels.map((level, i) => {
        const traded = level.kind !== "level";
        return (
          <g key={i} className={traded ? "tape-level-hot" : "tape-level"}>
            <line x1="0" x2={TAPE_W} y1={level.y} y2={level.y} />
            {tags && i === taggedIndex && (
              <>
                <rect
                  x={TAPE_W - level.title.length * TAG_CHAR - 40}
                  y={level.y - 20}
                  width={level.title.length * TAG_CHAR + 40}
                  height={40}
                />
                <text x={TAPE_W - 20} y={level.y + 8} textAnchor="end">
                  {level.title}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
