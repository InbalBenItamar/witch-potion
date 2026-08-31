import { fixturePotion } from "../fixture/potion";
import type { Potion } from "../type/potion";

const SIMULATED_BREW_MS = 900;

/**
 * Stands in for POST /api/potion until "brew without a key" replaces the
 * body with a real request. Callers should not need to change.
 */
export function brewPotion(_trouble: string): Promise<Potion> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fixturePotion), SIMULATED_BREW_MS);
  });
}
