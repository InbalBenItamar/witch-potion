# 001 — The potion on screen

Status: active
Owner: frontend agent (via Claude Code)
Last updated: 2026-09-03

## Amendment — 2026-09-03

Steps 1–11 shipped as `0123ed3`, `5bc536b`, `63b59b5` on `feat/potion-on-screen`, not yet
merged. This amendment changes how the `presenting` state looks before that merge: the
potion moves from rendering inline below the Brew button to a **full-screen view**, per
Q5 below. An overlay modal was the first design and is superseded — see Q5's revision
note. Scope, Steps 6–7, and Validation rows 8 and 10–11 are updated accordingly; nothing
else in the shipped commits changes.

Backlog task: `the potion on screen` (frontend-only — not marked `stack:full`).

## Goal

Put a real, finished-looking potion in front of two people at a table, before any
generation logic exists. One screen, one hard-coded potion, no network.

The question this slice answers is a design question, not an engineering one: does a
recipe stay readable across a table while both pairs of hands are busy and messy? That
cannot be answered from a spec, and it is much cheaper to answer now than after the
service exists and the layout is load-bearing.

It also establishes `frontend/` and the toolchain both packages will follow.

## Scope

In scope:
- Scaffold `frontend/` — Vite, React, TypeScript, Tailwind v4, Vitest, React Testing
  Library, Playwright.
- The repository toolchain: `eslint` 10, `typescript-eslint` 8, `prettier` 3,
  `eslint-config-prettier` 10. Flat `eslint.config.js` in `frontend/`, one shared
  `.prettierrc` at the repository root.
- The screen: a `trouble` text box, a row of `chip` buttons that fill it, a Brew button,
  the emoji witch, and the `potion` rendered in full.
- The three witch states — waiting, brewing, presenting — as real application state.
- The `presenting` state replaces the text box and chips with the potion, full-screen,
  with an explicit Back control that returns to the waiting state. See Q5.
- Refusing an empty or whitespace-only trouble with a friendly message.
- Responsive down to 375px, 18px minimum text, 44×44 minimum targets.
- Acceptance criteria AC4, AC6, AC14, AC14a. AC15 applies as a gate.

Out of scope:
- `backend/`, any network call, any generator, the filter, the approved ingredient list.
  This task is not marked `stack:full` and creates no server tree.
- Potion variation and Brew again returning something different. Brew returns the same
  fixture every time, by design.
- A drawn or animated witch. Version one is an emoji placeholder.
- Persistence of any kind. Nothing is stored, here or later.
- Sound.

## Assumptions

- Node 20 or later, matching the stack fixed in `.doc/product-definition.md`.
- Tailwind v4 through `@tailwindcss/postcss`, one `globals.css`, tokens declared in
  `:root` and exposed via `@theme inline`, per `.claude/rules/ui-and-styling.md`.
- Prettier runs with its defaults, semicolons included, per `.claude/rules/code-style.md`.
- The fixture potion is assembled from real entries in `.doc/ingredient.md` and real
  approved verbs, so the layout is measured against honest ingredient-name lengths. It is
  a fixture for shape, not a second copy of the approved list — nothing in `frontend/`
  reads it as data or checks anything against it.
- The `potion` type written here is the shape the service will return in task 002, so
  that task is a swap of the data source, not a rewrite of the renderer.
- Vocabulary is fixed by `.doc/glossary.md`: `trouble`, `potion`, `ingredient`, `step`,
  `brew`, `chip`, `witch`. The button says Brew, never Submit or Generate.

## Open Questions

All four resolved on 2026-08-31, as recommended. Recorded here rather than deleted,
because each one is a decision task 002 inherits.

**Q1 — Does a `step` carry the ingredients it uses? → Yes.**

`Step` is `{ text: string; ingredient: string[] }`, where `ingredient` holds exact names
from the approved list. The UI renders `text` and ignores the rest.

The reason is AC2a, not this task. Dropping an unapproved ingredient must also drop any
step that referred only to it. With plain-string steps that check is substring matching
over child-facing prose, and it is wrong the first time a step says "the flour" rather
than "a spoonful of flour". With explicit references it is exact. The cost here is one
field in the fixture; the cost of deciding it in 002 is a renderer rewrite.

**Q2 — What do the chips say? → Six, in a child's own words.**

"my friend was mean to me" · "i'm scared of the dark" · "i miss someone" ·
"i'm bored" · "nobody picked me" · "i can't do it"

