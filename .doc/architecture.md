# System Architecture

## Purpose
- Provide a concise architecture reference for service boundaries, ownership, and major flows.

## System Overview
- Two runtime components: a React browser app and a Node service. The browser never
  talks to Claude and never holds a key. Every brew goes through the Node service.

## Context
- The system turns one `trouble` into one `potion` a child can physically make.
- The binding constraint is safety, not scale. Every ingredient served must come from
  `.doc/ingredient.md`, and that is enforced in code rather than by asking Claude nicely.
- The second constraint is that a fresh clone must work with no API key at all.

## Primary Components

| Component | Lives in | Responsibility |
|---|---|---|
| Browser app | `frontend/` | Text box, chips, Brew button, potion display. Holds no key and no ingredient logic |
| Brew route | `backend/` | `POST /api/potion`. Validates the trouble, picks a generator, runs the filter, returns the potion |
| Generator interface | `backend/` | One shape both generators satisfy: `trouble` in, candidate `potion` out |
| Offline generator | `backend/` | Matches the trouble against feeling tags, picks ingredients and assembles a potion. Takes an injected random number generator so tests can seed it |
| Witch generator | `backend/` | Sends the prompt and the approved ingredient list to Claude, parses the reply |
| Filter | `backend/` | Removes unapproved ingredients, cascades removals into the steps, enforces the floor of four, rejects unapproved step verbs, and rejects text over the readability limits |
| Ingredient data | `backend/` | The machine-readable form of `.doc/ingredient.md`, asserted to match it by a test |
| Prompt | `backend/` | A versioned file, passed into the witch generator as input, never inlined |

## Data Flow
1. The child types a `trouble`, or clicks a `chip` that fills the box, and presses Brew.
2. The browser posts the trouble to `POST /api/potion`.
3. The route rejects an empty or whitespace-only trouble before anything else runs.
4. Generator selection: if `ANTHROPIC_API_KEY` is set, the `witch generator` runs;
   otherwise the `offline generator` runs.
5. The candidate potion goes through the filter, which applies four checks in order:
   1. **Ingredients** — anything not in `.doc/ingredient.md` is dropped, and any step
      that referred only to a dropped ingredient is dropped with it.
   2. **Floor of four** — fewer than four approved ingredients surviving discards the
      whole candidate.
   3. **Step verbs** — a step whose verb is not on the approved list in
      `ingredient.md` discards the whole candidate. This is a safety check, not a style
      one: "heat the mixture" and "cut the ribbon" are exactly what it exists to stop.
   4. **Readability** — text over the limits in `product-definition.md` discards the
      whole candidate.
6. A discarded candidate falls through to the `offline generator`. That result is passed
   through the same filter — it can only pass, because it was built from the approved
   list and the approved verbs in the first place.
7. The route returns the potion, plus which generator produced it.

Checks 3 and 4 discard rather than repair. Rewriting a child's recipe to make it legal
would produce something neither generator intended; falling back gives a potion that is
whole and known-good.

The filter runs on **both** paths, not just the Claude one. The offline generator can
never produce an unapproved ingredient, so the check is redundant there by design —
which is exactly why it belongs there. A single filter with no bypass is easier to prove
correct than two paths with different guarantees.

## Auth and Org Boundaries
- There is no user authentication. No accounts, no sessions, no personal data stored.
- The only boundary that matters is the key boundary: `ANTHROPIC_API_KEY` is read by the
  Node service from `backend/.env` and never crosses into anything sent to the browser.
  `.claude/settings.json` already denies agents read access to that file.

## External Dependencies
- The Anthropic Messages API, and only on the `witch generator` path. It is optional —
  with no key configured the system is fully functional on the offline generator.
- No database, no object storage, no third-party service beyond that.

## Operational Concerns
- **Timeout.** The witch generator has a request timeout. On timeout, fall through to the
  offline generator rather than surfacing an error.
- **Failure handling.** Every failure on the Claude path — timeout, malformed reply,
  schema mismatch, too few surviving ingredients — degrades to the offline potion. The
  child sees a potion, never a stack trace.
- **Logging.** Do not log the trouble text. It is written by a child and may name people,
  places, or family circumstances, and the product stores nothing else about them. Log
  which generator ran, how many ingredients were dropped, and timings — never the input
  and never the key.
- **Cost.** One brew is one Claude call. There is no retry loop on the Claude path; a
  failure falls back rather than trying again.

## Change Log
- 2026-08-25 — Initial architecture. Two services, two generators behind one interface,
  filter on both paths, prompt as a versioned file.

## Update Triggers
- Update this file when API routes, auth boundaries, org boundaries, or major component ownership changes.
