import type { Potion } from "../type/potion";

/**
 * Placeholder potion for the "the potion on screen" task — deleted by
 * "brew without a key" once a real POST /api/potion exists.
 */
export const fixturePotion: Potion = {
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
    },
    {
      text: "Sprinkle in the flour and the salt together.",
      ingredient: ["a spoonful of flour", "three pinches of salt"],
    },
    {
      text: "Drop in the pasta star and whisper to it.",
      ingredient: ["a dried pasta star"],
    },
    {
      text: "Scatter the rice, then place the ribbon on top.",
      ingredient: ["a spoonful of dry rice", "a length of ribbon"],
    },
  ],
  closingLine: "Keep it warm and safe until morning.",
};
