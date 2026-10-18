# 002 — Brew without a key

Status: done
Owner: orchestrator (via Claude Code)
Last updated: 2026-10-18

Backlog task: `brew without a key` (`stack:full` — frontend **and** backend run).

## Goal

Make the app work end to end with no `ANTHROPIC_API_KEY` at all. Scaffold `backend/`,
build the real brew path — feeling matcher, `offline generator`, filter, potion schema,
and `POST /api/potion` — and point the screen at it, deleting the fixture.

The `witch generator` is deliberately **not** in this slice (it is the next task,
`let the witch write it`). By building the filter, the schema and the full offline path
first, the Claude path that lands next is a generator swapped in behind an interface that
is already proven, not a new path through the app.

The filter ships here even though nothing it defends against exists yet. The `offline
generator` cannot emit an unapproved ingredient, an unapproved verb, over-long text, or a
potion with no matched ingredient or no water — so every check is redundant on this path
by design. That is the point: one filter with no bypass is easier to prove correct than
two paths with different guarantees. AC2, AC2a, AC5 and AC13's drop/discard behaviour is
proven by **unit tests against synthetic candidates** — the shapes the witch generator
will later produce — with no model in the loop.

## Scope

In scope:
- Scaffold `backend/` — Node 20, TypeScript, ESM, Express 5, Vitest + Supertest. Its own
  flat `eslint.config.js` mirroring `frontend/`'s, sharing the root `.prettierrc`.
- `backend/src/data/ingredient.ts` — the machine-readable form of `.doc/ingredient.md`
  (ingredients with tags, the water flag, the neutral pool, approved verbs, the default
  feeling tag), plus a test asserting it matches `.doc/ingredient.md` exactly.
- The `feeling matcher` — trouble free-text → exactly one feeling tag, always returning
  one (default tag when nothing matches).
- The generator interface (`trouble` in, candidate `potion` out) and the
  `offline generator` behind it, taking an injected RNG so tests can seed it.
- The potion schema (AC7 shape), validated on the path.
- The `filter` — the five checks in `.doc/architecture.md`, in order: ingredients (+
  cascade into steps), floor of four, step verbs, readability, composition.
- `POST /api/potion` — rejects empty/whitespace trouble, runs the matcher, the generator
  and the filter, returns the potion plus which generator produced it.
- Frontend: author `.orchestrate/api-contract.yaml`; add `sonner` + `<Toaster>`; replace
  `lib/brew.ts`'s body with a real `fetch`; surface a failed brew as a toast (AC12);
  delete `src/fixture/potion.ts`; add `verb` to the `Step` type; a Vite dev proxy for
  `/api`; update the unit tests and scope guard the fixture deletion touches.
- Acceptance criteria AC1, AC2, AC2a, AC3, AC5, AC6, AC7, AC7a, AC7b, AC8, AC9, AC10,
  AC12, AC13. AC15 is the gate across both packages.

Out of scope:
- The `witch generator`: the versioned `prompt` file, the Claude call, reply parsing, the
  request timeout, and key-based generator selection. All of that is `let the witch write
  it`, and AC11 with it. This task's selection logic is trivially "always offline".
- Any persistence. A potion is generated per request and nothing is stored — no database,
  no cache, no session.
- A drawn/animated witch, sound, voice, the prepare-ahead list, public deployment.
- `lucide-react`: no new icons are needed this task; `sonner` is the only new UI dep.

## Assumptions

- Node 20+, matching the fixed stack in `.doc/product-definition.md`.
- The shipped `frontend/src/type/potion.ts` (`Potion`, `Step = { text, ingredient[] }`)
  is the seam task 001 left for us. The renderer reads `step.text` and ignores the rest,
  so adding a `verb` field to `Step` is additive and does not touch `PotionCard`.
- `.doc/ingredient.md` is the single source of truth; the code follows it and a test
  asserts they match. Everything this task needs — including the default feeling tag
  (`hopeful`) and the seventeen-tag list — is already recorded in the doc by a human.
  **Agents read `.doc/`, they never write it.** The ingredient data mirrors what the doc
  already says and the row-2 test proves it — see Q2.
