import type { FeelingTag } from "../data/ingredient.js";
import type { Candidate } from "../type/potion.js";
import type { Rng } from "../lib/rng.js";

/**
 * The one shape both generators satisfy: a trouble and its matched feeling tag
 * in, a candidate potion out. An injected RNG is the single source of
 * nondeterminism, so a fixed seed gives a repeatable potion (AC9) while the
 * route seeds randomly per request (AC8). The `offline generator` implements
 * this today; the `witch generator` implements the same shape in a later task.
 */
export type Generator = (
  trouble: string,
  tag: FeelingTag,
  rng: Rng,
) => Candidate;
