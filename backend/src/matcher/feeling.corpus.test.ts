import { describe, expect, it } from "vitest";
import { matchFeeling } from "./feeling.js";

// Troubles phrased the way children actually say them — by what happened, not
// by naming the feeling. feeling.test.ts proves the matcher's contract; this
// guards the event phrasings the keyword list was taught.
//
// It is a REGRESSION GUARD, NOT AN ACCURACY SCORE. The keywords were tuned
// against this exact list, so passing it says nothing about troubles the list
// has never seen. Measured 2026-10-18: this list went from 20% to 100%, while a
// fresh set of 15 untuned troubles stayed at 20% before and after. Open-ended
// text needs a model — the witch generator — not a longer list. To measure real
// accuracy, score a fresh set that was not used for tuning.
//
// Each trouble lists every tag that is a fair reading of it: "my grandma is in
// hospital" is worried or sad, and either is a good potion. Never lower
// MIN_HIT_RATE to make a change pass.
const MIN_HIT_RATE = 0.8;

const CORPUS: Array<[string, string[]]> = [
  ["my brother broke my toy", ["angry"]],
  ["my sister took my tablet and won't give it back", ["angry"]],
  ["a boy pushed me in the playground", ["angry", "sad"]],
  ["my best friend moved to another city", ["missing-someone"]],
  ["daddy is away for work all week", ["missing-someone"]],
  ["my grandpa died", ["sad", "missing-someone"]],
  ["my dog died", ["sad"]],
  ["I lost my favourite teddy", ["sad"]],
  ["mum shouted at me", ["sad"]],
  ["my teacher told me off in front of the class", ["embarrassed", "sad"]],
  ["I fell over and everyone laughed", ["embarrassed"]],
  ["they made fun of my glasses", ["embarrassed", "sad"]],
  ["nobody wanted to play with me at recess", ["left-out", "lonely"]],
  ["I wasn't invited to the party", ["left-out"]],
  ["they won't let me play football with them", ["left-out"]],
  ["I have no one to play with", ["lonely"]],
  ["I'm on my own at lunch every day", ["lonely"]],
  ["my sister got a new bike and I didn't", ["jealous"]],
  ["my brother always gets more sweets than me", ["jealous"]],
  ["I can't do my maths homework", ["stuck", "frustrated"]],
  ["I don't understand my reading book", ["stuck"]],
  ["my lego tower keeps falling down", ["frustrated"]],
  ["I have a spelling test tomorrow", ["nervous", "worried"]],
  ["I'm going to the dentist", ["nervous", "scared"]],
  ["it's my first day at a new school", ["nervous"]],
  ["my grandma is in hospital", ["worried", "sad"]],
  ["mum and dad keep arguing", ["worried", "sad"]],
  ["there's a monster under my bed", ["scared"]],
  ["the thunder is really loud", ["scared"]],
  ["I had a bad dream", ["scared"]],
  ["it's raining and I can't go outside", ["bored"]],
  ["our trip to the zoo got cancelled", ["disappointed"]],
  ["I came last in the race", ["disappointed"]],
  ["I stayed up too late and I'm so sleepy", ["tired"]],
  ["I can't sit still in class", ["restless"]],
];

describe("feeling matcher on realistic troubles", () => {
  it(`reads at least ${MIN_HIT_RATE * 100}% of the corpus correctly`, () => {
    const miss = CORPUS.filter(
      ([trouble, fair]) => !fair.includes(matchFeeling(trouble)),
    ).map(([trouble, fair]) => {
      return `"${trouble}" → ${matchFeeling(trouble)} (fair: ${fair.join(" / ")})`;
    });
    const hitRate = (CORPUS.length - miss.length) / CORPUS.length;

    // On failure, list every miss so the fix is obvious from the output.
    expect(hitRate, `misses:\n${miss.join("\n")}`).toBeGreaterThanOrEqual(
      MIN_HIT_RATE,
    );
  });
});
