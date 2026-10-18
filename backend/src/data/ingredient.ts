/**
 * The machine-readable form of `.doc/ingredient.md` — the closed list of
 * everything a potion may contain. `.doc/ingredient.md` is the single source
 * of truth; this file mirrors it and `ingredient.test.ts` asserts they match
 * exactly, so the two cannot drift apart. The doc is read-only to agents;
 * change it there first, then follow it here.
 */

/** The seventeen feeling tags, in the order the doc lists them. */
export const FEELING_TAG = [
  "scared",
  "worried",
  "lonely",
  "left-out",
  "sad",
  "angry",
  "frustrated",
  "jealous",
  "bored",
  "restless",
  "embarrassed",
  "tired",
  "missing-someone",
  "nervous",
  "disappointed",
  "stuck",
  "hopeful",
] as const;

export type FeelingTag = (typeof FEELING_TAG)[number];

/**
 * The tag the feeling matcher returns when the trouble names no feeling, so
 * every trouble still gets a potion. Recorded in the doc; carried here as data.
 */
export const DEFAULT_TAG: FeelingTag = "hopeful";

/** Every potion starts here. Not a feeling tag — a flag of its own. */
export const WATER = "half a cup of water";

/** The approved step verbs. Steps may use only these — no heat, no cutting. */
export const VERB = [
  "stir",
  "sprinkle",
  "drop in",
  "fold in",
  "scatter",
  "whisper to",
  "count",
  "swirl",
  "tip in",
  "rest",
  "wait",
  "blow on",
  "tap",
  "place",
] as const;

export type Verb = (typeof VERB)[number];

export interface Ingredient {
  /** Exactly as written in `.doc/ingredient.md`. */
  name: string;
  /** The feeling tags this ingredient answers. Empty only for the water. */
  tag: FeelingTag[];
  /** True only for the water, which is in every potion. */
  water: boolean;
  /** True if the ingredient is in the neutral pool (any potion may use it). */
  neutral: boolean;
}

/**
 * All 42 ingredients, in the order the doc lists them (kitchen cupboard,
 * garden or park, craft drawer). `neutral` mirrors the doc's neutral-pool list,
 * which includes the water.
 */
