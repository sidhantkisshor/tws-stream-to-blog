import { describe, expect, it } from "vitest";
import { chartUrl, drawTape, parseTape } from "./tape";

const candles = Array.from({ length: 12 }, (_, i) => ({
  time: 1793216700 + i * 900,
  open: 100 + i,
  high: 103 + i,
  low: 99 + i,
  close: 101 + i,
}));

function page(payload: unknown) {
  return `<html><head><title>Bitcoin (BTCUSDT) 15 minute chart</title></head><body><div>Data: Binance spot. Educational review.</div><script>window.__TWS=${JSON.stringify(payload)};(function(){})();</script></body></html>`;
}

describe("parseTape", () => {
  it("reads candles, levels and the receipt", () => {
    const tape = parseTape(
      page({
        candles,
        levels: [{ price: 105, title: "Entry (short) 105", kind: "entry" }, { price: 500, title: "Far", kind: "weird" }],
        sessStart: 1793252254,
      }),
    );
    expect(tape?.candles).toHaveLength(12);
    expect(tape?.levels[0].kind).toBe("entry");
    expect(tape?.levels[1].kind).toBe("level");
    expect(tape?.caption).toBe("Bitcoin 15 minute. Binance spot. Session of 29 Oct 2026");
  });

  it("survives a brace inside a string", () => {
    expect(parseTape(page({ candles, levels: [{ price: 105, title: "a } b", kind: "level" }] }))?.levels[0].title).toBe("a } b");
  });

  it("returns null on anything it cannot trust", () => {
    expect(parseTape("<html>orderflow lab</html>")).toBeNull();
    expect(parseTape("window.__TWS={broken")).toBeNull();
    expect(parseTape(page({ candles: candles.slice(0, 3) }))).toBeNull();
  });
});

describe("chartUrl", () => {
  it("takes only a stored chart page", () => {
    const good = "https://pub-51d4279cb27a40238df5b851ddc02ffa.r2.dev/givi7ocg6tm-btc-chart-u2gxbj.html";
    expect(chartUrl([{ chartRef: "/demos/orderflow.html" }, { chartRef: good }])).toBe(good);
    expect(chartUrl([{ chartRef: "https://evil.example/x-chart-y.html" }])).toBeNull();
    expect(chartUrl([{ chartRef: "https://other-bucket.r2.dev/x-chart-y.html" }])).toBeNull();
    expect(chartUrl([{ chartRef: "https://pub-abc.r2.dev/a-1-illustration.png" }])).toBeNull();
  });
});

describe("drawTape", () => {
  it("keeps a far discussed level off the scale but stretches for an entry", () => {
    const drawing = drawTape({
      candles,
      levels: [
        { price: 900, title: "Discussed", kind: "level" },
        { price: 90, title: "Entry", kind: "entry" },
      ],
      sessStart: null,
      caption: "",
    });
    expect(drawing.levels.map((l) => l.title)).toEqual(["Entry"]);
    expect(drawing.up.length).toBeGreaterThan(0);
  });
});
