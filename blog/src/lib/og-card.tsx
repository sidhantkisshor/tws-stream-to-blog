import { readFile } from "node:fs/promises";
import path from "node:path";
import { layoutShout } from "./shout";
import { drawTape, TAPE_H, TAPE_W, type Tape } from "./tape";
import { SITE_NAME } from "./site";

/**
 * The share card: what WhatsApp and Instagram DMs show before the page does.
 * The same two ingredients as the page, the shouted line and the real candles.
 * Stored hero images never appear here: they are either the old cream card or a
 * YouTube thumbnail with rupee figures on it.
 */

export const OG_SIZE = { width: 1200, height: 630 };

const MARKET = "#0b0b0c";
const PAGE = "#f4f5f7";
const INK = "#0d0f13";
const HOT = "#ff4a12";
const PAD = 56;

let fontCache: Promise<{ name: string; data: Buffer; weight: 500 | 900; style: "normal" }[]> | null = null;

export function ogFonts() {
  if (!fontCache) {
    const dir = path.join(process.cwd(), "src", "app", "fonts", "og");
    fontCache = Promise.all([
      readFile(path.join(dir, "Archivo-CondensedBlack.ttf")).then((data) => ({
        name: "Shout",
        data,
        weight: 900 as const,
        style: "normal" as const,
      })),
      readFile(path.join(dir, "Satoshi-Medium.ttf")).then((data) => ({
        name: "Satoshi",
        data,
        weight: 500 as const,
        style: "normal" as const,
      })),
    ]).catch((e) => {
      fontCache = null;
      throw e;
    });
  }
  return fontCache;
}

function tapeImage(tape: Tape): string {
  const d = drawTape(tape);
  const levels = d.levels
    .filter((l) => l.kind !== "level")
    .map((l) => `<rect x="0" y="${l.y}" width="${TAPE_W}" height="3" fill="${HOT}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TAPE_W} ${TAPE_H}"><path d="${d.up}" fill="#dfe2e7"/><path d="${d.down}" fill="#6d737d"/>${levels}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** One line per div, because the renderer has no text wrapping we can fit against. */
function shoutLines(text: string) {
  const width = OG_SIZE.width - PAD * 2;
  const { breaks, fraction } = layoutShout(text, { minFraction: 0.14, maxFraction: 0.24, maxLines: 4 });
  const words = text.trim().toUpperCase().split(/\s+/);
  const cuts = [0, ...breaks, words.length];
  const lines = cuts.slice(0, -1).map((start, i) => words.slice(start, cuts[i + 1]));
  const room = OG_SIZE.height - PAD * 2 - 60;
  return { lines, fontSize: Math.floor(Math.min(fraction * width, room / (lines.length * 0.92))) };
}

export function OgCard({ line, tag, tape }: { line: string; tag?: string; tape: Tape | null }) {
  const { lines, fontSize } = shoutLines(line);
  const dark = Boolean(tape);
  const firstNumber = lines.flat().findIndex((w) => /\d/.test(w));
  const lineStarts = lines.map((_, i) => lines.slice(0, i).flat().length);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: dark ? MARKET : PAGE,
      }}
    >
      {tape && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tapeImage(tape)}
          alt=""
          width={1200}
          height={675}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 675, opacity: 0.5 }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: PAD,
        }}
      >
        {lines.map((words, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: fontSize * 0.11,
              fontFamily: "Shout",
              fontWeight: 900,
              fontSize,
              lineHeight: 0.92,
              color: dark ? PAGE : INK,
            }}
          >
            {words.map((word, j) => (
              <span key={j} style={{ color: lineStarts[i] + j === firstNumber ? HOT : undefined }}>
                {word}
              </span>
            ))}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
            fontFamily: "Satoshi",
            fontWeight: 500,
            fontSize: 26,
            color: dark ? "#c9ced6" : "#5c636e",
          }}
        >
          <span>{SITE_NAME}</span>
          {tag && <span>{tag}</span>}
        </div>
      </div>
    </div>
  );
}
