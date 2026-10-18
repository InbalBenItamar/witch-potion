import type { BrewResponse, Potion } from "../type/potion";

/**
 * Brews one potion for one trouble via POST /api/potion. All potion logic
 * lives in the Node service; this only sends the trouble and returns the
 * potion it gets back. Throws on a non-OK status or a network/parse failure
 * so the caller can surface a toast (AC12).
 */
export async function brewPotion(trouble: string): Promise<Potion> {
  const response = await fetch("/api/potion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trouble }),
  });

  if (!response.ok) {
    throw new Error(`Brew failed with status ${response.status}`);
  }

  const data = (await response.json()) as BrewResponse;
  return data.potion;
}
