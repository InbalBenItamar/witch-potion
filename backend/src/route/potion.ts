import { randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import { matchFeeling } from "../matcher/feeling.js";
import { offlineGenerator } from "../generator/offline.js";
import { filter } from "../filter/filter.js";
import { parsePotion } from "../schema/potion.js";
import { mulberry32 } from "../lib/rng.js";
import { errorBody } from "../lib/error.js";
import type { BrewResponse } from "../type/potion.js";

/**
 * POST /api/potion — one trouble in, one potion out.
 *
 * Order: reject an empty/whitespace trouble first (AC6); otherwise feeling
 * matcher → offline generator (fresh seed, AC8) → schema on the raw candidate →
 * filter → schema on the filtered potion → return `{ potion, generator }`
 * (AC10). A schema or filter failure is a 500 with the error shape — never the
 * rejected potion, never a stack trace.
 *
 * Logging: the generator that ran, how many ingredients dropped, and timing.
 * Never the trouble (a child wrote it) and never the key.
 */
export const potionRouter = Router();

potionRouter.post("/potion", (req: Request, res: Response) => {
  const requestId = randomUUID();
  const started = performance.now();

  const trouble: unknown = req.body?.trouble;
  if (typeof trouble !== "string" || trouble.trim().length === 0) {
    res
      .status(400)
      .json(
        errorBody(
          "invalid_trouble",
          "Tell the witch what is bothering you first.",
          requestId,
        ),
      );
    return;
  }

  try {
    const tag = matchFeeling(trouble);
    const seed = (Math.random() * 0x100000000) >>> 0;
    const candidate = offlineGenerator(trouble, tag, mulberry32(seed));

    // Prove the raw candidate is a valid potion before the filter touches it.
    parsePotion(candidate);

    const result = filter(candidate, tag);
    if (!result.ok) {
      // The offline generator is built to pass the filter, so this is a bug,
      // not a fallback — there is no second generator to fall through to yet.
      console.error({
        event: "brew_discarded",
        requestId,
        generator: "offline",
        reason: result.reason,
      });
      res
        .status(500)
        .json(
          errorBody(
            "brew_failed",
            "The witch could not brew that just now. Try again.",
            requestId,
          ),
        );
      return;
    }

    // Re-prove the filtered potion: the cascade may have removed steps.
    const potion = parsePotion(result.potion);

    const dropped = candidate.ingredient.length - potion.ingredient.length;
    console.log({
      event: "brew_served",
      requestId,
      generator: "offline",
      dropped,
      ms: Math.round(performance.now() - started),
    });

    const response: BrewResponse = { potion, generator: "offline" };
    res.status(200).json(response);
  } catch (err) {
    console.error({
      event: "brew_error",
      requestId,
      generator: "offline",
      message: err instanceof Error ? err.message : "unknown error",
    });
    res
      .status(500)
      .json(
        errorBody(
          "brew_failed",
          "The witch could not brew that just now. Try again.",
          requestId,
        ),
      );
  }
});
