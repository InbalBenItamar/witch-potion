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
// Two kinds of keyword per tag: the feeling named outright ("angry"), and the
// events children describe instead ("broke my toy"). Children mostly say what
// happened, so the event words carry most of the matching — see
// feeling.corpus.test.ts, which measures exactly that.
//
// Order matters: the first tag with a hit wins. `lonely` precedes `left-out`
// so "no one to play with" is lonely rather than left-out's broader "no one";
// `bored` precedes `stuck` so "stuck inside" is boredom, not being stuck.
const KEYWORD: ReadonlyArray<readonly [FeelingTag, readonly string[]]> = [
  [
    "missing-someone",
    [
      "miss",
      "missing",
      "gone",
      "far away",
      "away from",
      "wish they were here",
      "moved",
      "moving away",
      "went away",
      "is away",
      "away for",
    ],
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
      "bad dream",
      "spooky",
      "ghost",
      "thunder",
      "storm",
      "spider",
      "under my bed",
    ],
  ],
  [
    "lonely",
    [
      "lonely",
      "alone",
      "all by myself",
      "by myself",
      "on my own",
      "no friends",
      "no one to play",
      "nobody to play",
      "no one to talk",
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
      "wasn't invited",
      "didn't invite",
      "won't let me play",
      "wouldn't let me play",
      "without me",
      "ignored",
      "ignoring me",
      "left behind",
      "nobody",
      "no one",
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
      "got a new",
      "always gets",
      "gets more",
      "and i didn't",
    ],
  ],
  [
    "angry",
    [
      "angry",
      "mad",
      "furious",
      "cross",
      "rage",
      "hate",
      "so annoyed",
      "broke",
      "broken",
      "smashed",
      "ruined",
      "took my",
      "stole",
      "snatched",
      "hit me",
      "pushed me",
      "kicked me",
      "won't share",
    ],
  ],
  [
    "frustrated",
    [
      "frustrated",
      "frustrating",
      "annoyed",
      "annoying",
      "not fair",
      "keeps going wrong",
      "keeps falling",
      "keep falling",
      "keeps breaking",
      "won't work",
      "doesn't work",
      "not working",
    ],
  ],
  [
    "bored",
    [
      "bored",
      "boring",
      "nothing to do",
      "so dull",
      "raining",
      "rainy",
      "can't go outside",
      "stuck inside",
      "stuck indoors",
    ],
  ],
  [
    "stuck",
    [
      "stuck",
      "can't do",
      "cannot do",
      "give up",
      "too hard",
      "don't know how",
      "don't understand",
      "can't figure",
      "can't work out",
    ],
  ],
  [
    "nervous",
    [
      "nervous",
      "butterflies",
      "first day",
      "big day",
      "test",
      "exam",
      "quiz",
      "dentist",
      "doctor",
      "injection",
      "new school",
      "presentation",
      "concert",
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
      "keep thinking about",
      "hospital",
      "sick",
      "poorly",
      "arguing",
      "fighting",
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
      "came last",
      "cancelled",
      "canceled",
      "called off",
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
      "laughing at me",
      "made fun",
      "teased",
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
      "stayed up",
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
  [
    "sad",
    [
      "sad",
      "unhappy",
      "crying",
      "cried",
      "i cry",
      "want to cry",
      "upset",
      "mean to me",
      "was mean",
      "being mean",
      "hurt my feelings",
      "feel down",
      "gloomy",
      "died",
      "passed away",
      "lost my",
      "shouted",
      "yelled",
      "told me off",
      "told off",
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
