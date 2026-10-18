# Prioritized Backlog

Format:
- `- [ ] <title>`
- `- [ ] <title> | figma:<url>`   optional design reference
- `- [ ] <title> | stack:full`    opts the task into the backend stage

Tasks are **frontend-only by default** — the loop runs frontend + qa and skips the
backend agent unless a task is marked `stack:full` or a `backend/` directory exists.
See `.doc/product-definition.md` for the acceptance criteria QA checks against, and
`.doc/ingredient.md` for the approved ingredient list every potion is built from.

Current queue:
- [x] brew without a key | stack:full

  Scaffolds `backend/` and makes the app work end to end with no `ANTHROPIC_API_KEY` at
  all. The ingredient data and the test asserting it matches `.doc/ingredient.md`, the
  generator interface, the `offline generator`, the filter, the potion schema, and
  `POST /api/potion`. The screen drops its fixture and calls the route. `backend/` gets
  its own `eslint.config.js` mirroring the frontend's and shares the root `.prettierrc`.
  Acceptance criteria AC1, AC2, AC2a, AC3, AC5, AC6, AC7, AC7a, AC7b, AC8, AC9, AC10,
  AC12, AC13. AC15 covers every slice.

  The filter ships here even though nothing it defends against exists yet. The `offline
  generator` cannot produce an unapproved ingredient, so every check is redundant on this
  path by design — which is the point. A single filter with no bypass is easier to prove
  correct than two paths with different guarantees, and the drop-and-cascade rules of AC2
  and AC2a are unit-testable against synthetic candidates without a model in the loop.

  Decided 2026-10-18 — the plan builds on these, it does not reopen them:

  - **No cap on matched ingredients.** AC7a is now "at least one", with no upper limit.
    The old three-cap clashed with the neutral pool, several of whose entries carry the
    same tags.
  - **Water in every potion** (new AC7b). In the data it is a flag of its own, not a
    feeling tag — that retires the `base` pseudo-tag. No new liquids added.
  - **The `feeling matcher` owns trouble → tag**, and always returns a tag: a trouble
    that names no feeling gets a default tag defined in the ingredient data. Because of
    that, AC7a and AC7b become the filter's fifth check, `composition`, and the offline
    potion still can only pass. Which tag is the default, and how text is matched
    (keyword list or otherwise), are for the plan.
  - **`hopeful` is added to the tag list** in `.doc/ingredient.md` — seventeen tags.

  Still open, recommended answer below — confirm or change at the plan gate:

  - **Step shape for the AC2a cascade.** Recommended: each step carries its verb and the
    ingredients it uses as fields, beside the child-facing text — `{ verb, ingredients,
    text }`. The cascade is then a list check rather than substring matching on prose,
    and AC5's verb check reads the field instead of parsing a sentence.

