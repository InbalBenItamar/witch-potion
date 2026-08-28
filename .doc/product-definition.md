# Product Definition

## Purpose
- Define shared product intent so planning, architecture, and delivery stay aligned.
- This file is the closest thing this repo has to a PRD. The Orchestrator agent reads it
  for planning, and the QA agent checks delivered work against the acceptance criteria
  below.

## Product Vision
- A child tells a witch what is bothering them. The witch hands back a potion recipe they
  can really make, out of things already in the kitchen, the garden, or the craft drawer.
- The potion is the point. It is a game, not a lesson — the witch takes a grumble
  completely seriously and answers it with flour, glitter and a fizz.
- Version one is a React app and a Node service. The Node service holds the API key and
  chooses between the two generators; the browser never sees a key.

## Target Users
- Primary users: a child of about seven to nine and a grown-up, playing together.
	- Who they are: the child reads the potion and leads it. The grown-up is at the table
	  with them, hands in the bowl — not supervising from the next room.
	- What they are trying to accomplish: spend an afternoon making something together and
	  connect over it. The potion gives them a reason to start and something to talk about
	  while they are doing it.
	- What this means for the interface: it is read across a table by two people at once.
	  Large text, generous tap targets, nothing that assumes one person is holding a phone,
	  and the recipe stays on screen while both pairs of hands are busy and messy.
- Secondary users: a child playing on their own.
	- Supporting roles and their core needs: everything works solo. No step needs a second
	  pair of hands, and every ingredient is safe enough that nobody has to be watching.

## Problem Statement
Most children's apps are something you hand a child so they will be quiet. This is the
opposite. The witch gives a family a reason to clear the table, raid the cupboard and the
craft drawer, and spend an hour connecting over petals, glitter and fizz. The potion is
the excuse. The afternoon is the product.

## Value Proposition
- Real ingredients, from the kitchen, the garden or the craft drawer. Nothing to buy.
- Really makeable, in ten minutes, by a seven-year-old.
- Silly on purpose. The witch never explains the feeling back at you and never says
  "it will pass" — she just hands over a recipe and lets the afternoon do the rest.
- Safe by construction: potions are built from a fixed approved list, not from whatever
  a language model felt like inventing.

## Product Scope
- In scope (version one):
	- One trouble in, one potion out. A text box, suggestion chips, and a Brew button.
	- Suggestion chips for children who freeze at an empty box.
	- Two generators behind one interface: the `offline generator` (no key needed) and
	  the `witch generator` (Claude, when a key is present).
	- Ingredient filtering: anything outside `ingredient.md` is dropped before serving.
	- A potion: a name, five to seven ingredients, ordered steps, a closing line, and the
	  never-drink-it notice.
	- Brew again, with a different potion for the same trouble.
	- A visible witch, as an emoji placeholder. She is who the child is talking to, so
	  the screen must read as hers even before she is drawn properly.
	- Responsive layout down to a 375-pixel-wide screen.
- Out of scope (version one):
	- Saving anything. No accounts, no history, no shelf of past potions.
	- A prepare-ahead shopping list.
	- Voice input instead of typing, and the witch reading potions aloud.
	- Sound of any kind. Version one is silent.
	- A drawn witch. Version one uses an emoji placeholder; the SVG comes next.
	- An animated witch.
	- Public deployment and anything about who pays for API calls.
	- Any real-world moderation of what a child types beyond the empty-input check.

## Acceptance Criteria
Each criterion must be provable by a test. The QA agent marks these PASS/FAIL per task.

- AC1 — Ingredient safety: every ingredient in every served potion, from either
  generator, appears in `.doc/ingredient.md`. Exact match, no partial or fuzzy matching.
- AC2 — Unapproved ingredients are dropped: a `witch generator` response containing an
  unlisted ingredient has that one ingredient removed and the rest served, provided at
  least four approved ingredients remain.
- AC2a — Dropping cascades to the steps: no served potion contains a step mentioning a
  removed ingredient. A step referring only to the dropped ingredient is removed with
  it, and the remaining steps stay in order and still read as a recipe.
