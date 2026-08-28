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

- [ ] prepare-ahead list

  Turn a potion into a list a child can gather before they start playing. Groups
  ingredients by where they are found, and marks what an adult needs to fetch.

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
