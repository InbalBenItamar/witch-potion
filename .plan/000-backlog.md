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

  Web Speech API in the browser, no API cost, no server round trip. Must degrade to
  the text box on Safari and Firefox rather than hiding the feature.

- [ ] animate the witch

  She reacts while the potion is brewing. Design work, no architectural change.

## DONE
