import {
  INGREDIENT,
  WATER,
  type FeelingTag,
  type Ingredient,
} from "../data/ingredient.js";
import { pick, randomInt, shuffle, type Rng } from "../lib/rng.js";
import type { Candidate, Step } from "../type/potion.js";
import type { Generator } from "./interface.js";

/**
 * The offline generator. It is not a mock: it does real work — from the matched
 * feeling tag it picks at least one matched ingredient, always adds the water,
 * and fills the rest from the neutral pool to a total of five to seven, then
 * assembles at least three ordered steps. It is built to pass all five filter
 * checks by construction (see the plan's Risks), so a discard on this path is a
 * bug, not a fallback.
 *
 * Determinism lives entirely in the injected RNG: a fixed seed gives a
 * byte-identical potion (AC9); distinct seeds give varied potions (AC8).
 */

// Short, safe potion names. Every word is ≤10 letters and there are ≤14 words,
// so the name always clears the readability check. No ingredient names.
const NAME = [
  "The Quiet Potion",
  "A Little Calm",
  "The Brave Heart Potion",
  "The Soft Morning Potion",
  "A Warm Hug Potion",
  "The Steady Potion",
  "The Kind Light Potion",
  "A Gentle Start",
];

// Closing lines. Same readability guarantee; no ingredient names, and they
// carry the "not for drinking" rule of the game.
const CLOSING = [
  "Keep it near you until you feel better.",
  "This potion is not for drinking, only for keeping.",
  "Hold it close and let the feeling settle.",
  "Leave it by your bed until the morning.",
  "Give it a little time to do its work.",
];

// Verbs that read naturally with a single ingredient, drawn from the approved
// list. "rest" and "wait" are left out because they do not take an object.
const STEP_VERB = [
  "stir",
  "sprinkle",
  "drop in",
  "fold in",
  "scatter",
  "swirl",
  "tap",
  "place",
  "count",
  "whisper to",
  "blow on",
] as const;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Build one ordered step from a verb and the single ingredient it uses. */
function buildStep(verb: string, name: string): Step {
  return {
    text: `${capitalize(verb)} ${name}.`,
    ingredient: [name],
    verb,
  };
}

export const offlineGenerator: Generator = (
  _trouble: string,
  tag: FeelingTag,
  rng: Rng,
): Candidate => {
  const matchedPool: Ingredient[] = INGREDIENT.filter(
    (i) => !i.water && i.tag.includes(tag),
  );
  const fillerPool: Ingredient[] = INGREDIENT.filter(
    (i) => i.neutral && !i.water,
  );

  // Total size of the potion, 5–7.
  const total = randomInt(rng, 5, 7);

  // At least one matched ingredient, up to three (or as many as the tag has).
  const matchedCount = randomInt(rng, 1, Math.min(matchedPool.length, 3));
  const chosenMatched = shuffle(rng, matchedPool).slice(0, matchedCount);

  // Water is always present; the matched ingredients answer the feeling.
  const ingredient = [WATER, ...chosenMatched.map((i) => i.name)];

  // Fill the rest from the neutral pool, skipping anything already chosen.
  const chosen = new Set(ingredient);
  const fillers = shuffle(
    rng,
    fillerPool.filter((i) => !chosen.has(i.name)),
  );
  for (const f of fillers) {
    if (ingredient.length >= total) break;
    ingredient.push(f.name);
  }

  // One step per ingredient, in order, so every step's ingredient is in the
  // potion (AC5) and there are at least three steps. The water opens the brew.
  const verbOffset = randomInt(rng, 0, STEP_VERB.length - 1);
  const step: Step[] = ingredient.map((name, index) => {
    if (name === WATER) return buildStep("tip in", name);
    const verb = STEP_VERB[(verbOffset + index) % STEP_VERB.length];
    return buildStep(verb, name);
  });

  return {
    name: pick(rng, NAME),
    ingredient,
    step,
    closingLine: pick(rng, CLOSING),
  };
};
