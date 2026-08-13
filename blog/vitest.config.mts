import { defineConfig } from "vitest/config";

/**
 * Vitest runs in the `node` environment, not jsdom. Every suite here asserts
 * over exported constants and pure functions, so paying for a DOM would only
 * slow the run and invite tests that render components instead of checking
 * logic. A suite that genuinely needs a DOM should opt in per file rather than
 * flip this default.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
