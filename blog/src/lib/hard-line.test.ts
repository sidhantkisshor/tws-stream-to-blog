import { describe, expect, it } from "vitest";
import { hardLine, MAX_HARD_LINE } from "./hard-line";
import { plainDashes } from "./display";

describe("hardLine", () => {
  it("prefers the blunt line with a number", () => {
    expect(
      hardLine([
        { heading: "Volume bubbles at a threshold show what really moves price" },
        { heading: "Shorting the 81,700 backtest gets you trapped before the dump" },
      ]),
    ).toBe("Shorting the 81,700 backtest gets you trapped before the dump");
  });

  it("never picks a question, or a line over the limit", () => {
    const long = "This heading does not fit because it is much longer than the limit allows for";
    expect(long.length).toBeGreaterThan(MAX_HARD_LINE);
    expect(hardLine([{ heading: "Why does the obvious outcome often reverse?" }, { heading: long }])).toBeNull();
  });

  it("returns only words the post contains", () => {
    expect(hardLine([{ heading: "Setup notes", keyTakeaway: "Define your stop before your entry. Then wait for it." }])).toBe(
      "Define your stop before your entry.",
    );
  });

  it("returns null with no usable content", () => {
    expect(hardLine(null)).toBeNull();
    expect(hardLine([{ heading: "The Trade Setup" }])).toBeNull();
  });
});

describe("plainDashes", () => {
  it("turns dashes into commas and ranges into 'to'", () => {
    expect(plainDashes("Trapped at 52000 \u2014 Here Is How")).toBe("Trapped at 52000, Here Is How");
    expect(plainDashes("11 PM \u2013 8 AM")).toBe("11 PM to 8 AM");
    expect(plainDashes("sessions \u2013 learn when")).toBe("sessions, learn when");
  });
});
