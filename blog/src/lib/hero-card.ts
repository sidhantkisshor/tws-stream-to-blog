/**
 * Pure helpers for the takeaway hero card (POST /api/hero-card).
 * Kept free of React and next/og so they can be unit tested.
 */

export interface HeroCandle {
  t: number; // unix seconds
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface HeroLevel {
  price: number;
  label: string;
}

export interface HeroChart {
  symbol: string;
  name: string;
  tf: string;
  candles: HeroCandle[];
  levels: HeroLevel[];
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroCardInput {
  headline: string;
  kicker: string;
  stats: HeroStat[];
  chart: HeroChart | null;
  footer: string;
}

export const MAX_CANDLES = 120;
export const MAX_STATS = 3;
export const MAX_LEVELS = 4;
export const MAX_HEADLINE = 90;

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  const s = v.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/**
 * Validates and bounds an arbitrary JSON body. Returns null when there is no
 * usable headline, which is the only field a card cannot do without.
 */
export function normalizeHeroCard(body: unknown): HeroCardInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const headline = str(b.headline, MAX_HEADLINE);
  if (!headline) return null;

  const stats: HeroStat[] = Array.isArray(b.stats)
    ? b.stats
        .map((s) => {
          const o = (s ?? {}) as Record<string, unknown>;
          return { value: str(o.value, 14), label: str(o.label, 28) };
        })
        .filter((s) => s.value && s.label)
        .slice(0, MAX_STATS)
    : [];

  let chart: HeroChart | null = null;
  if (b.chart && typeof b.chart === "object") {
    const c = b.chart as Record<string, unknown>;
    const raw = Array.isArray(c.candles) ? c.candles : [];
    const candles: HeroCandle[] = [];
    for (const r of raw) {
      const o = (r ?? {}) as Record<string, unknown>;
      const t = num(o.t), op = num(o.o), h = num(o.h), l = num(o.l), cl = num(o.c);
      if (t === null || op === null || h === null || l === null || cl === null) continue;
      if (h < l) continue;
      candles.push({ t, o: op, h, l, c: cl });
    }
    candles.sort((a, z) => a.t - z.t);
    const levels: HeroLevel[] = Array.isArray(c.levels)
      ? c.levels
          .map((lv) => {
            const o = (lv ?? {}) as Record<string, unknown>;
            const price = num(o.price);
            return price === null ? null : { price, label: str(o.label, 30) };
          })
          .filter((x): x is HeroLevel => !!x)
          .slice(0, MAX_LEVELS)
      : [];
    if (candles.length >= 8) {
      chart = {
        symbol: str(c.symbol, 16) || "",
        name: str(c.name, 24) || str(c.symbol, 16) || "Chart",
        tf: str(c.tf, 6) || "",
        candles: downsample(candles, MAX_CANDLES),
        levels,
      };
    }
  }

  return {
    headline,
    kicker: str(b.kicker, 48),
    stats,
    chart,
    footer: str(b.footer, 48) || "Live stream insights, distilled",
  };
}

/** Merge neighbouring candles so at most `max` remain, preserving OHLC. */
export function downsample(candles: HeroCandle[], max: number): HeroCandle[] {
  if (candles.length <= max) return candles;
  const group = Math.ceil(candles.length / max);
  const out: HeroCandle[] = [];
  for (let i = 0; i < candles.length; i += group) {
    const chunk = candles.slice(i, i + group);
    out.push({
      t: chunk[0].t,
      o: chunk[0].o,
      c: chunk[chunk.length - 1].c,
      h: Math.max(...chunk.map((x) => x.h)),
      l: Math.min(...chunk.map((x) => x.l)),
    });
  }
  return out;
}

export function formatPrice(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 10000) return Math.round(v).toLocaleString("en-US");
  if (abs >= 1000) return v.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  if (abs >= 100) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return v.toPrecision(3);
}

export interface ChartGeometry {
  width: number;
  height: number;
  candles: { x: number; w: number; yO: number; yC: number; yH: number; yL: number; up: boolean }[];
  levels: { y: number; label: string; price: number }[];
  ticks: { y: number; label: string }[];
  lastClose: { y: number; label: string; up: boolean } | null;
}

/**
 * Scales candles and levels into pixel space for an SVG of the given size.
 * Levels far outside the candle range are dropped rather than clamped.
 */
export function layoutChart(chart: HeroChart, width: number, height: number): ChartGeometry {
  const padL = 12, padR = 84, padT = 18, padB = 14;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const all = chart.candles;
  let lo = Math.min(...all.map((c) => c.l));
  let hi = Math.max(...all.map((c) => c.h));
  const inRange = chart.levels.filter((lv) => lv.price >= lo * 0.97 && lv.price <= hi * 1.03);
  for (const lv of inRange) {
    if (lv.price < lo) lo = lv.price;
    if (lv.price > hi) hi = lv.price;
  }
  const span = hi - lo || Math.abs(hi) * 0.01 || 1;
  lo -= span * 0.06;
  hi += span * 0.06;
  const y = (p: number) => padT + ((hi - p) / (hi - lo)) * plotH;
  const n = all.length;
  const slot = plotW / n;
  const w = Math.max(2, Math.min(14, slot * 0.66));
  const candles = all.map((c, i) => {
    const x = padL + slot * i + slot / 2;
    return { x, w, yO: y(c.o), yC: y(c.c), yH: y(c.h), yL: y(c.l), up: c.c >= c.o };
  });
  const levels = inRange.map((lv) => ({ y: y(lv.price), label: lv.label, price: lv.price }));
  const ticks = [hi - span * 0.06, (hi + lo) / 2, lo + span * 0.06].map((p) => ({ y: y(p), label: formatPrice(p) }));
  const last = all[n - 1];
  const lastClose = last ? { y: y(last.c), label: formatPrice(last.c), up: last.c >= last.o } : null;
  return { width, height, candles, levels, ticks, lastClose };
}
