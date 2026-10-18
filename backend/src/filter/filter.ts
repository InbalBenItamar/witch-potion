import {
  WATER,
  isApproved,
  hasTag,
  VERB,
  type FeelingTag,
} from "../data/ingredient.js";
import type { Candidate, Potion, Step } from "../type/potion.js";

/**
 * The filter: the one safety net every potion crosses, on both generator paths.
 * It runs the five checks from `.doc/architecture.md`, in order. Checks 2–5 and
 * the two discard conditions in check 1 discard the whole candidate rather than
 * repair it — a discarded candidate falls through to the offline generator
 * (which on this task *is* the candidate; a discard here is therefore a bug, so
 * the route turns it into a 500 rather than serving anything the filter rejected).
 *
 * The offline generator produces only approved ingredients and verbs, always
 * includes the water, and always carries the feeling tag — so every check is
 * redundant on this path by design. That redundancy is the point: one filter
 * with no bypass is easier to prove correct than two paths.
 */

/** The longest a non-ingredient word may be, and a sentence, per AC13. */
const MAX_WORD_LETTERS = 10;
const MAX_SENTENCE_WORDS = 14;

const APPROVED_VERB = new Set<string>(VERB);

export type FilterResult =
  { ok: true; potion: Potion } | { ok: false; reason: string };

/** Count the letters in a word, ignoring punctuation. */
function letterCount(word: string): number {
  return (word.match(/[a-zA-Z]/g) ?? []).length;
}

/**
 * True if any sentence in `text` exceeds the word limit, or any word exceeds
 * the letter limit. Ingredient names are exempt, so callers strip the step's
 * referenced ingredient names from the text first.
 */
function violatesReadability(text: string): boolean {
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    if (words.length > MAX_SENTENCE_WORDS) return true;
    for (const word of words) {
      if (letterCount(word) > MAX_WORD_LETTERS) return true;
    }
  }
  return false;
}

/** Remove the step's referenced ingredient names from its text before measuring. */
function stripIngredientNames(text: string, ingredient: string[]): string {
  let stripped = text;
  // Longest first, so "a spoonful of flour" is removed before "a spoonful".
  for (const name of [...ingredient].sort((a, b) => b.length - a.length)) {
    stripped = stripped.split(name).join(" ");
  }
  return stripped;
}

export function filter(candidate: Candidate, tag: FeelingTag): FilterResult {
  // 1. Ingredients + cascade (AC1/AC2/AC2a).
  // Drop any ingredient not in the data; keep the survivors in order.
  const ingredient = candidate.ingredient.filter(isApproved);

  // Drop any step that references ANY removed ingredient — a step mixing one
  // dropped ingredient with surviving ones is removed whole (AC2a), not kept.
  const survivingSteps: Step[] = candidate.step.filter((s) =>
    s.ingredient.every(isApproved),
  );

  // A potion needs at least three ordered steps (AC7).
  if (survivingSteps.length < 3) {
    return { ok: false, reason: "fewer than three steps after the cascade" };
  }

  // Every surviving step may use only ingredients present in this potion (AC5).
  const inPotion = new Set(ingredient);
  for (const s of survivingSteps) {
    if (!s.ingredient.every((name) => inPotion.has(name))) {
      return {
        ok: false,
        reason: "a step references an ingredient not in the potion",
      };
    }
  }

  // 2. Floor of four (AC3).
  if (ingredient.length < 4) {
    return { ok: false, reason: "fewer than four approved ingredients" };
  }

  // 3. Step verbs (AC5) — a safety check: "heat", "cut" are what it stops.
  for (const s of survivingSteps) {
    if (!APPROVED_VERB.has(s.verb)) {
      return { ok: false, reason: `unapproved step verb: ${s.verb}` };
    }
  }

  // 4. Readability (AC13) — the name, every step's text, and the closing line.
  if (violatesReadability(candidate.name)) {
    return { ok: false, reason: "potion name over the readability limit" };
  }
  if (violatesReadability(candidate.closingLine)) {
    return { ok: false, reason: "closing line over the readability limit" };
  }
  for (const s of survivingSteps) {
    if (violatesReadability(stripIngredientNames(s.text, s.ingredient))) {
      return { ok: false, reason: "step text over the readability limit" };
    }
  }

  // 5. Composition (AC7a/AC7b).
  if (!ingredient.some((name) => hasTag(name, tag))) {
    return { ok: false, reason: "no ingredient answers the feeling" };
  }
  if (!ingredient.includes(WATER)) {
    return { ok: false, reason: "no water" };
  }

  return {
    ok: true,
    potion: {
      name: candidate.name,
      ingredient,
      step: survivingSteps,
      closingLine: candidate.closingLine,
    },
  };
}