- Vocabulary is fixed by `.doc/glossary.md`: `trouble`, `potion`, `ingredient`, `step`,
  `brew`, `generator`, `offline generator`, `filter`, `feeling tag`, `feeling matcher`.
  The route is `/api/potion`, singular, per `.claude/rules/naming.md`.
- `ANTHROPIC_API_KEY` is read only in `backend/` and is unset for this entire task; the
  path is offline-only. It is never returned in a response and never logged. The trouble
  text is never logged either (it is written by a child) — log the generator that ran,
  how many ingredients dropped, and timings, per `.doc/architecture.md`.
- Tests run with no network and no key (AC15). The seeded RNG makes the offline generator
  repeatable (AC9).
- The backend agent reads frontend types; note the path is `frontend/src/type/` (singular)
  here, not the `frontend/src/types/` its agent doc mentions — the API contract is the
  binding spec regardless, per Q4.

## Open Questions

**Q1 — What is the `step` shape for the AC2a cascade? → `{ text, ingredient: string[],
verb: string }`.**

The backlog recommends each step carry its verb and the ingredients it uses as fields
beside the child-facing text, so the cascade is a list check and AC5's verb check reads a
field instead of parsing prose. Agreed. One refinement: the shipped frontend type already
names the ingredient field `ingredient` (singular array, task 001 Q1), and
`.claude/rules/naming.md` prefers singular entity names — so keep that name and **add**
`verb`, giving `{ text: string; ingredient: string[]; verb: string }` rather than the
backlog's literal `{ verb, ingredients, text }`. Same three fields, names aligned with
shipped code and the naming rule. `verb` holds one approved verb exactly as it appears in
`.doc/ingredient.md`'s verb list.

**Q2 — Which tag is the default the feeling matcher returns when nothing matches, and
where does it live? → `hopeful`, already recorded in `.doc/ingredient.md`.**

A trouble that names no feeling still gets a potion, so the matcher must always return a
tag. The default is `hopeful`: the forward-looking answer when the witch cannot read the
feeling, and the tag whose ingredients (`a dried pasta star`, `a dandelion`, `a paper
star, cut out`) plus the neutral pool comfortably build a 5–7 ingredient potion. A human
has **already** written this into `.doc/ingredient.md` — the "Default tag: `hopeful`" line
under the feeling-tags section. This task does **not** edit `.doc/`; agents only read it.
The ingredient data carries the default as data (not a bare code constant), mirroring the
doc, and the row-2 data-matches-doc test is the guarantee against drift.

**Q3 — How does the feeling matcher turn text into a tag? → An ordered keyword list per
tag; first hit wins; no hit → the default.**

A static map of each feeling tag to a small list of keyword stems, scanned in a fixed
priority order over the lower-cased trouble, first hit wins, falling back to Q2's default.
Deterministic (no model, satisfies AC9), fully unit-testable, and good enough for v1 —
the product only promises matching beyond the empty-input check as a game, not real NLP.
A unit test pins a representative trouble corpus (including the six shipped chip phrases
from task 001 Q2) to expected tags, and asserts an unrecognisable trouble returns the
default.

**Q4 — How does the response record which generator produced it (AC10)? → An envelope:
`{ potion: Potion, generator: "offline" | "witch" }`.**

Recommend an envelope over a field inside the potion, so the `potion` object stays exactly
the shape `PotionCard` renders and the generator provenance is metadata beside it. This
task only ever returns `"offline"`; the `"witch"` value exists in the type for the next
task. `frontend/src/type/potion.ts` gains a `BrewResponse` type; `lib/brew.ts` returns the
`potion` (the UI does not display the generator in v1). `.orchestrate/api-contract.yaml`,
authored by the frontend agent, is the binding spec both sides implement.

**Q5 — How is the potion schema validated? → `zod` in `backend/`.**

Recommend `zod`: one schema object expresses name present, 5–7 ingredients, ≥3 ordered
steps each `{ text, ingredient[], verb }`, and a closing line, with precise parse errors,
all pure and offline. It is also reused next task to parse Claude's reply, so it earns its
place now. A hand-written validator is the fallback if a new runtime dependency is
unwanted — call it at the plan gate.

