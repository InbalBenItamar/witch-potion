import { z } from "zod";
import type { Potion } from "../type/potion.js";

/**
 * The AC7 potion shape, expressed once. The route runs it twice: on the raw
 * candidate before the filter, and on the filtered potion before returning —
 * the cascade removes steps and ingredients, so the result must be re-proven a
 * valid potion. Reused next task to parse the witch generator's reply.
 */
export const stepSchema = z.object({
  text: z.string().min(1),
  ingredient: z.array(z.string().min(1)),
  verb: z.string().min(1),
});

export const potionSchema = z.object({
  name: z.string().min(1),
  ingredient: z.array(z.string().min(1)).min(5).max(7),
  step: z.array(stepSchema).min(3),
  closingLine: z.string().min(1),
});

/** Parse-and-validate. Throws a ZodError the route turns into a 500. */
export function parsePotion(value: unknown): Potion {
  return potionSchema.parse(value);
}
