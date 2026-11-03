import { describe, expect, it } from "vitest";
import { tagSlug, uniqueTagSlugs } from "./tags";

describe("tagSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(tagSlug("Bitcoin")).toBe("bitcoin");
    expect(tagSlug("Order Flow")).toBe("order-flow");
    expect(tagSlug("  Price   Action ")).toBe("price-action");
    expect(tagSlug("risk-management")).toBe("risk-management");
  });
  it("is idempotent", () => {
    expect(tagSlug(tagSlug("Bank Nifty"))).toBe("bank-nifty");
  });
});

describe("uniqueTagSlugs", () => {
  it("collapses case duplicates", () => {
    expect(uniqueTagSlugs(["Bitcoin", "bitcoin", "Order Flow", "order-flow", "Nifty"])).toEqual([
      "bitcoin",
      "nifty",
      "order-flow",
    ]);
  });
});
