import { DEFAULT_TAG, type FeelingTag } from "../data/ingredient.js";

/**
 * The feeling matcher: free-text trouble → exactly one feeling tag. It always
 * returns a tag, so every brew has a feeling to answer — a trouble that names
 * no feeling gets the default (`hopeful`).
 *
 * How it works (plan Q3): an ordered keyword list per tag, scanned over the
 * lower-cased trouble in a fixed priority order; the first tag with a matching
 * keyword wins. Deterministic, no model (AC9), fully unit-testable. The product
 * promises matching only as a game, not real NLP — this is good enough for v1.
 *
 * Keywords match as whole words/phrases (not substrings), so "made" does not
 * trip "mad" and "dismiss" does not trip "miss".
 */
const KEYWORD: ReadonlyArray<readonly [FeelingTag, readonly string[]]> = [
  [
    "missing-someone",
    ["miss", "missing", "gone", "far away", "away from", "wish they were here"],
  ],
  [
    "scared",
    [
      "scared",
      "afraid",
      "frightened",
      "fright",
      "the dark",
      "monster",
      "nightmare",
      "spooky",
    ],
  ],
  [
    "left-out",
    [
      "left out",
      "leave me out",
      "nobody picked",
      "picked me",
      "not picked",
      "no one picked",
      "not invited",
      "left behind",
      "nobody",
      "no one",
    ],
  ],
  [
    "lonely",
    [
      "lonely",
      "alone",
      "all by myself",
      "by myself",
      "no friends",
      "no one to play",
    ],
  ],
  [
    "jealous",
    [
      "jealous",
      "envy",
      "envious",
      "wish i had",
      "they got",
      "not fair that they",
    ],
  ],
  ["angry", ["angry", "mad", "furious", "cross", "rage", "hate", "so annoyed"]],
  [
    "frustrated",
    [
      "frustrated",
      "frustrating",
      "annoyed",
      "annoying",
      "not fair",
      "keeps going wrong",
    ],
  ],
  [
    "stuck",
    [
      "stuck",
      "can't do",
      "cannot do",
      "can't do it",
      "give up",
      "too hard",
      "don't know how",
    ],
  ],
  [
    "nervous",
    [
      "nervous",
      "butterflies",
      "first day",
      "big day",
      "the test",
      "my test",
      "presentation",
      "in front of everyone",
    ],
  ],
  [
    "worried",
    [
      "worried",
      "worry",
      "anxious",
      "what if",
      "scared that",
      "keep thinking about",
    ],
  ],
  [
    "disappointed",
    [
      "disappointed",
      "let down",
      "let me down",
      "nobody noticed",
      "didn't win",
      "did not win",
      "lost the",
    ],
  ],
  [
    "embarrassed",
    [
      "embarrassed",
      "embarrassing",
      "ashamed",
      "so silly",
      "everyone saw",
      "everyone laughed",
      "laughed at me",
    ],
  ],
  [
    "tired",
    [
      "tired",
      "sleepy",
      "exhausted",
      "worn out",
      "can't sleep",
      "cannot sleep",
      "won't sleep",
    ],
  ],
  [
    "restless",
    [
      "restless",
      "can't sit still",
      "cannot sit still",
      "can't keep still",
      "fidgety",
      "fidget",
      "wriggly",
    ],
  ],
  ["bored", ["bored", "boring", "nothing to do", "so dull"]],
  [
    "sad",
    [
      "sad",
      "unhappy",
      "crying",
      "i cry",
      "want to cry",
      "upset",
      "mean to me",
      "was mean",
      "being mean",
      "hurt my feelings",
      "feel down",
      "gloomy",
    ],
  ],
  [
    "hopeful",
    ["hopeful", "i hope", "wishing", "make a wish", "fingers crossed"],
  ],
];

/** Escape a string for use as a literal inside a RegExp. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True if `keyword` appears in `text` as a whole word/phrase, not a substring. */
function containsWord(text: string, keyword: string): boolean {
  const pattern = new RegExp(`(?<![a-z])${escapeRegExp(keyword)}(?![a-z])`);
  return pattern.test(text);
}

/** Match a trouble to exactly one feeling tag. Always returns a tag. */
export function matchFeeling(trouble: string): FeelingTag {
  const text = trouble.toLowerCase().replace(/[’‘]/g, "'");
  for (const [tag, keywords] of KEYWORD) {
    for (const keyword of keywords) {
      if (containsWord(text, keyword)) {
        return tag;
      }
    }
  }
  return DEFAULT_TAG;
}
