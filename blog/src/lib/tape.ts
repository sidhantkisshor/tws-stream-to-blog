/**
 * The tape: the real candles and levels of a session, read from the chart page
 * the pipeline already stores on R2 (`window.__TWS` inside each `*-chart-*.html`).
 * This is the photograph of the design. It is drawn from data, so it is never
 * illustrative, and a post without a chart simply has no tape.
 */

export interface TapeCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TapeLevelKind = "entry" | "target" | "stop" | "level";

export interface TapeLevel {
  price: number;
  title: string;
  kind: TapeLevelKind;
}

export interface Tape {
  candles: TapeCandle[];
  levels: TapeLevel[];
  sessStart: number | null;
  /** The receipt under the chart, built from the file's own words. */
  caption: string;
}

const MAX_CANDLES = 240;
const MAX_LEVELS = 12;
const MAX_LEVEL_TITLE = 48;
/** Real chart files are about 12 KB. Anything far larger is not one of them. */
const MAX_BYTES = 2_000_000;
/** The one bucket the pipeline writes charts to. This fetch runs on our server, so it is pinned. */
const CHART_HOST = "pub-51d4279cb27a40238df5b851ddc02ffa.r2.dev";

function isChartHost(ref: string): boolean {
  try {
    const url = new URL(ref);
    return url.protocol === "https:" && url.hostname === CHART_HOST;
  } catch {
    return false;
  }
}

function isCandle(c: unknown): c is TapeCandle {
  if (!c || typeof c !== "object") return false;
  const k = c as Record<string, unknown>;
  return [k.time, k.open, k.high, k.low, k.close].every(
    (v) => typeof v === "number" && Number.isFinite(v),
  );
}

function captionFrom(html: string, sessStart: number | null): string {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  const data = html.match(/Data:\s*([^.<]+)/)?.[1]?.trim() ?? "";
  const parts: string[] = [];
  if (title) parts.push(title.replace(/\s*\([A-Z0-9=._-]+\)/, "").replace(/\s+chart$/i, ""));
  if (data) parts.push(data);
  if (sessStart) {
    const day = new Date(sessStart * 1000).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    parts.push(`Session of ${day}`);
  }
  return parts.join(". ");
}

/** Never throws. Anything unexpected returns null and the page shows no tape. */
export function parseTape(html: string): Tape | null {
  const marker = "window.__TWS=";
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const open = start + marker.length;
  // The payload is plain JSON, so its end is the brace that balances the first.
  let depth = 0;
  let end = -1;
  let inString = false;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  if (end === -1) return null;

  try {
    const data = JSON.parse(html.slice(open, end)) as Record<string, unknown>;
    const candles = Array.isArray(data.candles) ? data.candles.filter(isCandle) : [];
    if (candles.length < 10) return null;
    const levels: TapeLevel[] = Array.isArray(data.levels)
      ? (data.levels as Record<string, unknown>[])
          .filter((l) => Number.isFinite(l?.price) && typeof l?.title === "string")
          .slice(0, MAX_LEVELS)
          .map((l) => ({
            price: l.price as number,
            title: (l.title as string).slice(0, MAX_LEVEL_TITLE),
            kind: (["entry", "target", "stop"].includes(l.kind as string)
              ? l.kind
              : "level") as TapeLevelKind,
          }))
      : [];
    const sessStart = typeof data.sessStart === "number" ? data.sessStart : null;
    return {
      candles: candles.slice(-MAX_CANDLES),
      levels,
      sessStart,
      caption: captionFrom(html, sessStart),
    };
  } catch {
    return null;
  }
}

export function chartUrl(sections: unknown): string | null {
  if (!Array.isArray(sections)) return null;
  for (const s of sections as { chartRef?: unknown }[]) {
    const ref = s?.chartRef;
    if (typeof ref === "string" && /-chart-[^/]*\.html$/.test(ref) && isChartHost(ref)) return ref;
  }
  return null;
}

/**
 * Chart files never change once written, so they cache for 30 days. A slow or
 * failed fetch costs the page its tape, never the page.
 */
export async function getTape(sections: unknown): Promise<Tape | null> {
  const url = chartUrl(sections);
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) return null;
    const html = await res.text();
    return html.length > MAX_BYTES ? null : parseTape(html);
  } catch {
    return null;
  }
}

/** The drawing, in a 1600 x 900 box. Candles use the upper part of the box. */
export const TAPE_W = 1600;
export const TAPE_H = 900;
const TOP = 70;
export const TAPE_CANDLE_BOTTOM = 385;
const BOTTOM = TAPE_CANDLE_BOTTOM;
const RIGHT_GUTTER = 40;

export interface TapeDrawing {
  up: string;
  down: string;
  levels: { y: number; title: string; kind: TapeLevelKind }[];
}

export function drawTape(tape: Tape, { levels: withLevels = true } = {}): TapeDrawing {
  const { candles } = tape;
  const levels = withLevels ? tape.levels : [];
  let lo = Infinity;
  let hi = -Infinity;
  for (const c of candles) {
    lo = Math.min(lo, c.low);
    hi = Math.max(hi, c.high);
  }
  // Only the first traded level stretches the scale, because it is the one the
  // plate labels. Any other level is drawn when it already falls on the chart,
  // so it cannot squash the candles or run behind the title.
  const main = levels.find((l) => l.kind !== "level");
  if (main) {
    lo = Math.min(lo, main.price);
    hi = Math.max(hi, main.price);
  }
  const span = hi - lo || 1;
  const y = (price: number) => +(BOTTOM - ((price - lo) / span) * (BOTTOM - TOP)).toFixed(1);

  const usable = TAPE_W - RIGHT_GUTTER;
  const pitch = usable / candles.length;
  const body = Math.max(2, +(pitch * 0.62).toFixed(1));
  const paths = { up: "", down: "" };

  candles.forEach((c, i) => {
    const x = +(i * pitch + (pitch - body) / 2).toFixed(1);
    const mid = +(x + body / 2).toFixed(1);
    const top = y(Math.max(c.open, c.close));
    const bottom = y(Math.min(c.open, c.close));
    const height = Math.max(1.5, +(bottom - top).toFixed(1));
    const wick = `M${+(mid - 0.75).toFixed(2)} ${y(c.high)}h1.5V${y(c.low)}h-1.5Z`;
    const rect = `M${x} ${top}h${body}v${height}h-${body}Z`;
    paths[c.close >= c.open ? "up" : "down"] += wick + rect;
  });

  return {
    up: paths.up,
    down: paths.down,
    levels: levels
      .filter((l) => l.price >= lo && l.price <= hi)
      .map((l) => ({ y: y(l.price), title: l.title, kind: l.kind })),
  };
}