export const INGREDIENT: Ingredient[] = [
  // --- Kitchen cupboard ---
  { name: "half a cup of water", tag: [], water: true, neutral: true },
  {
    name: "a spoonful of flour",
    tag: ["worried", "scared"],
    water: false,
    neutral: true,
  },
  {
    name: "three pinches of salt",
    tag: ["scared", "worried"],
    water: false,
    neutral: true,
  },
  {
    name: "a spoonful of sugar",
    tag: ["sad", "disappointed"],
    water: false,
    neutral: true,
  },
  {
    name: "a shake of cinnamon",
    tag: ["lonely", "sad"],
    water: false,
    neutral: false,
  },
  {
    name: "a spoonful of porridge oats",
    tag: ["nervous", "worried"],
    water: false,
    neutral: false,
  },
  {
    name: "a squeeze of lemon juice",
    tag: ["tired", "bored"],
    water: false,
    neutral: false,
  },
  {
    name: "a spoonful of baking soda",
    tag: ["angry", "frustrated"],
    water: false,
    neutral: false,
  },
  {
    name: "a drop of vanilla",
    tag: ["sad", "missing-someone"],
    water: false,
    neutral: false,
  },
  {
    name: "a spoonful of cocoa powder",
    tag: ["jealous", "sad"],
    water: false,
    neutral: false,
  },
  {
    name: "a drop of honey",
    tag: ["sad", "missing-someone"],
    water: false,
    neutral: false,
  },
  {
    name: "a spoonful of dry rice",
    tag: ["bored", "restless"],
    water: false,
    neutral: true,
  },
  {
    name: "a strip of orange peel",
    tag: ["sad", "bored"],
    water: false,
    neutral: false,
  },
  {
    name: "a dried pasta star",
    tag: ["nervous", "hopeful"],
    water: false,
    neutral: false,
  },
  { name: "a raisin", tag: ["worried"], water: false, neutral: false },
  { name: "a mint leaf", tag: ["angry"], water: false, neutral: false },
  {
    name: "a drop of food colouring",
    tag: ["bored", "embarrassed"],
    water: false,
    neutral: true,
  },
  {
    name: "a breadcrumb",
    tag: ["lonely", "left-out"],
    water: false,
    neutral: false,
  },
  {
    name: "a sunflower seed",
    tag: ["frustrated", "stuck"],
    water: false,
    neutral: false,
  },
  // --- Garden or park ---
  {
    name: "a rose petal",
    tag: ["sad", "embarrassed"],
    water: false,
    neutral: false,
  },
  {
    name: "a daisy",
    tag: ["lonely", "left-out"],
    water: false,
    neutral: false,
  },
  {
    name: "a dandelion",
    tag: ["nervous", "hopeful"],
    water: false,
    neutral: false,
  },
  { name: "a clover leaf", tag: ["nervous"], water: false, neutral: false },
  { name: "a blade of grass", tag: ["left-out"], water: false, neutral: false },
  {
    name: "a smooth pebble",
    tag: ["angry", "worried"],
    water: false,
    neutral: true,
  },
  {
    name: "a fallen leaf",
    tag: ["sad", "frustrated"],
    water: false,
    neutral: false,
  },
  {
    name: "a sprig of lavender",
    tag: ["tired", "worried"],
    water: false,
    neutral: false,
  },
  {
    name: "a fallen flower head",
    tag: ["sad", "lonely"],
    water: false,
    neutral: false,
  },
  {
    name: "a spoonful of clean play sand",
    tag: ["bored", "restless"],
    water: false,
    neutral: false,
  },
  // --- Craft drawer ---
  {
    name: "a shake of edible glitter",
    tag: ["sad", "embarrassed"],
    water: false,
    neutral: true,
  },
  {
    name: "a dab of washable poster paint",
    tag: ["bored", "sad"],
    water: false,
    neutral: true,
  },
  {
    name: "a length of ribbon",
    tag: ["lonely", "missing-someone"],
    water: false,
    neutral: true,
  },
  {
    name: "a piece of string",
    tag: ["missing-someone"],
    water: false,
    neutral: true,
  },
  {
    name: "a cotton wool ball",
    tag: ["scared", "sad"],
    water: false,
    neutral: false,
  },
  {
    name: "a paper star, cut out",
    tag: ["nervous", "hopeful"],
    water: false,
    neutral: false,
  },
  { name: "a pom-pom", tag: ["bored", "sad"], water: false, neutral: true },
  {
    name: "a stick of chalk",
    tag: ["embarrassed"],
    water: false,
    neutral: false,
  },
  {
    name: "a crayon shaving",
    tag: ["tired", "frustrated"],
    water: false,
    neutral: false,
  },
  {
    name: "a scrap of tissue paper",
    tag: ["worried"],
    water: false,
    neutral: true,
  },
  { name: "a sticker", tag: ["disappointed"], water: false, neutral: false },
  {
    name: "a scrap of cotton fabric",
    tag: ["scared", "missing-someone"],
    water: false,
    neutral: false,
  },
  {
    name: "a button",
    tag: ["worried", "left-out"],
    water: false,
    neutral: false,
  },
];

/** The set of approved ingredient names, for fast membership checks. */
export const APPROVED_NAME = new Set(INGREDIENT.map((i) => i.name));

/** The neutral pool, in doc order (includes the water). */
export const NEUTRAL_POOL = INGREDIENT.filter((i) => i.neutral).map(
  (i) => i.name,
);

/** True if `name` is an approved ingredient. */
export function isApproved(name: string): boolean {
  return APPROVED_NAME.has(name);
}

/** True if the approved ingredient `name` answers `tag`. */
export function hasTag(name: string, tag: FeelingTag): boolean {
  const found = INGREDIENT.find((i) => i.name === name);
  return found ? found.tag.includes(tag) : false;
}
