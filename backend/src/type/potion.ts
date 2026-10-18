/**
 * The potion shape the backend produces and the frontend consumes. Mirrors
 * `frontend/src/type/potion.ts` and the `Potion`/`Step` schemas in
 * `.orchestrate/api-contract.yaml` — the binding spec for both sides.
 */

export interface Step {
  /** The child-facing instruction, in order. */
  text: string;
  /** The ingredients this step uses; all present in the potion. */
  ingredient: string[];
  /** One approved verb, exactly as it appears in `.doc/ingredient.md`. */
  verb: string;
}

export interface Potion {
  name: string;
  /** Five to seven approved ingredients. */
  ingredient: string[];
  /** At least three ordered steps. */
  step: Step[];
  closingLine: string;
}

/**
 * A pre-filter potion. A generator produces one of these; it may hold
 * ingredients or verbs the filter will reject. The offline generator can never
 * produce an invalid candidate, but the type exists so the filter can be proven
 * against synthetic candidates — the shapes the witch generator will later
 * produce — with no model in the loop.
 */
export type Candidate = Potion;

/** The response envelope: the potion plus which generator produced it (AC10). */
export interface BrewResponse {
  potion: Potion;
  generator: "offline" | "witch";
}
