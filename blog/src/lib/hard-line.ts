import { plainDashes } from "./display";

/**
 * Picks one post's hard line: the sentence the page shouts.
 *
 * It only ever chooses words the post already contains (a section heading or
 * the first sentence of a takeaway), verbatim apart from dash stripping. Nothing
 * is rewritten, shortened or invented, so a shout can never claim more than the
 * post does. Returns null when no line is short and blunt enough, and the page
 * then shows no shout rather than a weak one.
 */

export const MAX_HARD_LINE = 64;

const BLUNT =
  /\b(not|never|no|nothing|cannot|can't|won't|don't|trap\w*|stopped|stop|lost|loss|losses|fail\w*|fake\w*|skip\w*|forc\w*|wrong|cost|kill\w*|blow\w*|refus\w*|poor|weak|chas\w*)\b/i;
const VERB =
  /\b(is|are|was|were|gets?|got|did|does|do|not|never|can|cannot|can't|won't|don't|needs?|needed|made|makes?|shows?|showed|stopped|kept|keeps?|fails?|failed|exposed?|changed?|removes?|fixes|counts|earns?|earned|offered|protects?|protected|matters?|mattered|lost|hit|flagged|swept|reached|rejected|skipped|supported|holds?|undo|led)\b/i;
const QUESTION = /\?\s*$/;
const OPENS_SOFT = /^(why|how|what|when)\b/i;

interface SectionLike {
  heading?: unknown;
  keyTakeaway?: unknown;
}

function firstSentence(text: string): string {
  return text.trim().split(/(?<=[.!?])\s+/)[0] ?? "";
}

function score(line: string): number {
  let s = 0;
  if (BLUNT.test(line)) s += 3;
  if (/\d/.test(line)) s += 2;
  if (OPENS_SOFT.test(line)) s -= 2;
  s -= Math.max(0, line.length - 48) / 8;
  return s;
}

export function hardLine(sections: unknown): string | null {
  if (!Array.isArray(sections)) return null;
  const candidates: string[] = [];

  for (const raw of sections as SectionLike[]) {
    if (typeof raw?.heading === "string") {
      const heading = plainDashes(raw.heading.trim());
      if (
        heading.length <= MAX_HARD_LINE &&
        !QUESTION.test(heading) &&
        VERB.test(heading)
      ) {
        candidates.push(heading);
      }
    }
    if (typeof raw?.keyTakeaway === "string") {
      const sentence = plainDashes(firstSentence(raw.keyTakeaway));
      if (sentence.length > 0 && sentence.length <= MAX_HARD_LINE && !QUESTION.test(sentence)) {
        candidates.push(sentence);
      }
    }
  }

  if (candidates.length === 0) return null;
  // Array order is the tie break, so the earlier line in the post wins.
  return candidates.reduce((best, c) => (score(c) > score(best) ? c : best));
}
