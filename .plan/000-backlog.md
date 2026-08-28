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
- [ ] brew a potion from a trouble | stack:full

  Version one end to end: text box and chips, `POST /api/potion`, both generators
  behind one interface, the filter, and the potion on screen. Acceptance criteria
  AC1 to AC15.

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
