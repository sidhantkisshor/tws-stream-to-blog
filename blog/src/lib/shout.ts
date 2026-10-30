/**
 * Line breaks and font size for the shout, the one condensed black all-caps line
 * on a page. Computed on the server from the font's real advance widths, so the
 * longest line fills its container exactly with no JavaScript and no layout
 * shift.
 */

/** Advance widths in em, read from Archivo at wdth 62, wght 900. */
const WIDTHS: Record<string, number> = {
  A: 0.53, B: 0.498, C: 0.513, D: 0.509, E: 0.462, F: 0.402, G: 0.543, H: 0.513,
  I: 0.263, J: 0.453, K: 0.51, L: 0.432, M: 0.705, N: 0.518, O: 0.554, P: 0.485,
  Q: 0.554, R: 0.509, S: 0.469, T: 0.475, U: 0.503, V: 0.49, W: 0.729, X: 0.5,
  Y: 0.481, Z: 0.475, "0": 0.444, "1": 0.371, "2": 0.427, "3": 0.44, "4": 0.435,
  "5": 0.437, "6": 0.445, "7": 0.396, "8": 0.432, "9": 0.445, " ": 0.11, ",": 0.222,
  ".": 0.222, ":": 0.222, ";": 0.222, "'": 0.213, "%": 0.742, $: 0.4, "-": 0.24,
  "&": 0.566, "?": 0.424, "!": 0.266, "/": 0.278, "(": 0.389, ")": 0.389,
  "’": 0.204, "₹": 0.553,
};
const DEFAULT_WIDTH = 0.5;
/** Matches the -0.01em tracking in globals.css. */
const TRACKING = -0.01;
/** Leaves a sliver for kerning differences so a line can never overflow. */
const SAFETY = 0.98;

export function textWidth(text: string): number {
  let width = 0;
  for (const ch of text.toUpperCase()) width += (WIDTHS[ch] ?? DEFAULT_WIDTH) + TRACKING;
  return width;
}

export interface ShoutLayout {
  /** Word indexes that start a new line. */
  breaks: number[];
  /** Font size as a fraction of container width. */
  fraction: number;
}

/** Splits words into exactly `count` lines, minimising the longest line. */
function bestSplit(words: string[], count: number): { breaks: number[]; longest: number } {
  const n = words.length;
  const span = (from: number, to: number) => textWidth(words.slice(from, to).join(" "));
  const memo = new Map<string, { breaks: number[]; longest: number }>();

  function solve(from: number, lines: number): { breaks: number[]; longest: number } {
    if (lines === 1) return { breaks: [], longest: span(from, n) };
    const key = `${from}:${lines}`;
    const seen = memo.get(key);
    if (seen) return seen;
    let best = { breaks: [] as number[], longest: Infinity };
    for (let end = from + 1; end <= n - (lines - 1); end++) {
      const rest = solve(end, lines - 1);
      const longest = Math.max(span(from, end), rest.longest);
      if (longest < best.longest) best = { breaks: [end, ...rest.breaks], longest };
    }
    memo.set(key, best);
    return best;
  }

  return solve(0, count);
}

/**
 * Uses the fewest lines that reach `minFraction`. A short line stops at
 * `maxFraction` rather than growing without limit.
 */
export function layoutShout(
  text: string,
  { minFraction, maxFraction, maxLines }: { minFraction: number; maxFraction: number; maxLines: number },
): ShoutLayout {
  const words = text.trim().split(/\s+/);
  let chosen = { breaks: [] as number[], longest: textWidth(text) };
  for (let lines = 1; lines <= Math.min(maxLines, words.length); lines++) {
    chosen = bestSplit(words, lines);
    if (SAFETY / chosen.longest >= minFraction) break;
  }
  return {
    breaks: chosen.breaks,
    fraction: Math.min(maxFraction, SAFETY / chosen.longest),
  };
}

export const PHONE_SHOUT = { minFraction: 0.17, maxFraction: 0.3, maxLines: 6 };
export const WIDE_SHOUT = { minFraction: 0.065, maxFraction: 0.11, maxLines: 3 };