- [ ] offline mode: pick a feeling | stack:full

  With no key, the child taps how they feel instead of typing what happened. The
  keyword feeling matcher cannot read open-ended text: on 2026-10-18 a fresh set of 15
  troubles phrased the way children talk ("my brother keeps hitting me", "I have to
  sing in assembly") matched 20%, before and after tuning — misses fall back to a
  `hopeful` potion that is safe but not about the trouble. Letting the child choose
  the feeling makes the match exact by construction. It also suits the youngest end of
  the audience — tapping a face is easier than writing a sentence.

  Decided 2026-10-18 — the plan builds on these, it does not reopen them:

  - **Ten feeling chips, each with a face.** Seventeen tags is too many for a child to
    scan; ten covers the common troubles. Proposed set: `sad`, `angry`, `scared`,
    `worried`, `lonely`, `left-out`, `missing-someone`, `frustrated`, `jealous`,
    `bored`. Confirm or swap at the plan gate.
  - **The text box is shown greyed out, with a short child-facing explanation** of why
    the witch cannot read it right now — not hidden, so the feature is visible and the
    layout is the same in both modes.
  - **Not random.** A random feeling can be cruel — "my dog died" answered with the
    potion for anger. A chip pick is always the child's own feeling.
  - **The browser learns the mode from the backend**, which alone knows whether a key
    is set — for example `GET /api/mode` → `offline` | `witch`. Only the mode crosses
    to the browser; the key never does.
  - **The keyword matcher stays** for one case: a witch-mode brew whose Claude call
    fails falls back to the offline potion, which still needs a feeling from text.

  Open for the plan: the explanation's wording; how a picked feeling travels in the
  request (a `tag` beside or instead of `trouble`); the empty-input rule (AC6) in chip
  mode; and whether witch mode also shows the feeling chips. Changes AC6 and the chip
  definition in `.doc/glossary.md` (chips stop being example troubles in this mode), so
  `.doc/product-definition.md` and the glossary are updated by a human before the run.

- [ ] let the witch write it | stack:full

  Adds the `witch generator`: the versioned prompt file, the Claude call, reply parsing,
  the request timeout, and generator selection on whether the key is present. Every
  failure on this path — timeout, malformed reply, schema mismatch, too few surviving
  ingredients — degrades to the offline potion rather than surfacing an error.
  Acceptance criteria AC11, plus AC1 to AC5 and AC13 re-proven on the Claude path.

  With a key, Claude also decides the feeling from the child's text — it reads
  "my dog died" as sad without a keyword list. The keyword matcher remains only as the
  offline fallback (see the task above).

  Last rather than first because it is the only slice that needs a key, costs money per
  run, and cannot be tested deterministically. By the time it lands, the filter it feeds
  is already proven and the screen already works without it — so this is a generator
  swapped in behind an interface, not a new path through the app.

- [ ] draw the witch

  Replace the version one emoji placeholder with a real witch, as an inline SVG
  React component. No asset files and no external requests, so a fresh clone
  works offline.

  SVG rather than a raster image because "animate the witch" is queued below it:
  animating named SVG paths is CSS keyframes, animating a PNG is a sprite sheet
  or a rewrite. Name the paths for the parts that will move — hat, hands,
  cauldron, steam — even though nothing moves yet.

  She has three states to look right in: waiting for a trouble, brewing, and
  presenting a potion. Draw for all three now even if only the first is wired up.

  A code-drawn SVG will read flat and geometric rather than storybook. If that is
  not good enough, this is the task where a licensed illustration or a Lottie file
  gets swapped in instead — the component boundary is the same either way.

- [ ] prepare-ahead list | stack:full

  Let an adult tick which approved ingredients they actually have, before play
  starts. The witch then brews only from what is ticked, so a potion never asks
  for something that is not in the house. Grouped by where each one is found —
  kitchen, garden, craft drawer.

  The ticked set narrows the same allowlist the filter already applies, rather
  than adding a parallel mechanism. It must survive from the checklist to the
  brew, so this is the task that introduces state — version one deliberately
  stores nothing. Decide where it lives before building.

  Offer the starter kit from `.doc/ingredient.md` as a one-tap preset — sixteen
  ingredients that between them cover all seventeen feeling tags, so ticking it
  guarantees the witch can brew for anything. A flat minimum of ten ticks is the
  floor beneath it, but ten arbitrary ticks do not guarantee coverage: check that
  what is ticked can still produce a potion for every feeling, and say which
  feelings are unreachable if it cannot.

  Never quietly fall back to the full list when the ticked set is too thin. That
  would break the promise the checklist makes — that a potion only asks for what
  is in the house.

- [ ] evaluate and tune the prompt

  Run a fixed set of troubles through two prompt versions and compare the potions.
  Needs a scoring script beside the prompt. Depends on the prompt already being a
  versioned file, which version one establishes.

- [ ] speak the trouble instead of typing it

  `SpeechRecognition` in the browser, no API cost, no server round trip. Must degrade
  to the text box on Safari and Firefox rather than hiding the feature.

- [ ] hear the potion read aloud

  `speechSynthesis` reads the potion back in the witch's voice. Lower the pitch and
  slow the rate to make her sound like herself; voice quality varies by operating
  system and cannot be guaranteed, so it must still be readable on screen.

  Wider browser support than speech input — Safari and Firefox both synthesise, and
  neither recognises reliably — so this stands alone and does not depend on the task
  above.

  Matters most for the youngest end of the audience: a seven-year-old who reads
  haltingly can be read to, and a pre-reader can play with a grown-up reading nothing
  at all.

- [ ] animate the witch

  She reacts while the potion is brewing — hat tilting, hands stirring, steam
  rising. CSS keyframes on the SVG paths named in "draw the witch", which this
  depends on. Design work, no architectural change.

  Respect `prefers-reduced-motion`: the animation is decoration, and the potion
  must arrive with or without it.

- [ ] witchy sound effects

  A cackle, a bubbling cauldron, and a fizz when the lemon juice meets the baking
  soda. Bundled audio files, kept local so a fresh clone works offline — CC0 clips
  are fine, record the licence for each one.

  Browsers block audio until the user has interacted with the page, which is
  satisfied here because brewing starts with a button press. Sound on brew is fine;
  sound on page load would not be.

  Needs a visible mute control, remembered between visits. A children's app that
  makes noise unexpectedly is a problem — a sleeping sibling, a classroom, a parent
  on a call. Do not bury it in a settings screen.

## DONE

- [x] the potion on screen

  One screen, one fixed potion, no service. The text box, the `chip` row, the Brew
  button, the emoji witch, and a potion rendered in full — name, ingredients, ordered
  steps, closing line, and the never-drink-it notice. Brew shows the same hard-coded
  potion every time. Scaffolds `frontend/` with Vite, Tailwind v4, Vitest and Playwright.
  Acceptance criteria AC4, AC6 (the empty-trouble message), AC14, AC14a — all met; see
  `.plan/001-2026-08-31-potion-on-screen.md`.

  Shipped as a full-screen potion view rather than the inline layout first planned —
  Brew replaces the form with the potion and a Back control, decided over an overlay
  modal for accessibility reasons recorded in that plan's Q5. Merged to `main` 2026-09-03.
