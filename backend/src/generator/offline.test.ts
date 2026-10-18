import { describe, expect, it } from "vitest";
import { offlineGenerator } from "./offline.js";
import { filter } from "../filter/filter.js";
import { potionSchema } from "../schema/potion.js";
import { mulberry32 } from "../lib/rng.js";
import {
  FEELING_TAG,
  WATER,
  hasTag,
  type FeelingTag,
} from "../data/ingredient.js";

describe("offline generator", () => {
  it("is byte-identical for a fixed seed (AC9)", () => {
    const a = offlineGenerator(
      "i miss someone",
      "missing-someone",
      mulberry32(42),
    );
    const b = offlineGenerator(
      "i miss someone",
      "missing-someone",
      mulberry32(42),
    );
    expect(a).toEqual(b);
  });

  it("produces more than one distinct potion across ten seeds (AC8)", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) {
      const potion = offlineGenerator("i'm bored", "bored", mulberry32(seed));
      seen.add(JSON.stringify(potion));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("is always schema-valid, has water and a matched ingredient, and passes the filter", () => {
    for (const tag of FEELING_TAG as readonly FeelingTag[]) {
      for (let seed = 1; seed <= 20; seed++) {
        const potion = offlineGenerator("a trouble", tag, mulberry32(seed));
        const context = `tag=${tag} seed=${seed}`;

        expect(potionSchema.safeParse(potion).success, context).toBe(true);
        expect(potion.ingredient, context).toContain(WATER);
        expect(
          potion.ingredient.some((name) => hasTag(name, tag)),
          context,
        ).toBe(true);

        const result = filter(potion, tag);
        expect(
          result.ok,
          `${context} filter: ${result.ok ? "" : result.reason}`,
        ).toBe(true);
      }
    }
  });
});
