import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const HERE = import.meta.dirname;
const REPO_ROOT = path.resolve(HERE, "../../..");
const SRC_ROOT = path.resolve(HERE, "..");
const FIXTURE_FILE = path.resolve(SRC_ROOT, "fixture/potion.ts");
const SELF = path.resolve(HERE, "scope-guard.test.ts");

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry: fs.Dirent) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return full.endsWith(".ts") || full.endsWith(".tsx") ? [full] : [];
    });
}

function parseIngredientNames(doc: string): string[] {
  const sections = ["Kitchen cupboard", "Garden or park", "Craft drawer"];
  const lines = doc.split("\n");
  const names: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      inSection = sections.includes(line.replace("## ", "").trim());
      continue;
    }
    if (!inSection) continue;
    const match = line.match(/^\|\s*([^|]+?)\s*\|/);
    if (!match) continue;
    const cell = match[1].trim();
    if (cell === "Ingredient" || /^-+$/.test(cell)) continue;
    names.push(cell);
  }

  return names;
}

describe("frontend holds no ingredient logic", () => {
  const doc = fs.readFileSync(
    path.join(REPO_ROOT, ".doc/ingredient.md"),
    "utf-8",
  );
  const ingredientNames = parseIngredientNames(doc);

  it("finds the approved ingredient list to check against", () => {
    expect(ingredientNames.length).toBeGreaterThanOrEqual(40);
  });

  it("contains no approved ingredient name outside the fixture, in shipped code", () => {
    // Test files may build a synthetic potion with realistic ingredient
    // strings to assert rendering — that is not the frontend "knowing" the
    // approved list, since nothing compares those strings against the doc.
    // The guard is about what ships in the bundle, not what a test asserts.
    const offenders: string[] = [];

    for (const file of walk(SRC_ROOT)) {
      if (file === FIXTURE_FILE || file === SELF) continue;
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
      const contents = fs.readFileSync(file, "utf-8");
      for (const name of ingredientNames) {
        if (contents.includes(name)) {
          offenders.push(`${path.relative(SRC_ROOT, file)}: "${name}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("never imports .doc/ingredient.md", () => {
    const offenders = walk(SRC_ROOT)
      .filter((file) => file !== SELF)
      .filter((file) =>
        fs.readFileSync(file, "utf-8").includes("ingredient.md"),
      );
    expect(offenders).toEqual([]);
  });
});