- AC3 — Floor of four: if fewer than four approved ingredients survive filtering, the
  `offline generator` potion is served instead. The rejected potion never reaches the
  browser.
- AC4 — Not for drinking: every served potion carries the notice that it is not to be
  eaten or drunk.
- AC5 — Steps are doable: every step in every served potion uses only ingredients present
  in that potion and a verb from the approved list in `.doc/ingredient.md`. No heat, no
  cutting, no tasting. Enforced by the filter on both generator paths — a candidate with
  an unapproved verb is discarded and the offline potion served instead.
- AC6 — Input: clicking a chip fills the text box; submitting an empty or whitespace-only
  trouble is refused with a friendly message and produces no potion.
- AC7 — Potion shape: name, five to seven ingredients as generated, at least three
  ordered steps, and a closing line. Validated against a schema on both paths.
- AC7a — Every potion is about the trouble: at least one ingredient carries a feeling tag
  matching the trouble, and no more than three do. The remainder come from the neutral
  pool in `.doc/ingredient.md`. A potion with zero matched ingredients is not a potion for
  that trouble and is rejected.
- AC8 — Variation: the same trouble brewed ten times produces more than one distinct
  potion.
- AC9 — Repeatable tests: given a fixed seed, the `offline generator` returns an
  identical potion for the same trouble every time.
- AC10 — Works with no key: with `ANTHROPIC_API_KEY` unset the app serves an offline
  potion and never errors. The response records which generator produced it.
- AC11 — Key safety: `ANTHROPIC_API_KEY` appears nowhere in the built browser bundle,
  provable by searching the build output.
- AC12 — Failure states: a failed or timed-out brew surfaces a `sonner` message and
  never fails silently.
- AC13 — Readable by a seven-year-old: across the potion name, every step, and the
  closing line, no sentence exceeds **14 words** and no word exceeds **10 letters**.
  Ingredient names are exempt, since they come from the approved list and are already
  fixed. Enforced by the filter on both paths; a candidate over either limit is
  discarded and the offline potion served instead.
- AC14 — Responsive: usable at a 375-pixel-wide viewport with no horizontal scrolling.
- AC14a — Readable across a table: body and potion text render at **18px or larger**, and
  every interactive target is at least **44 by 44 pixels**.
- AC15 — Quality gates: `npx tsc --noEmit` is clean, and the unit and integration suites
  pass with no network access.

## Success Metrics
- Product metrics:
	- Every journey in Product Scope is covered by at least one test.
	- Zero unapproved ingredients served, across the whole test corpus of troubles.
	- A potion arrives within three seconds on the `witch generator` path, or the offline
	  potion is served instead.
- Quality metrics:
	- Zero TypeScript errors; zero failing tests on the mainline branch.
	- The test suite runs with no network access and no API key.

## Constraints and Assumptions
- Stack is fixed for version one: React with Vite, TypeScript, Tailwind v4,
  `lucide-react`, `sonner` in `frontend/`; Node 20, TypeScript, Express 5, Vitest and
  Supertest in `backend/`. This task is marked `stack:full`.
- Bring your own key. `ANTHROPIC_API_KEY` lives in `backend/.env`, is read only by the
  Node service, and is optional — without it the `offline generator` runs.
- The prompt sent to Claude is a versioned file under `backend/`, never a string literal
  in the calling code, so it can be swapped and evaluated later.
- `.doc/ingredient.md` is the single source of truth for what may appear in a potion. The
  code's ingredient data must match it, asserted by a test.
- The witch generator is constrained to the approved list by construction, not by
  instruction. A prompt asking for safe ingredients is not sufficient and is not the
  mechanism relied on.

## Prioritization Rules
- Prioritize work that most improves user outcomes and core metrics.
- Prefer changes that reduce operational complexity and support costs.
- Defer low-impact features unless required for launch readiness.

## Update Triggers
- Update this file when core user segments, product scope, acceptance criteria, or
  success metrics change.
- Update it whenever `.doc/ingredient.md` gains or loses a rule — the safety criteria
  above depend on it.