**Q6 — How does the browser reach the backend in dev without CORS or a key leak, and on
which port does e2e run? → A Vite proxy for `/api` → the backend (`PORT` default `8787`);
Playwright runs the frontend on a fixed `5199` with `--strictPort` and no server reuse.**

The browser calls same-origin `/api/potion`; Vite proxies `/api` to
`http://localhost:8787` in dev, so there is no CORS in dev and no base URL in the bundle.
The backend still sets CORS to `process.env.FRONTEND_URL` for non-proxied use. `PORT` is
configurable because 5173 (and neighbours) are often taken on this machine.

For e2e specifically, 5173 is occupied by **another user's copy of this app on this shared
machine**, so Playwright must never reuse whatever is already there. It starts its own Vite
on port **5199** with `--strictPort` (fail, don't drift to another port), points `baseURL`
at `http://localhost:5199`, and sets `reuseExistingServer: false` so a stale or foreign
server is never adopted as ours. Its `webServer` starts both the backend and this
dedicated frontend for the run.

## Steps

Two packages. The frontend agent runs first (authors the contract, does its wiring);
the backend agent implements that contract; QA runs last.

### Frontend (agent: frontend)

1. **Author the contract.** Write `.orchestrate/api-contract.yaml` from
   `frontend/src/type/potion.ts`: `POST /api/potion`, request `{ trouble: string }`,
   `200 → { potion, generator }` with the full potion schema (name; `ingredient` 5–7
   strings; `step` ≥3 of `{ text, ingredient[], verb }`; `closingLine`), `400 → ` the
   error shape from the `error-handling` skill for empty/whitespace, `500 → ` the same
   shape for an internal failure. This file is the backend's spec.
2. **Step type.** Add `verb: string` to `Step` in `frontend/src/type/potion.ts`; add a
   `BrewResponse = { potion: Potion; generator: "offline" | "witch" }` type (Q4).
3. **Real request.** Replace the body of `frontend/src/lib/brew.ts`: `POST /api/potion`
   with `{ trouble }`, parse `BrewResponse`, return `potion`. Throw on a non-OK status or
   a network/parse failure. Delete the simulated delay. Signature stays
   `brewPotion(trouble: string): Promise<Potion>` so `App` barely changes.
4. **Failure UX (AC12).** Add `sonner`; render `<Toaster>` once at the app root. In `App`,
   wrap the `await brewPotion` in try/catch: on failure show a concise, action-oriented
   `sonner` toast, return `brewState` to `waiting`, and re-enable Brew — never fail
   silently, never leave it stuck in `brewing`.
5. **Delete the fixture.** Remove `frontend/src/fixture/potion.ts`. Move the potions the
   unit tests build inline into those test files as synthetic data (`App.test.tsx`,
   `PotionCard.test.tsx` both import it today) — test files may carry ingredient strings;
   the scope guard exempts them. Add the `verb` field to those synthetic steps.
6. **Scope guard.** Update `frontend/src/test/scope-guard.test.ts` to drop the now-dead
   fixture exemption — with no fixture, **no** shipped file under `frontend/src` may
   contain an approved ingredient name, and nothing imports `.doc/ingredient.md`.
7. **Dev proxy + e2e wiring (Q6).** Add a Vite `server.proxy` for `/api` →
   `http://localhost:8787`. Configure Playwright to run e2e on a **dedicated** frontend:
   `webServer` starts Vite on port `5199` with `--strictPort` and the backend, `baseURL`
   is `http://localhost:5199`, and `reuseExistingServer: false` — so the other user's copy
   of this app on 5173 is never adopted and the run always uses a server Playwright owns.

### Backend (agent: backend)

8. **Scaffold** `backend/` only if absent: `npm init`, Express 5, `cors`, `dotenv`; dev
   deps TypeScript, `tsx`, Vitest, Supertest, `zod` (Q5), ESLint + typescript-eslint +
   `eslint-config-prettier`. `"type": "module"`. Flat `backend/eslint.config.js`
   mirroring `frontend/`'s with `eslint-config-prettier` last; share the root
   `.prettierrc`. Add `lint`, `format`, `format:check`, `typecheck` (`tsc --noEmit`),
   `test` (`vitest run`), `dev` scripts. `backend/.env.example` listing
   `ANTHROPIC_API_KEY` (optional), `PORT`, `FRONTEND_URL` with placeholders — never a real
   `.env`.
9. **Ingredient data** `backend/src/data/ingredient.ts`: every ingredient with its tags,
   the water flag, the neutral-pool membership, the approved verb list, the seventeen
   feeling tags, and the default tag (Q2), all mirrored from `.doc/ingredient.md` — the
   doc is **read only**, never edited. `backend/src/data/ingredient.test.ts` parses
   `.doc/ingredient.md` and asserts the data matches it exactly — names, tags, verbs, the
   neutral pool, and the default tag. This is the AC1 anchor and the anti-drift guarantee.
10. **Feeling matcher** `backend/src/matcher/feeling.ts` (Q3): `trouble → feeling tag`,
    always one. Unit test the corpus and the default.
11. **Types + interface.** `backend/src/type/potion.ts` mirrors the frontend potion/step
    shape plus a candidate type (a pre-filter potion that may hold unapproved
    ingredients/verbs, for the synthetic filter tests). `backend/src/generator/interface.ts`
    — one shape both generators satisfy: `(trouble, tag, rng) → candidate potion`.
12. **Seeded RNG** `backend/src/lib/rng.ts`: a small deterministic PRNG from a numeric
    seed (e.g. mulberry32), injected into the generator. Fixed seed → identical sequence
    (AC9); the route picks a fresh seed per request (AC8).
13. **Offline generator** `backend/src/generator/offline.ts`: from the matched tag, pick
    **at least one** ingredient carrying that tag, always add the water, fill the rest
    from the neutral pool to a total of 5–7 (no upper bound on matched count), and
    assemble ≥3 ordered steps. Each step is built from one approved verb plus the
    ingredients it uses, with short child-facing `text` kept within AC13's limits by
    construction, and its `verb`/`ingredient` fields populated. Deterministic given the
    injected RNG.
14. **Potion schema** `backend/src/schema/potion.ts` (Q5): the AC7 shape — name, 5–7
    ingredients, ≥3 ordered steps each `{ text, ingredient[], verb }`, closing line. The
    route runs it **twice**: on the raw candidate before the filter, and on the filtered
    potion before returning (the cascade removes steps and ingredients, so the result must
    be re-proven to still be a valid potion). Also available to the next task's reply
    parsing.
15. **Filter** `backend/src/filter/filter.ts` — the five checks in order, per
    `.doc/architecture.md`:
    1. **Ingredients + cascade (AC1/AC2/AC2a):** drop any ingredient not in the data.
       Then drop **any step that references *any* removed ingredient** — not only steps
       whose referenced ingredients are *all* gone. AC2a forbids any served step from
       mentioning a removed ingredient, so a step that mixes one dropped ingredient with
       surviving ones is removed whole, not kept. Surviving steps keep their original
       order. If **fewer than three steps remain** after the cascade, discard the whole
       candidate (a potion needs ≥3 ordered steps — AC7). Finally, discard the candidate
       if any surviving step references an ingredient **not in the potion's own surviving
       ingredient list** (AC5 — every step uses only ingredients present in that potion).
    2. **Floor of four (AC3):** fewer than four approved ingredients surviving → discard
       the whole candidate.
    3. **Step verbs (AC5):** any step whose `verb` is not on the approved list → discard.
    4. **Readability (AC13):** across the name, every step `text`, and the closing line,
       any sentence over 14 words or any word over 10 letters → discard. Strip each step's
       referenced ingredient names from its text before measuring, since ingredient names
       are exempt.
    5. **Composition (AC7a/AC7b):** no surviving ingredient carrying the feeling tag, or
       no water → discard.
    Checks 2–5, and the two discard conditions in check 1, discard rather than repair; a
    discarded candidate falls through to the offline generator (which here *is* the
    candidate — see Risks). The filter returns the cleaned potion or a discard reason. The
    route then re-runs the schema (step 14) on that cleaned potion before returning it.
16. **Route** `backend/src/route/potion.ts` + `backend/src/index.ts`: `POST /api/potion`.
    Reject empty/whitespace `trouble` first with `400` and the error shape (AC6, no potion
    produced). Otherwise: feeling matcher → offline generator (fresh seed) → schema (on the
    raw candidate) → filter → schema (on the filtered potion) → return `{ potion, generator:
    "offline" }` (AC10). A schema or filter failure returns `500` with the error shape (never
    the rejected potion, never a stack trace — see Risks). CORS to `FRONTEND_URL`. Log
    generator, drop count, timing — never the trouble, never the key.
17. **Tests** (writing-tests skill):
    - Filter units on **synthetic candidates**: unapproved ingredient dropped and the rest
      served with ≥4 surviving (AC2); a step referencing **any** removed ingredient removed
      whole — including a step that mixes a dropped ingredient with surviving ones — others
      kept in order (AC2a); the cascade leaving fewer than three steps discards the
      candidate (AC7); a step referencing an ingredient not in the potion's own list
      discards the candidate (AC5); <4 survivors discarded (AC3); an unapproved verb
      discarded (AC5); over-limit text discarded (AC13); no matched ingredient or no water
      discarded (AC7a/AC7b); and the filtered potion is re-validated against the schema.
    - Offline generator: fixed seed → identical potion (AC9); ten distinct seeds for one
      trouble → more than one distinct potion (AC8); output always schema-valid, always
      contains water, always ≥1 matched ingredient, and always passes the filter over a
      trouble corpus (the composition guarantee).
    - Route (Supertest): happy path returns the envelope and 200 (AC7/AC10); empty and
      whitespace-only troubles return 400 with the error shape (AC6); every served
      ingredient is in the data (AC1).

## Validation

QA's checklist. Every row is a command or a test.

| # | Check | Criterion |
|---|---|---|
| 1 | `cd backend && npm run lint && npm run format:check && npx tsc --noEmit` all clean; same in `frontend/` | AC15 |
| 2 | Backend unit — ingredient data matches `.doc/ingredient.md` exactly (names, tags, verbs, neutral pool, default tag) | AC1 |
| 3 | Backend unit — a synthetic candidate with one unapproved ingredient serves the rest, with ≥4 approved surviving | AC2 |
| 4 | Backend unit — a step referencing **any** removed ingredient is removed whole (including a step that mixes a dropped ingredient with surviving ones); others keep their order | AC2a |
| 5 | Backend unit — the cascade leaving fewer than three steps discards the candidate | AC7 |
| 6 | Backend unit — a step referencing an ingredient not in the potion's own list discards the candidate | AC5 |
| 7 | Backend unit — <4 surviving approved ingredients discards the candidate | AC3 |
| 8 | Backend unit — a step with an unapproved verb discards the candidate | AC5 |
| 9 | Backend unit — a sentence >14 words, or a non-ingredient word >10 letters, discards the candidate | AC13 |
| 10 | Backend unit — a candidate with no matched ingredient, or no water, is discarded | AC7a / AC7b |
| 11 | Backend unit — the filtered potion is re-validated against the schema before serving | AC7 |
| 12 | Backend unit — the feeling matcher returns the expected tag for a trouble corpus, and the default for an unrecognisable trouble | Q2 / Q3 |
| 13 | Backend unit — fixed seed → byte-identical potion for the same trouble | AC9 |
| 14 | Backend unit — one trouble, ten distinct seeds → more than one distinct potion | AC8 |
| 15 | Backend unit — the offline potion is always schema-valid, has water, has ≥1 matched ingredient, and passes the filter across the trouble corpus | AC7 / AC7a / AC7b |
| 16 | Backend integration — `POST /api/potion` happy path → 200, `{ potion, generator: "offline" }`, every ingredient in the data | AC1 / AC7 / AC10 |
| 17 | Backend integration — empty and whitespace-only `trouble` → 400 with the error shape, no potion | AC6 |
| 18 | Frontend unit — `brewPotion` POSTs to `/api/potion` and returns the response potion; a non-OK/failed response throws | AC12 seam |
| 19 | Frontend unit — a thrown brew surfaces a `sonner` toast and returns to `waiting` with Brew enabled | AC12 |
| 20 | Frontend unit — scope guard: no shipped `frontend/src` file holds an approved ingredient name, and nothing imports `.doc/ingredient.md` | scope guard |
| 21 | Repo check — `grep -r ANTHROPIC_API_KEY frontend/` finds nothing; the fixture file is gone | key safety / DoD |
| 22 | E2E (Playwright on `localhost:5199`, `--strictPort`, `reuseExistingServer: false`) — type a trouble, Brew, a real potion from the route renders full-screen | end to end |
| 23 | E2E — with the backend made to fail, Brew shows a `sonner` toast and the form is usable again | AC12 |

## Risks

- **The fixture becomes a silent fallback.** The failure mode is wiring the route but
  leaving the old fixture as an `||` on the error path, serving a potion the filter never
  saw. Mitigated by deleting the file outright (step 5), by the scope guard (row 20), and
  by making its deletion part of this task's definition of done (row 21).
- **The offline path has nothing below it to fall through to.** Architecture says a
  discarded candidate falls through to the offline generator — but here the offline
  generator *is* the only generator, so a filter discard on this path is a bug, not a
  fallback. Mitigated by building the offline generator to pass all five checks by
  construction and by row 15 proving it over a trouble corpus; if it ever discards, the
  route returns `500` with the error shape (never the rejected potion, never a stack
  trace) and logs the reason. The real fall-through arrives with the witch generator.
- **The data drifts from the doc.** Two copies of the safety list is the core hazard.
  Mitigated by row 2 asserting an exact match, including the human-recorded default tag.
- **AC13's ingredient-name exemption is subtle.** Measuring word length naively would
  flag long ingredient names the rule exempts. Mitigated by stripping each step's
  referenced ingredient names from its text before measuring (step 15.4), and by row 9
  testing a candidate that is legal only because of the exemption.
- **Variation vs determinism pull opposite ways.** AC8 wants different potions, AC9 wants
  identical ones. Mitigated by injecting the RNG: the route seeds randomly (AC8), tests
  seed fixed (AC9). Keeping the seed the single source of nondeterminism is what makes
  both provable.
- **Step-type drift across the seam.** If the backend returns bare-string steps or omits
  `verb`, the renderer breaks and AC2a/AC5 lose their field checks. Mitigated by the
  frontend authoring `.orchestrate/api-contract.yaml` from the type (step 1) and the
  backend implementing exactly that.
- **`frontend/src/type/` vs `types/`.** The backend agent doc points at
  `frontend/src/types/**`; the real path is singular. The API contract is the binding
  spec, so this is a note, not a blocker — but worth stating so the backend does not stall
  looking for a plural directory.

## Rollout Order

One branch, `feat/brew-without-a-key` (already checked out). Order:

1. Frontend authors `.orchestrate/api-contract.yaml` (step 1) — the backend's spec.
2. Frontend wiring (steps 2–7): type, real `fetch`, `sonner`, fixture deletion, scope
   guard, dev proxy. Frontend unit tests pass with `brewPotion` mocked, independent of the
   backend.
3. Backend (steps 8–17) implements the contract exactly; its unit and integration suites
   pass with no network and no key.
4. QA runs both suites and the e2e (which needs both processes up via Playwright
   `webServer`), and checks the Validation table against the acceptance criteria.

Merge only once every Validation row passes. The next task, `let the witch write it`,
starts from the merged result and swaps in a second generator behind the interface built
here.

## Rollback

`backend/` is entirely new; deleting it and reverting the frontend changes restores the
task-001 fixture behaviour. Frontend rollback is small and mechanical: restore
`src/fixture/potion.ts`, revert `lib/brew.ts` to the simulated delay, drop `sonner`, the
`verb` field, the Vite proxy and the scope-guard edit. There is no data, no migration, no
persisted state, and no deployed surface — rollback is deleting the branch or `git revert`
of the merge.

This task makes **no** edits outside `frontend/` and `backend/` — in particular it does
not touch `.doc/`, which already carries the default tag and the seventeen-tag list a
human recorded. There is nothing in `.doc/` to revert, and the row-2 test keeps doc and
data in step either way.
