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
- [ ] brew without a key | stack:full

  Scaffolds `backend/` and makes the app work end to end with no `ANTHROPIC_API_KEY` at
  all. The ingredient data and the test asserting it matches `.doc/ingredient.md`, the
  generator interface, the `offline generator`, the filter, the potion schema, and
  `POST /api/potion`. The screen drops its fixture and calls the route. `backend/` gets
  its own `eslint.config.js` mirroring the frontend's and shares the root `.prettierrc`.
  Acceptance criteria AC1, AC2, AC2a, AC3, AC5, AC6, AC7, AC7a, AC8, AC9, AC10, AC12,
  AC13. AC15 covers every slice.

  The filter ships here even though nothing it defends against exists yet. The `offline
  generator` cannot produce an unapproved ingredient, so every check is redundant on this
  path by design — which is the point. A single filter with no bypass is easier to prove
  correct than two paths with different guarantees, and the drop-and-cascade rules of AC2
  and AC2a are unit-testable against synthetic candidates without a model in the loop.

  Three things are unowned and must be settled in the plan's open questions before any
  code is written.

  AC7a caps trouble-tagged ingredients at three, but twelve of the thirteen neutral pool
  entries carry tags of their own. For `worried` the pool alone contributes flour, salt,
  a smooth pebble and a scrap of tissue paper — four — before the one to three deliberate
  matches. `sad` and `bored` fail the same way. The offline generator's own construction
  rule breaks the criterion, so either the cap counts only the deliberate matches or AC7a
  changes.

  AC7a also has no component. It is not one of the filter's four checks, and it cannot
  simply become the fifth: the architecture states the offline potion can only pass the
  filter, and that stops being true the moment AC7a can reject. The same gap applies to
  the trouble-to-feeling-tag mapping AC7a rests on — free text in, tag out, and nothing
  in the component table owns it.

  AC2a cascades a dropped ingredient into the steps. That is clean if a step structurally
  references the ingredients it uses, and substring matching on child-facing prose if not.
  The step shape is the decision underneath it.

  Two smaller ones for the ingredient data: `hopeful` is used as a tag but is missing from
  the tag list — sixteen listed plus `hopeful` is the seventeen the starter kit counts on —
  and `base` on the water is a pseudo-tag that needs somewhere to live in the data model.

- [ ] let the witch write it | stack:full

  Adds the `witch generator`: the versioned prompt file, the Claude call, reply parsing,
  the request timeout, and generator selection on whether the key is present. Every
  failure on this path — timeout, malformed reply, schema mismatch, too few surviving
  ingredients — degrades to the offline potion rather than surfacing an error.
  Acceptance criteria AC11, plus AC1 to AC5 and AC13 re-proven on the Claude path.

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