They wrap to two rows at 375px. Between them they reach `angry`, `scared`,
`missing-someone`, `bored`, `left-out` and `stuck`, so they double as a smoke test for
task 002's feeling matching. If the row will not fit at 375px, the chip count gives —
never the 44×44 target size.

**Q3 — Where does the empty-trouble refusal appear? → Inline, beside the text box.**

Not a toast. A toast vanishes, and this message is aimed at a seven-year-old reading
slowly across a table. `sonner` stays reserved for AC12 — the system failing — so the
child never sees the same channel used for "you have not typed yet" and "the brew broke".

**Q4 — Build the brewing state now? → Yes, with a short simulated delay.**

The witch has three states to look right in, and both `draw the witch` and
`animate the witch` depend on those states existing. Retrofitting a state machine under a
finished layout is the expensive version of this. The delay is deleted in task 002 when a
real request replaces it.

**Q5 — How does the child get back from the potion? → Full-screen view, not a modal.**

*Revised 2026-09-03.* The original ask was an overlay: potion in a dialog, grey
translucent backdrop, X button. Raised against it: a correct overlay modal needs a focus
trap, `aria-hidden`/`inert` on the background, scroll-lock, and right `Escape` and
backdrop-click handling — get any one wrong and it is worse than no modal, and that is a
lot of surface for a two-person, mostly-non-screen-reader audience. Decided instead:

- `presenting` replaces the text box and chips outright, full-screen, rather than
  overlaying them. No backdrop, no dialog role, no z-index.
- A single Back button returns to `waiting`, trouble text intact — the child does not
  retype it.
- `Escape` also returns to `waiting`, as a free keyboard convenience — cheap to add, no
  focus trap required to add it safely, since there is no background content to protect
  focus from.
- Focus moves to the potion's `h2` on show, and to the trouble box on Back. This is the
  one piece of focus management this design still needs, and it is simpler than a modal's
  because there is only ever one focus destination, never two competing layers.

No backdrop click, because there is no backdrop. Closing is still one-way — nothing here
reopens a closed potion, matching Product Scope's "no history" and this task's "no
variation" rule.

## Steps

1. **Scaffold.** `npm create vite@latest frontend -- --template react-ts`. Set the Node
   version floor in `frontend/package.json`.
2. **Toolchain.** Add `eslint`, `typescript-eslint`, `prettier`, `eslint-config-prettier`.
   Flat `frontend/eslint.config.js` with `eslint-config-prettier` last in the array.
   Shared `.prettierrc` at the repository root. Add `lint`, `format` and `format:check`
   scripts, plus `typecheck` running `tsc --noEmit`.
3. **Tailwind v4.** `@tailwindcss/postcss`, a single `frontend/src/globals.css`. Declare
   the type scale, spacing and colour tokens in `:root` and expose them with
   `@theme inline`. The 18px floor and the 44px target size are tokens, not values
   repeated at call sites — AC14a is then one place to change and one place to test.
4. **Types.** `frontend/src/type/potion.ts` — `Potion`, and `Step` as
   `{ text: string; ingredient: string[] }` per Q1. This is the file task 002 points at
   the service; nothing else in `frontend/` defines potion shape.
5. **Fixture.** `frontend/src/fixture/potion.ts`, one exported potion built from real
   approved ingredients and verbs, with a header comment naming task 002 as the task that
   deletes it.
6. **Components** under `frontend/src/component/`, singular per `.claude/rules/naming.md`:
   `TroubleBox`, `ChipRow`, `BrewButton`, `Witch`, `PotionCard`, `BackButton`. `ChipRow`
   renders the six chips from Q2, held in one array so the copy is edited in a single
   place. `PotionCard` gains an `onBack` prop and renders `BackButton` itself, since the
   two only ever appear together.
7. **State.** A single `brewState` of `waiting | brewing | presenting` owned by the
   screen, per Q4. The Brew button is disabled while brewing. The witch renders per state.
   `presenting` replaces the text box, chip row and Brew button with `PotionCard`,
   full-screen, per Q5's revision — not an overlay. On the transition into `presenting`,
   focus moves to the potion's `h2`; `BackButton` and `Escape` both return to `waiting`
   with the trouble text intact, moving focus back to the trouble box. The simulated
   delay lives in one function, so task 002 replaces that function rather than unpicking
   timers from the components.
8. **Refusal.** Trim the trouble; an empty result refuses inline beside the text box, per
   Q3, and never advances the state machine. No toast — `sonner` is AC12's channel only.
9. **Responsive pass.** Verify at 375px: chips wrap rather than scroll, no horizontal
   overflow anywhere, the potion stays on screen while both hands are busy.
