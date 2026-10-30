import { describe, expect, it } from "vitest";
import { layoutShout, PHONE_SHOUT, textWidth, WIDE_SHOUT } from "./shout";

const LINE = "Shorting the 81,700 backtest gets you trapped before the dump";

describe("layoutShout", () => {
  it("never lets the longest line overflow its container", () => {
    for (const opts of [PHONE_SHOUT, WIDE_SHOUT]) {
      const { breaks, fraction } = layoutShout(LINE, opts);
      const words = LINE.split(" ");
      const cuts = [0, ...breaks, words.length];
      for (let i = 0; i < cuts.length - 1; i++) {
        expect(textWidth(words.slice(cuts[i], cuts[i + 1]).join(" ")) * fraction).toBeLessThanOrEqual(1);
      }
    }
  });

  it("uses more lines on a phone than on a wide screen", () => {
    expect(layoutShout(LINE, PHONE_SHOUT).breaks.length).toBeGreaterThan(layoutShout(LINE, WIDE_SHOUT).breaks.length);
  });

  it("caps a very short line", () => {
    expect(layoutShout("NO", WIDE_SHOUT).fraction).toBe(WIDE_SHOUT.maxFraction);
  });
});
