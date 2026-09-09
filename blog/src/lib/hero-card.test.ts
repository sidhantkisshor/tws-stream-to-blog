import { describe, expect, it } from "vitest";
import {
  MAX_CANDLES,
  MAX_STATS,
  downsample,
  formatPrice,
  layoutChart,
  normalizeHeroCard,
  type HeroCandle,
  type HeroChart,
} from "./hero-card";

/** Builds `count` sequential 15 minute candles with a small, valid wick/body. */
function makeCandles(count: number, base = 100): HeroCandle[] {
  const candles: HeroCandle[] = [];
  for (let i = 0; i < count; i++) {
    const o = base + i;
    const c = o + 0.5;
    candles.push({ t: 1757300400 + i * 900, o, c, h: Math.max(o, c) + 1, l: Math.min(o, c) - 1 });
  }
  return candles;
}

describe("normalizeHeroCard", () => {
  it("rejects a body with no headline", () => {
    expect(normalizeHeroCard({})).toBeNull();
  });

  it("rejects a body where headline is an empty or whitespace only string", () => {
    expect(normalizeHeroCard({ headline: "" })).toBeNull();
    expect(normalizeHeroCard({ headline: "   " })).toBeNull();
  });

  it("rejects a non object body", () => {
    expect(normalizeHeroCard(null)).toBeNull();
    expect(normalizeHeroCard("headline only")).toBeNull();
    expect(normalizeHeroCard(undefined)).toBeNull();
  });

  it("accepts a body with just a headline", () => {
    const card = normalizeHeroCard({ headline: "The sweep that was not worth shorting" });
    expect(card).not.toBeNull();
    expect(card?.headline).toBe("The sweep that was not worth shorting");
    expect(card?.chart).toBeNull();
    expect(card?.stats).toEqual([]);
  });

  it("bounds the stats array to MAX_STATS items", () => {
    const stats = Array.from({ length: 6 }, (_, i) => ({ value: `v${i}`, label: `l${i}` }));
    const card = normalizeHeroCard({ headline: "Five stats offered", stats });
    expect(card?.stats).toHaveLength(MAX_STATS);
    expect(card?.stats).toEqual([
      { value: "v0", label: "l0" },
      { value: "v1", label: "l1" },
      { value: "v2", label: "l2" },
    ]);
  });

  it("drops stats missing a value or a label", () => {
    const stats = [
      { value: "78,590", label: "Rejection level" },
      { value: "", label: "No value" },
      { value: "No label" },
      { value: "78,400", label: "Target" },
    ];
    const card = normalizeHeroCard({ headline: "Some stats are malformed", stats });
    expect(card?.stats).toEqual([
      { value: "78,590", label: "Rejection level" },
      { value: "78,400", label: "Target" },
    ]);
  });

  it("drops malformed candle entries and keeps the valid ones", () => {
    const valid = makeCandles(8);
    const candles = [
      ...valid,
      { t: valid[0].t + 900 * 8, o: 1, h: 2, l: 3, c: 1 }, // h < l, malformed
      { t: valid[0].t + 900 * 9, o: 1, h: 2, c: 1 }, // missing l
      { t: "not a number", o: 1, h: 2, l: 0, c: 1 }, // non numeric t
    ];
    const card = normalizeHeroCard({
      headline: "Malformed candles get dropped",
      chart: { symbol: "BTCUSDT", name: "Bitcoin", tf: "15m", candles, levels: [] },
    });
    // exactly the 8 well formed candles survive, so a chart is produced
    expect(card?.chart?.candles).toHaveLength(8);
  });

  it("omits the chart when fewer than 8 valid candles are supplied", () => {
    const card = normalizeHeroCard({
      headline: "Only seven candles, no chart",
      chart: { symbol: "BTCUSDT", name: "Bitcoin", tf: "15m", candles: makeCandles(7), levels: [] },
    });
    expect(card?.chart).toBeNull();
  });

  it("produces a chart once at least 8 valid candles are supplied", () => {
    const card = normalizeHeroCard({
      headline: "Eight candles, chart appears",
      chart: { symbol: "BTCUSDT", name: "Bitcoin", tf: "15m", candles: makeCandles(8), levels: [] },
    });
    expect(card?.chart).not.toBeNull();
    expect(card?.chart?.candles).toHaveLength(8);
  });

  it("downsamples to MAX_CANDLES while preserving the true high and low of each merged window", () => {
    const candles = makeCandles(130);
    // group size = ceil(130 / 120) = 2, so index 10 and 11 merge into output group 5.
    candles[10] = { ...candles[10], h: 9999 };
    candles[11] = { ...candles[11], l: 1 };
    const card = normalizeHeroCard({
      headline: "One hundred and thirty candles, downsampled",
      chart: { symbol: "BTCUSDT", name: "Bitcoin", tf: "15m", candles, levels: [] },
    });
    const out = card?.chart?.candles ?? [];
    expect(out.length).toBeLessThanOrEqual(MAX_CANDLES);
    expect(out.length).toBeLessThan(130);
    const merged = out[5];
    expect(merged.h).toBe(9999);
    expect(merged.l).toBe(1);
  });

  it("does not downsample when candle count is already within MAX_CANDLES", () => {
    const card = normalizeHeroCard({
      headline: "One hundred candles, no downsampling needed",
      chart: { symbol: "BTCUSDT", name: "Bitcoin", tf: "15m", candles: makeCandles(100), levels: [] },
    });
    expect(card?.chart?.candles).toHaveLength(100);
  });
});

describe("downsample", () => {
  it("returns the input unchanged when already at or under the cap", () => {
    const candles = makeCandles(10);
    expect(downsample(candles, 120)).toEqual(candles);
  });

  it("caps the total number of candles at max", () => {
    const candles = makeCandles(250);
    const out = downsample(candles, MAX_CANDLES);
    expect(out.length).toBeLessThanOrEqual(MAX_CANDLES);
  });
});

describe("layoutChart", () => {
  const chart: HeroChart = {
    symbol: "BTCUSDT",
    name: "Bitcoin",
    tf: "15m",
    candles: makeCandles(60, 78500),
    levels: [
      { price: 78590, label: "Range high" },
      { price: 78400, label: "Target" },
      { price: 1, label: "Absurdly far below, must be dropped" },
      { price: 500000, label: "Absurdly far above, must be dropped" },
    ],
  };

  it("keeps every candle y coordinate within [0, height]", () => {
    const height = 400;
    const geometry = layoutChart(chart, 540, height);
    for (const c of geometry.candles) {
      for (const y of [c.yO, c.yC, c.yH, c.yL]) {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(height);
      }
    }
  });

  it("drops price levels far outside the candle range instead of plotting them", () => {
    const geometry = layoutChart(chart, 540, 400);
    const plottedPrices = geometry.levels.map((lv) => lv.price);
    expect(plottedPrices).toContain(78590);
    expect(plottedPrices).toContain(78400);
    expect(plottedPrices).not.toContain(1);
    expect(plottedPrices).not.toContain(500000);
    expect(geometry.levels).toHaveLength(2);
  });
});

describe("formatPrice", () => {
  it("formats a whole number over 10,000 with a thousands separator and no decimals", () => {
    expect(formatPrice(78590)).toBe("78,590");
  });

  it("formats a fractional value under 1,000 to 2 decimal places", () => {
    expect(formatPrice(3.14159)).toBe("3.14");
  });
});
