import { describe, expect, it } from "vitest";
import { matchFeeling } from "./feeling.js";
import { DEFAULT_TAG, FEELING_TAG } from "../data/ingredient.js";

// The matcher always returns a tag (Q3). The corpus includes the six shipped
// chip phrases (task 001 Q2), plus a trouble that names no feeling.
describe("feeling matcher", () => {
  const corpus: Array<[string, string]> = [
    // The six chips.
    ["my friend was mean to me", "sad"],
    ["i'm scared of the dark", "scared"],
    ["i miss someone", "missing-someone"],
    ["i'm bored", "bored"],
    ["nobody picked me", "left-out"],
    ["i can't do it", "stuck"],
    // A wider spread across the tags.
    ["i feel so lonely", "lonely"],
    ["i'm really angry right now", "angry"],
    ["i'm worried about tomorrow", "worried"],
    ["i'm so jealous of my sister", "jealous"],
    ["i'm nervous about my test", "nervous"],
    ["i'm tired and can't sleep", "tired"],
    ["i feel left out", "left-out"],
    ["i was so embarrassed", "embarrassed"],
    ["everything is so frustrating", "frustrated"],
    ["i am so disappointed", "disappointed"],
  ];

  it.each(corpus)("matches %j to %s", (trouble, expected) => {
    expect(matchFeeling(trouble)).toBe(expected);
  });

  it("returns the default tag when nothing matches", () => {
    expect(matchFeeling("blorp wuzzle quibber")).toBe(DEFAULT_TAG);
  });

  it("only ever returns a known feeling tag", () => {
    for (const [trouble] of corpus) {
      expect(FEELING_TAG).toContain(matchFeeling(trouble));
    }
  });

  it("matches whole words, not substrings", () => {
    // "dismiss" must not trip "miss"; falls through to the default.
    expect(matchFeeling("please do not dismiss my idea")).toBe(DEFAULT_TAG);
  });
});
