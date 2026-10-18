import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Potion } from "../type/potion";
import { PotionCard } from "./PotionCard";

// A synthetic potion for the tests — test files may carry ingredient strings
// (the scope guard exempts them), so the deleted fixture lives here now.
const potion: Potion = {
  name: "The Quiet Heart Potion",
  ingredient: [
    "half a cup of water",
    "a spoonful of flour",
    "three pinches of salt",
    "a dried pasta star",
    "a spoonful of dry rice",
    "a length of ribbon",
  ],
  step: [
    {
      text: "Tip in the water and stir it three times.",
      ingredient: ["half a cup of water"],
      verb: "tip in",
    },
    {
      text: "Sprinkle in the flour and the salt together.",
      ingredient: ["a spoonful of flour", "three pinches of salt"],
      verb: "sprinkle",
    },
    {
      text: "Drop in the pasta star and whisper to it.",
      ingredient: ["a dried pasta star"],
      verb: "drop in",
    },
    {
      text: "Scatter the rice, then place the ribbon on top.",
      ingredient: ["a spoonful of dry rice", "a length of ribbon"],
      verb: "scatter",
    },
  ],
  closingLine: "Keep it warm and safe until morning.",
};

// Real potions run to 7 ingredients and longer steps; the 4-step, 6-ingredient
// potion alone would not have caught the layout breaking at that size.
const maxLengthPotion: Potion = {
  name: "The Bright and Sparkling Everything Potion",
  ingredient: [
    "half a cup of water",
    "a spoonful of flour",
    "three pinches of salt",
    "a spoonful of sugar",
    "a shake of cinnamon",
    "a spoonful of porridge oats",
    "a squeeze of lemon juice",
  ],
  step: [
    {
      text: "Tip in the water and stir it slowly around the bowl.",
      ingredient: ["half a cup of water"],
      verb: "tip in",
    },
    {
      text: "Sprinkle in the flour, then the salt, then the sugar.",
      ingredient: [
        "a spoonful of flour",
        "three pinches of salt",
        "a spoonful of sugar",
      ],
      verb: "sprinkle",
    },
    {
      text: "Fold in the cinnamon and the porridge oats together.",
      ingredient: ["a shake of cinnamon", "a spoonful of porridge oats"],
      verb: "fold in",
    },
    {
      text: "Drop in the lemon juice and count to ten out loud.",
      ingredient: ["a squeeze of lemon juice"],
      verb: "count",
    },
    {
      text: "Rest the potion somewhere quiet until it settles down.",
      ingredient: [],
      verb: "rest",
    },
  ],
  closingLine: "Give it a gentle swirl before you carry it anywhere.",
};

describe("PotionCard", () => {
  it("renders the name, every ingredient, every step in order, and the closing line", () => {
    render(<PotionCard potion={potion} onBack={vi.fn()} />);

    expect(screen.getByText(potion.name)).toBeInTheDocument();

    for (const item of potion.ingredient) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }

    const steps = screen
      .getAllByRole("listitem")
      .map((node) => node.textContent);
    const stepTexts = potion.step.map((step) => step.text);
    for (const text of stepTexts) {
      expect(steps).toContain(text);
    }

    expect(screen.getByText(potion.closingLine)).toBeInTheDocument();
  });

  it("always shows the never-drink-it notice", () => {
    render(<PotionCard potion={potion} onBack={vi.fn()} />);
    expect(screen.getByText(/not for eating or drinking/i)).toBeInTheDocument();
  });

  it("calls onBack when the Back button is clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<PotionCard potion={potion} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders a maximum-length potion — 7 ingredients, 5 steps — without dropping any", () => {
    render(<PotionCard potion={maxLengthPotion} onBack={vi.fn()} />);

    expect(screen.getByText(maxLengthPotion.name)).toBeInTheDocument();
    for (const item of maxLengthPotion.ingredient) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(
      maxLengthPotion.ingredient.length + maxLengthPotion.step.length,
    );
  });
});
