import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_TAG,
  FEELING_TAG,
  INGREDIENT,
  NEUTRAL_POOL,
  VERB,
} from "./ingredient.js";

// The doc is the single source of truth; the data mirrors it. These tests parse
// `.doc/ingredient.md` and assert an exact match (AC1), so the two cannot drift.
const DOC = readFileSync(
  fileURLToPath(new URL("../../../.doc/ingredient.md", import.meta.url)),
  "utf8",
);

function section(from: string, to: string): string {
  const start = DOC.indexOf(from);
  const end = DOC.indexOf(to, start + from.length);
  return DOC.slice(start + from.length, end === -1 ? undefined : end);
}

function backticks(text: string): string[] {
  return [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

interface DocIngredient {
  tag: string[];
  water: boolean;
}

/** Parse the three ingredient tables into name → { tags, water }. */
function parseIngredientTables(): Map<string, DocIngredient> {
  const map = new Map<string, DocIngredient>();
  for (const line of DOC.split("\n")) {
    const cells = line.split("|");
    // A table row is `| a | b | c |` → ["", " a ", " b ", " c ", ""].
    if (cells.length !== 5) continue;
    const name = cells[1].trim();
    const answers = cells[2].trim();
    if (name === "Ingredient" || /^-+$/.test(name)) continue; // header / rule
    if (answers.toLowerCase().includes("in every potion")) {
      map.set(name, { tag: [], water: true });
    } else {
      map.set(name, {
        tag: answers.split(",").map((t) => t.trim()),
        water: false,
      });
    }
  }
  return map;
}

function parseNeutralPool(): string[] {
  const body = section("## The neutral pool", "## Starter kit");
  return body
    .split("\n")
    .filter((l) => l.trimStart().startsWith("- "))
    .map((l) =>
      l
        .trim()
        .replace(/^-\s+/, "")
        .replace(/\s*\*\(.*\)\*\s*$/, "")
        .trim(),
    );
}

const sorted = (xs: readonly string[]) => [...xs].sort();

describe("ingredient data matches .doc/ingredient.md", () => {
  it("lists the same seventeen feeling tags, in order", () => {
    const tagsBlock = section("## Feeling tags", "## Kitchen cupboard").split(
      "**Default tag:**",
    )[0];
    expect(backticks(tagsBlock)).toEqual([...FEELING_TAG]);
    expect(FEELING_TAG).toHaveLength(17);
  });

  it("records the same default tag", () => {
    const after = section("## Feeling tags", "## Kitchen cupboard").split(
      "**Default tag:**",
    )[1];
    expect(backticks(after)[0]).toBe(DEFAULT_TAG);
  });

  it("lists the same approved verbs, in order", () => {
    const verbs = backticks(
      section("## Approved step verbs", "## Update Rules"),
    );
    expect(verbs).toEqual([...VERB]);
  });

  it("has exactly the doc's ingredients, with matching tags and water flag", () => {
    const doc = parseIngredientTables();
    expect(INGREDIENT).toHaveLength(doc.size);

    for (const ing of INGREDIENT) {
      const docIng = doc.get(ing.name);
      expect(docIng, `missing from doc: ${ing.name}`).toBeDefined();
      expect(sorted(ing.tag), `tags for ${ing.name}`).toEqual(
        sorted(docIng!.tag),
      );
      expect(ing.water, `water flag for ${ing.name}`).toBe(docIng!.water);
    }
  });

  it("marks exactly the doc's neutral pool as neutral", () => {
    expect(sorted(NEUTRAL_POOL)).toEqual(sorted(parseNeutralPool()));
  });
});