10. **Tests.** Vitest and React Testing Library for the units below; Playwright for the
    flow and the two measurable criteria.
11. **README.** Update the status section — `frontend/` now exists and runs.

## Validation

QA's checklist. Every item is a command or a test.

| # | Check | Criterion |
|---|---|---|
| 1 | `npm run lint`, `npm run format:check`, `npx tsc --noEmit` all clean | AC15 |
| 2 | Unit — the potion renders its name, its ingredients, its steps in order, the closing line | AC7 shape |
| 3 | Unit — the never-drink-it notice is present and is not conditional on anything | AC4 |
| 4 | Unit — submitting `""` refuses with a visible message and does not enter `brewing` | AC6 |
| 5 | Unit — submitting `"   "` behaves identically to `""` | AC6 |
| 6 | Unit — clicking a chip fills the text box and does **not** brew | AC6 |
| 7 | Unit — the Brew button is disabled while `brewing` | — |
| 8 | E2E — full flow: type, brew, brewing state visible, potion replaces the form full-screen | — |
| 9 | E2E at 375×667 — `document.documentElement.scrollWidth <= clientWidth`, in both `waiting` and `presenting` | AC14 |
| 10 | E2E — every rendered potion text node, in `presenting`, computes to `font-size >= 18px` | AC14a |
| 11 | E2E — every interactive element in `presenting`, including Back, is at least 44×44 | AC14a |
| 14 | Unit — `BackButton` and `Escape` each return `brewState` to `waiting` with the typed trouble intact | Q5 |
| 15 | Unit — focus moves to the potion's `h2` on entering `presenting`, and to the trouble box on returning to `waiting` | Q5 |
| 12 | Repository check — no *shipped* file under `frontend/` other than the fixture contains an ingredient name (tests may construct realistic synthetic data), and nothing imports `.doc/ingredient.md` | scope guard |
| 13 | Unit — a 7-ingredient, 5-step potion renders every ingredient and every step, none dropped | layout risk below |

Check 12 is the one worth keeping past this task. It is the mechanical form of the rule in
`.claude/agents/frontend.md`: the frontend must never learn what is on the approved list,
because two copies of a child-safety rule is one copy too many.

## Risks

- **The fixture quietly becomes a fallback.** The failure mode is task 002 wiring the
  service and leaving the fixture as an `||` on the error path — at which point a child
  can be served a potion the filter never saw. Mitigated by keeping it in one file, by
  check 12, and by making its deletion part of 002's definition of done.
- **The layout is tuned to one potion.** A single fixture is five ingredients and four
  short steps; real potions run to seven ingredients and longer steps. Mitigated by
  testing the renderer against a maximum-length case as well as the fixture.
- **AC14a fights the 375px width.** 44×44 targets and 18px text leave little room for six
  chips. Mitigated by wrapping the chip row; if it still does not fit, the chip count is
  the thing that gives, not the target size.
- **Tailwind v4 is not v3.** No `tailwind.config.js` by default, `@theme inline` instead
  of `theme.extend`, `@tailwindcss/postcss` instead of the old plugin. Muscle memory from
  v3 produces a setup that half-works.
- **`presenting` is a second screen that AC14/AC14a must be proven against separately.**
  Passing rows 9–11 against `waiting` alone would hide a regression the potion layout
  introduces on its own — longer content, its own scroll behaviour, its own set of
  interactive targets. Full-screen removes the backdrop-shrinks-the-viewport risk an
  overlay modal would have carried, but does not remove the need to test both states.
- **The `step` shape drifts in task 002.** Q1 fixes `Step` as
  `{ text: string; ingredient: string[] }`, but nothing enforces it across the seam until
  the API contract exists. If 002's service returns bare strings, the renderer is redone
  and AC2a loses its exact check. Mitigated by 002 writing `.orchestrate/api-contract.yaml`
  from this type rather than the other way round.

## Rollout Order

One branch, `feat/potion-on-screen`. Steps run in the order listed — the toolchain before
any component, so nothing is written under a formatter that has not been chosen yet.

Merge only once every Validation row passes. Task 002 (`brew without a key`) starts from
the merged result and its first act is deleting the fixture.

## Rollback

`frontend/` and the root `.prettierrc` are entirely new; nothing existing is modified
except the README status section. Rollback is deleting the branch, or `git revert` of the
merge — there is no data, no migration, no persisted state, and no deployed surface.

The toolchain choice is separable: reverting to a different formatter is a change to
`.claude/rules/code-style.md` and one config file, and does not touch application code.
