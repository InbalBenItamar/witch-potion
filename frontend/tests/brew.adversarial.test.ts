import { afterEach, describe, expect, it, vi } from "vitest";
import { brewPotion } from "../src/lib/brew";
import type { BrewResponse } from "../src/type/potion";

// QA adversarial pass. The suite under src/ mocks the whole brew module, so the
// real fetch/parse body of lib/brew.ts (Validation row 18) is never exercised
// by a unit test — only indirectly by e2e. These tests drive the real function
// against a stubbed fetch and try to break it: non-OK statuses, a rejected
// fetch (network down), and a 200 whose body is not JSON (the "parse failure"
// the function's own doc comment promises to throw on). None of these must
// fail silently — brewPotion must throw so App can surface the AC12 toast.

const response: BrewResponse = {
  generator: "offline",
  potion: {
    name: "The Quiet Heart Potion",
    ingredient: [
      "half a cup of water",
      "a spoonful of flour",
      "three pinches of salt",
      "a dried pasta star",
      "a spoonful of dry rice",
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
    ],
    closingLine: "Keep it warm and safe until morning.",
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("brewPotion (real fetch path, QA adversarial)", () => {
  it("POSTs the trouble to /api/potion and returns the envelope's potion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => response,
    });
    vi.stubGlobal("fetch", fetchMock);

    const potion = await brewPotion("i miss someone");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/potion");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ trouble: "i miss someone" });
    // Returns only the potion, not the envelope.
    expect(potion).toEqual(response.potion);
  });

  it.each([400, 500, 503])("throws on a non-OK %i status", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status,
        json: async () => ({ error: { code: "x", message: "y" } }),
      }),
    );

    await expect(brewPotion("i miss someone")).rejects.toThrow();
  });

  it("throws when the network request itself rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(brewPotion("i miss someone")).rejects.toThrow();
  });

  it("throws when a 200 response body is not valid JSON (parse failure)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      }),
    );

    await expect(brewPotion("i miss someone")).rejects.toThrow();
  });
});
