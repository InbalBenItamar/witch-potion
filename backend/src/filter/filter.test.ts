import { describe, expect, it } from "vitest";
import { filter } from "./filter.js";
import { potionSchema } from "../schema/potion.js";
import type { Candidate } from "../type/potion.js";

// All filter tests run on synthetic candidates — the shapes the witch generator
// will later produce — with no model in the loop.

function baseCandidate(): Candidate {
  return {
    name: "The Quiet Potion",
    ingredient: [
      "half a cup of water",
      "a spoonful of flour",
      "three pinches of salt",
      "a raisin",
      "a smooth pebble",
    ],
    step: [
      {
        text: "Tip in half a cup of water.",
        ingredient: ["half a cup of water"],
        verb: "tip in",
      },
      {
        text: "Fold in a spoonful of flour.",
        ingredient: ["a spoonful of flour"],
        verb: "fold in",
      },
      { text: "Drop in a raisin.", ingredient: ["a raisin"], verb: "drop in" },
    ],
    closingLine: "Keep it near you until you feel better.",
  };
}

describe("filter", () => {
  it("drops an unapproved ingredient and serves the rest, ≥4 surviving (AC2)", () => {
    const candidate = baseCandidate();
    candidate.ingredient.push("a dragon scale");

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.potion.ingredient).not.toContain("a dragon scale");
    expect(result.potion.ingredient.length).toBeGreaterThanOrEqual(4);
  });

  it("removes a step that references any removed ingredient, keeping others in order (AC2a)", () => {
    const candidate = baseCandidate();
    // A step that mixes a dropped ingredient with a surviving one is removed whole.
    candidate.step = [
      candidate.step[0], // water
      {
        text: "Fold in a spoonful of flour and a dragon scale.",
        ingredient: ["a spoonful of flour", "a dragon scale"],
        verb: "fold in",
      },
      candidate.step[2], // raisin
      {
        text: "Sprinkle three pinches of salt.",
        ingredient: ["three pinches of salt"],
        verb: "sprinkle",
      },
    ];

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.potion.step).toHaveLength(3);
    expect(result.potion.step.map((s) => s.verb)).toEqual([
      "tip in",
      "drop in",
      "sprinkle",
    ]);
    expect(
      result.potion.step.some((s) => s.ingredient.includes("a dragon scale")),
    ).toBe(false);
  });

  it("discards when the cascade leaves fewer than three steps (AC7)", () => {
    const candidate = baseCandidate();
    candidate.step = [
      candidate.step[0],
      {
        text: "Stir a dragon scale.",
        ingredient: ["a dragon scale"],
        verb: "stir",
      },
      {
        text: "Stir a unicorn horn.",
        ingredient: ["a unicorn horn"],
        verb: "stir",
      },
    ];

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("discards when a step references an ingredient not in the potion (AC5)", () => {
    const candidate: Candidate = {
      ...baseCandidate(),
      ingredient: [
        "half a cup of water",
        "a spoonful of flour",
        "three pinches of salt",
        "a raisin",
      ],
      step: [
        {
          text: "Tip in half a cup of water.",
          ingredient: ["half a cup of water"],
          verb: "tip in",
        },
        {
          text: "Fold in a spoonful of flour.",
          ingredient: ["a spoonful of flour"],
          verb: "fold in",
        },
        {
          // approved, but not in this potion's ingredient list
          text: "Scatter a mint leaf.",
          ingredient: ["a mint leaf"],
          verb: "scatter",
        },
      ],
    };

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("discards with fewer than four approved ingredients (AC3)", () => {
    const candidate: Candidate = {
      ...baseCandidate(),
      ingredient: [
        "half a cup of water",
        "a spoonful of flour",
        "three pinches of salt",
      ],
      step: [
        {
          text: "Tip in half a cup of water.",
          ingredient: ["half a cup of water"],
          verb: "tip in",
        },
        {
          text: "Fold in a spoonful of flour.",
          ingredient: ["a spoonful of flour"],
          verb: "fold in",
        },
        {
          text: "Sprinkle three pinches of salt.",
          ingredient: ["three pinches of salt"],
          verb: "sprinkle",
        },
      ],
    };

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("discards a step with an unapproved verb (AC5)", () => {
    const candidate = baseCandidate();
    candidate.step[1] = {
      text: "Heat a spoonful of flour.",
      ingredient: ["a spoonful of flour"],
      verb: "heat",
    };

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("discards text with a non-ingredient word over ten letters (AC13)", () => {
    const candidate = baseCandidate();
    candidate.step[1] = {
      text: "Fold the extraordinarily big flour in.",
      ingredient: ["a spoonful of flour"],
      verb: "fold in",
    };

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("discards a sentence longer than fourteen words (AC13)", () => {
    const candidate = baseCandidate();
    candidate.closingLine =
      "Keep this one somewhere very safe and do not let it out of your own sight.";

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
  });

  it("exempts ingredient names from readability — legal only because of the exemption", () => {
    const candidate: Candidate = {
      name: "The Quiet Potion",
      ingredient: [
        "half a cup of water",
        "a spoonful of clean play sand",
        "a spoonful of dry rice",
        "a strip of orange peel",
      ],
      step: [
        {
          text: "Tip in half a cup of water.",
          ingredient: ["half a cup of water"],
          verb: "tip in",
        },
        {
          // 16 words raw; 10 once the six-word ingredient name is stripped out.
          text: "Scatter a spoonful of clean play sand slowly over the top of the bowl now please.",
          ingredient: ["a spoonful of clean play sand"],
          verb: "scatter",
        },
        {
          text: "Stir a spoonful of dry rice.",
          ingredient: ["a spoonful of dry rice"],
          verb: "stir",
        },
      ],
      closingLine: "Keep it near you until you feel better.",
    };

    const result = filter(candidate, "bored");
    expect(result.ok, result.ok ? "" : result.reason).toBe(true);
  });

  it("discards a potion with no ingredient answering the feeling (AC7a)", () => {
    // None of these answer "jealous".
    const candidate: Candidate = {
      ...baseCandidate(),
      ingredient: [
        "half a cup of water",
        "a spoonful of flour",
        "three pinches of salt",
        "a raisin",
      ],
    };

    const result = filter(candidate, "jealous");
    expect(result.ok).toBe(false);
  });

  it("discards a potion with no water (AC7b)", () => {
    const candidate: Candidate = {
      ...baseCandidate(),
      ingredient: [
        "a spoonful of flour",
        "three pinches of salt",
        "a raisin",
        "a smooth pebble",
      ],
      step: [
        {
          text: "Fold in a spoonful of flour.",
          ingredient: ["a spoonful of flour"],
          verb: "fold in",
        },
        {
          text: "Sprinkle three pinches of salt.",
          ingredient: ["three pinches of salt"],
          verb: "sprinkle",
        },
        {
          text: "Drop in a raisin.",
          ingredient: ["a raisin"],
          verb: "drop in",
        },
      ],
    };

    const result = filter(candidate, "worried");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("water");
  });

  it("re-validates the filtered potion against the schema (AC7)", () => {
    const result = filter(baseCandidate(), "worried");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(potionSchema.safeParse(result.potion).success).toBe(true);
  });
});
